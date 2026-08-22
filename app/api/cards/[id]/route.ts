import { NextResponse } from "next/server";
import { getSessionFromCookie } from "../../../lib/auth";
import { deleteUserCard, getUserCardWithBank } from "../../../lib/database-helpers";

/**
 * DELETE /api/cards/[id] - Delete a card
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const cardId = parseInt(id, 10);
    
    if (isNaN(cardId)) {
      return NextResponse.json(
        { error: "Invalid card ID" },
        { status: 400 }
      );
    }
    
    // Verify card belongs to user
    const card = await getUserCardWithBank(cardId);
    
    if (!card) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }
    
    if (card.user_id !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
    
    // Soft delete (sets is_active to false)
    await deleteUserCard(cardId, session.user.id);
    
    return NextResponse.json({
      success: true,
      message: "Card deleted successfully"
    });
  } catch (error) {
    console.error("Delete card error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
