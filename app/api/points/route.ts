import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "../../lib/auth";
import { getUserTransactions, getUserCardsWithBanks, getUserRedemptions } from "../../lib/database-helpers";

/**
 * GET /api/points
 * Get total points balance and breakdown by card
 */
export async function GET(request: NextRequest) {
  const sessionData = await verifySession();
  
  if (!sessionData) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Get all transactions
    const transactions = await getUserTransactions(sessionData.userId);
    
    // Get all cards with bank info
    const cards = await getUserCardsWithBanks(sessionData.userId);

    // Get all redemptions
    const redemptions = await getUserRedemptions(sessionData.userId);

    // Calculate points by card
    const pointsByCard: Record<number, { 
      earned: number; 
      redeemed: number; 
      balance: number;
      card_name: string;
      last_four: string;
    }> = {};

    // Initialize with cards
    for (const card of cards) {
      pointsByCard[card.id] = {
        earned: 0,
        redeemed: 0,
        balance: 0,
        card_name: card.bank_name,
        last_four: card.last_four
      };
    }

    // Sum up earned points from transactions
    for (const tx of transactions) {
      if (pointsByCard[tx.card_id]) {
        pointsByCard[tx.card_id].earned += tx.points_earned;
      }
    }

    // Calculate total redeemed points (all redemptions count against total balance)
    const totalRedeemed = redemptions.reduce((sum, r) => sum + r.points_spent, 0);

    // Calculate balance (earned - redeemed)
    // Note: Redemptions are account-wide, not card-specific
    const totalEarned = Object.values(pointsByCard).reduce((sum, card) => sum + card.earned, 0);
    const totalBalance = totalEarned - totalRedeemed;

    // Distribute redeemed amount proportionally across cards for display purposes
    for (const cardId in pointsByCard) {
      const data = pointsByCard[cardId];
      const proportion = totalEarned > 0 ? data.earned / totalEarned : 0;
      data.redeemed = Math.round(totalRedeemed * proportion);
      data.balance = data.earned - data.redeemed;
    }

    // Estimate PKR value (1 point ≈ PKR 1)
    const estimatedValue = totalBalance;

    return NextResponse.json({
      total: {
        earned: totalEarned,
        redeemed: totalRedeemed,
        balance: totalBalance,
        estimated_value_pkr: estimatedValue
      },
      by_card: Object.entries(pointsByCard).map(([cardId, data]) => ({
        card_id: parseInt(cardId),
        ...data,
        percentage: totalBalance > 0 
          ? parseFloat(((data.balance / totalBalance) * 100).toFixed(1))
          : 0
      })).sort((a, b) => b.balance - a.balance),
      last_updated: new Date().toISOString()
    });

  } catch (error) {
    console.error("Failed to fetch points:", error);
    return NextResponse.json(
      { error: "Failed to fetch points" },
      { status: 500 }
    );
  }
}
