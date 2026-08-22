import { NextResponse } from "next/server";
import { getAllBanks } from "../../lib/database-helpers";

/**
 * GET /api/banks - Get all Pakistani banks
 */
export async function GET() {
  try {
    const banks = await getAllBanks();
    
    return NextResponse.json({ banks });
  } catch (error) {
    console.error("Get banks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
