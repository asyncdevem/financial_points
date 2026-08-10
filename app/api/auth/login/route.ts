import { NextResponse } from "next/server";
import {
  findUserByEmail,
  verifyPassword,
  createJWT,
  setSessionCookie,
  createSession,
  cleanupExpiredSessions,
} from "../../../lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user
    const user = await findUserByEmail(email.toLowerCase());
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Cleanup expired sessions
    await cleanupExpiredSessions();

    // Create JWT token
    const token = await createJWT(user.id);

    // Create session in database (returns UUID)
    const sessionId = await createSession(user.id);

    // Set cookies
    await setSessionCookie(token, sessionId);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
