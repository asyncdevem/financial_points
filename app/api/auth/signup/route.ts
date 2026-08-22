import { NextResponse } from "next/server";
import { createUser, createJWT, setSessionCookie, createSession } from "../../../lib/auth";
import { sql } from "../../../lib/db";

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

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Create user
    const user = await createUser(email.toLowerCase(), password);

    // Create session in database (returns UUID)
    const sessionId = await createSession(user.id);

    // Create JWT token with sessionId
    const token = await createJWT(user.id, sessionId);

    // Initialize user preferences
    await sql`
      INSERT INTO user_preferences (user_id)
      VALUES (${user.id})
    `;

    // Initialize onboarding progress
    await sql`
      INSERT INTO onboarding_progress (user_id)
      VALUES (${user.id})
    `;

    // Create response with user data
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 201 },
    );

    // Set cookie on response
    response.cookies.set("fp_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
