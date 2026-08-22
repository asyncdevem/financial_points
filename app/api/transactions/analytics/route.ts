import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "../../../lib/auth";
import { getUserTransactions } from "../../../lib/database-helpers";
import { getCategoryBreakdown, getTopMerchants } from "../../../lib/transaction-seeder";

/**
 * GET /api/transactions/analytics
 * Get spending analytics and insights
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
  const days = parseInt(searchParams.get("days") || "30");

  try {
    // Get transactions for the specified period
    const transactions = await getUserTransactions(sessionData.userId);
    
    // Filter by date range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filteredTransactions = transactions.filter(tx => 
      new Date(tx.transaction_date) >= cutoffDate
    );

    // Calculate analytics
    const categoryBreakdown = getCategoryBreakdown(filteredTransactions);
    const topMerchants = getTopMerchants(filteredTransactions, 10);
    
    // Calculate card performance
    const cardPerformance: Record<number, { amount: number; points: number; count: number }> = {};
    for (const tx of filteredTransactions) {
      if (!cardPerformance[tx.card_id]) {
        cardPerformance[tx.card_id] = { amount: 0, points: 0, count: 0 };
      }
      cardPerformance[tx.card_id].amount += tx.amount;
      cardPerformance[tx.card_id].points += tx.points_earned;
      cardPerformance[tx.card_id].count += 1;
    }

    // Calculate totals
    const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalPoints = filteredTransactions.reduce((sum, tx) => sum + tx.points_earned, 0);
    const avgTransaction = filteredTransactions.length > 0 
      ? Math.round(totalAmount / filteredTransactions.length)
      : 0;
    
    // Calculate points efficiency (points per PKR 100)
    const pointsEfficiency = totalAmount > 0 
      ? parseFloat(((totalPoints / totalAmount) * 100).toFixed(2))
      : 0;

    // Get monthly trends (group by month)
    const monthlyTrends: Record<string, { amount: number; points: number; count: number }> = {};
    for (const tx of filteredTransactions) {
      const monthKey = new Date(tx.transaction_date).toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = { amount: 0, points: 0, count: 0 };
      }
      monthlyTrends[monthKey].amount += tx.amount;
      monthlyTrends[monthKey].points += tx.points_earned;
      monthlyTrends[monthKey].count += 1;
    }

    return NextResponse.json({
      period: {
        days,
        start_date: cutoffDate.toISOString(),
        end_date: new Date().toISOString(),
      },
      summary: {
        total_transactions: filteredTransactions.length,
        total_amount: totalAmount,
        total_points: totalPoints,
        avg_transaction: avgTransaction,
        points_efficiency: pointsEfficiency,
      },
      category_breakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
        category,
        ...data,
        percentage: totalAmount > 0 ? parseFloat(((data.amount / totalAmount) * 100).toFixed(1)) : 0
      })).sort((a, b) => b.amount - a.amount),
      top_merchants: topMerchants,
      card_performance: Object.entries(cardPerformance).map(([cardId, data]) => ({
        card_id: parseInt(cardId),
        ...data,
        avg_points_per_transaction: data.count > 0 
          ? Math.round(data.points / data.count) 
          : 0
      })).sort((a, b) => b.points - a.points),
      monthly_trends: Object.entries(monthlyTrends).map(([month, data]) => ({
        month,
        ...data
      })).sort((a, b) => a.month.localeCompare(b.month))
    });

  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
