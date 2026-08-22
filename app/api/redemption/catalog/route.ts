import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "../../../lib/auth";
import { getRedemptionCatalog, getCatalogItemById } from "../../../lib/database-helpers";

/**
 * GET /api/redemption/catalog
 * Get all redemption catalog items, optionally filtered by category
 * Note: This endpoint does not require authentication as it shows the public catalog
 */
export async function GET(request: NextRequest) {
  // Optional: Check session but don't require it
  // This allows unauthenticated users to browse the catalog
  const sessionData = await verifySession();
  
  // If you want to require auth, uncomment this:
  // if (!sessionData) {
  //   return NextResponse.json(
  //     { error: "Unauthorized" },
  //     { status: 401 }
  //   );
  // }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const itemId = searchParams.get("id");

  try {
    // Get specific item by ID
    if (itemId) {
      const item = await getCatalogItemById(parseInt(itemId));
      
      if (!item) {
        return NextResponse.json(
          { error: "Catalog item not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ item });
    }

    // Get all items, optionally filtered by category
    const items = await getRedemptionCatalog(category || undefined);

    // Group items by category
    const byCategory: Record<string, any[]> = {};
    for (const item of items) {
      if (!byCategory[item.category]) {
        byCategory[item.category] = [];
      }
      byCategory[item.category].push(item);
    }

    // Calculate statistics
    const stats = {
      total_items: items.length,
      categories: Object.keys(byCategory).length,
      min_points: items.length > 0 ? Math.min(...items.map(i => i.points_cost)) : 0,
      max_points: items.length > 0 ? Math.max(...items.map(i => i.points_cost)) : 0,
      avg_points: items.length > 0 
        ? Math.round(items.reduce((sum, i) => sum + i.points_cost, 0) / items.length)
        : 0
    };

    return NextResponse.json({
      items,
      by_category: byCategory,
      stats
    });

  } catch (error) {
    console.error("Failed to fetch redemption catalog:", error);
    return NextResponse.json(
      { error: "Failed to fetch redemption catalog" },
      { status: 500 }
    );
  }
}
