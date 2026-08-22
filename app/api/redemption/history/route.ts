import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "../../../lib/auth";
import { getUserRedemptions } from "../../../lib/database-helpers";

/**
 * GET /api/redemption/history
 * Get user's redemption history
 */
export async function GET(request: NextRequest) {
  const sessionData = await verifySession();
  
  if (!sessionData) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    const redemptions = await getUserRedemptions(sessionData.userId) as any[];

    // Filter by status if provided
    let filteredRedemptions = redemptions;
    if (status) {
      filteredRedemptions = redemptions.filter(r => r.status === status);
    }

    // Calculate statistics
    const totalPointsSpent = redemptions.reduce((sum, r) => sum + r.points_spent, 0);
    const statusCounts = {
      instant: redemptions.filter(r => r.status === "instant").length,
      pending: redemptions.filter(r => r.status === "pending").length,
      approved: redemptions.filter(r => r.status === "approved").length,
      completed: redemptions.filter(r => r.status === "completed").length,
      rejected: redemptions.filter(r => r.status === "rejected").length,
    };

    // Group by category
    const byCategory: Record<string, number> = {};
    for (const redemption of redemptions) {
      const category = redemption.item_category || "other";
      byCategory[category] = (byCategory[category] || 0) + redemption.points_spent;
    }

    return NextResponse.json({
      redemptions: filteredRedemptions,
      summary: {
        total_redemptions: redemptions.length,
        total_points_spent: totalPointsSpent,
        status_counts: statusCounts,
        by_category: byCategory
      }
    });

  } catch (error) {
    console.error("Failed to fetch redemption history:", error);
    return NextResponse.json(
      { error: "Failed to fetch redemption history" },
      { status: 500 }
    );
  }
}
