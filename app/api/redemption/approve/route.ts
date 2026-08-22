import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "../../../lib/auth";
import { approveRedemption, completeRedemption } from "../../../lib/database-helpers";

/**
 * POST /api/redemption/approve
 * Approve or complete a pending redemption
 * (Admin-only in production, but for demo purposes we'll allow any authenticated user)
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
    const { redemption_id, action, notes } = body;

    // Validation
    if (!redemption_id || !action) {
      return NextResponse.json(
        { error: "Missing required fields: redemption_id, action" },
        { status: 400 }
      );
    }

    if (!["approve", "complete"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'complete'" },
        { status: 400 }
      );
    }

    let redemption;

    if (action === "approve") {
      redemption = await approveRedemption(redemption_id, notes);
    } else {
      redemption = await completeRedemption(redemption_id);
    }

    return NextResponse.json({
      message: `Redemption ${action}d successfully`,
      redemption
    });

  } catch (error) {
    console.error("Failed to update redemption:", error);
    return NextResponse.json(
      { error: "Failed to update redemption" },
      { status: 500 }
    );
  }
}
