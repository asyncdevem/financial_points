import { NextResponse } from "next/server";
import { getSessionFromCookie } from "../../lib/auth";
import {
  createUserCard,
  getUserCardsWithBanks,
  getBankById,
} from "../../lib/database-helpers";
import {
  validateCardNumber,
  validateExpiry,
  validateCVV,
} from "../../lib/card-validation";

/**
 * GET /api/cards - Get all user cards with bank details
 */
export async function GET() {
  try {
    const session = await getSessionFromCookie();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const cards = await getUserCardsWithBanks(session.user.id);
    
    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Get cards error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cards - Add a new card
 */
export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookie();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const { bank_id, card_type, card_number, expiry_date, cvv, card_nickname } = data;
    
    // Validation
    if (!bank_id || !card_type || !card_number || !expiry_date || !cvv) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
    
    // Validate bank exists
    const bank = await getBankById(bank_id);
    if (!bank) {
      return NextResponse.json(
        { error: "Invalid bank ID" },
        { status: 400 }
      );
    }
    
    // Validate card number (Luhn algorithm)
    if (!validateCardNumber(card_number)) {
      return NextResponse.json(
        { error: "Invalid card number" },
        { status: 400 }
      );
    }
    
    // Validate expiry date
    if (!validateExpiry(expiry_date)) {
      return NextResponse.json(
        { error: "Invalid or expired card" },
        { status: 400 }
      );
    }
    
    // Validate CVV
    if (!validateCVV(cvv)) {
      return NextResponse.json(
        { error: "Invalid CVV (must be 3 or 4 digits)" },
        { status: 400 }
      );
    }
    
    // Validate card type
    const validCardTypes = ["Credit Card", "Debit Card"];
    if (!validCardTypes.includes(card_type)) {
      return NextResponse.json(
        { error: "Invalid card type" },
        { status: 400 }
      );
    }
    
    // Create card (encryption happens in database-helpers)
    const card = await createUserCard(
      session.user.id,
      bank_id,
      card_type,
      card_number,
      expiry_date,
      cvv,
      card_nickname
    );
    
    // Fetch with bank details for response
    const cards = await getUserCardsWithBanks(session.user.id);
    const newCard = cards.find((c: any) => c.id === card.id);
    
    return NextResponse.json(
      {
        success: true,
        message: "Card added successfully",
        card: newCard
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create card error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
