import { NextResponse } from "next/server";
import { getSessionFromCookie, clearSessionCookie, deleteSession } from "../../../lib/auth";

export async function POST() {
  try {
    const session = await getSessionFromCookie();

    if (session) {
      // Delete session from database
      await deleteSession(session.sessionId);
    }

    // Clear cookie
    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
