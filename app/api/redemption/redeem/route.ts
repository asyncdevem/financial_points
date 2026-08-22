import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "../../../lib/auth";
import { 
  getCatalogItemById, 
  createRedemption,
  getUserTransactions 
} from "../../../lib/database-helpers";
import { validateSufficientPoints } from "../../../lib/points-engine";

/**
 * POST /api/redemption/redeem
 * Redeem points for a catalog item
 */
export async function POST(request: NextRequest) {
  const sessionData = await verifySession();
  
  if (!sessionData) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { catalog_item_id, delivery_address } = body;

    // Validation
    if (!catalog_item_id) {
      return NextResponse.json(
        { error: "Missing required field: catalog_item_id" },
        { status: 400 }
      );
    }

    // Get catalog item
    const catalogItem = await getCatalogItemById(catalog_item_id);
    
    if (!catalogItem) {
      return NextResponse.json(
        { error: "Catalog item not found" },
        { status: 404 }
      );
    }

    if (!catalogItem.is_active) {
      return NextResponse.json(
        { error: "This item is no longer available for redemption" },
        { status: 400 }
      );
    }

    // Check if delivery address is required (for physical items)
    // Assuming physical items need delivery address
    const requiresDelivery = ["Gift Cards", "Vouchers", "Merchandise"].includes(catalogItem.category);
    if (requiresDelivery && !delivery_address) {
      return NextResponse.json(
        { error: "Delivery address is required for this item" },
        { status: 400 }
      );
    }

    // Calculate user's available points
    const transactions = await getUserTransactions(sessionData.userId);
    const totalEarnedPoints = transactions.reduce((sum, tx) => sum + tx.points_earned, 0);
    
    // TODO: In Task 13, we'll subtract redeemed points from redemptions table
    // For now, assume no redemptions yet
    const availablePoints = totalEarnedPoints;

    // Validate sufficient points using centralized engine
    const validation = validateSufficientPoints(availablePoints, catalogItem.points_cost);
    
    if (!validation.sufficient) {
      return NextResponse.json(
        { 
          error: "Insufficient points",
          required: catalogItem.points_cost,
          available: availablePoints,
          shortage: validation.shortage
        },
        { status: 400 }
      );
    }

    // Create redemption
    const redemption = await createRedemption(
      sessionData.userId,
      catalog_item_id,
      catalogItem.points_cost,
      delivery_address
    );

    // Calculate new balance
    const newBalance = availablePoints - catalogItem.points_cost;

    return NextResponse.json({
      message: "Redemption successful",
      redemption: {
        id: redemption.id,
        status: redemption.status,
        points_spent: redemption.points_spent,
        redemption_date: redemption.redemption_date,
        estimated_delivery: redemption.status === "instant" 
          ? "Instant" 
          : catalogItem.estimated_delivery_days 
            ? `${catalogItem.estimated_delivery_days} days`
            : "Pending approval"
      },
      item: {
        title: catalogItem.title,
        category: catalogItem.category,
        provider: catalogItem.provider
      },
      balance: {
        previous: availablePoints,
        spent: catalogItem.points_cost,
        remaining: newBalance
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Failed to process redemption:", error);
    return NextResponse.json(
      { error: "Failed to process redemption" },
      { status: 500 }
    );
  }
}
