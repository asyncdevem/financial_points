import { NextResponse } from "next/server";
import { getSessionFromCookie, updateSessionActivity } from "../../../lib/auth";

export async function GET() {
  try {
    const session = await getSessionFromCookie();

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Update session activity
    await updateSessionActivity(session.sessionId);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
      },
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
