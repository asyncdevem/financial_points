import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "../../lib/auth";
import { 
  getUserTransactions, 
  createMockTransaction,
  getUserCards,
  getUserCardsWithBanks 
} from "../../lib/database-helpers";
import { seedUserTransactions } from "../../lib/transaction-seeder";
import { calculatePoints } from "../../lib/points-engine";

/**
 * GET /api/transactions
 * Fetch all transactions for the authenticated user
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
  const category = searchParams.get("category");
  const cardId = searchParams.get("card_id");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const transactions = await getUserTransactions(
      sessionData.userId,
      category || undefined,
      cardId ? parseInt(cardId) : undefined,
      limit,
      offset
    );

    // Calculate totals
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalPoints = transactions.reduce((sum, tx) => sum + tx.points_earned, 0);

    return NextResponse.json({
      transactions,
      summary: {
        count: transactions.length,
        total_amount: totalAmount,
        total_points: totalPoints,
      }
    });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions
 * Add a new transaction manually or seed mock transactions
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

    // Handle seeding request
    if (body.action === "seed") {
      const cards = await getUserCardsWithBanks(sessionData.userId);
      
      if (cards.length === 0) {
        return NextResponse.json(
          { error: "No cards found. Please add at least one card before seeding transactions." },
          { status: 400 }
        );
      }

      const count = body.count || 30;
      await seedUserTransactions(sessionData.userId, cards as any, count);

      return NextResponse.json({
        message: `Successfully seeded ${count} mock transactions`,
        seeded_count: count
      });
    }

    // Handle manual transaction creation
    const { card_id, merchant_name, category, amount } = body;

    // Validation
    if (!card_id || !merchant_name || !category || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: card_id, merchant_name, category, amount" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (amount > 1000000) {
      return NextResponse.json(
        { error: "Amount exceeds maximum limit (PKR 1,000,000)" },
        { status: 400 }
      );
    }

    // Get card details to calculate points
    const cards = await getUserCardsWithBanks(sessionData.userId);
    const card = cards.find((c: any) => c.id === card_id);

    if (!card) {
      return NextResponse.json(
        { error: "Card not found or does not belong to user" },
        { status: 404 }
      );
    }

    // Calculate points earned using centralized engine
    const multiplier = (card as any).category_multipliers[category] || 1;
    const pointsEarned = calculatePoints(amount, (card as any).base_reward_rate, multiplier);

    // Create transaction
    const transaction = await createMockTransaction(
      sessionData.userId,
      card_id,
      merchant_name,
      category,
      amount,
      pointsEarned,
      new Date(),
      true // User-added
    );

    return NextResponse.json({
      message: "Transaction added successfully",
      transaction,
      points_earned: pointsEarned
    }, { status: 201 });

  } catch (error) {
    console.error("Failed to create transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
