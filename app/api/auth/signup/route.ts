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

    // Create JWT token
    const token = await createJWT(user.id);

    // Create session in database (returns UUID)
    const sessionId = await createSession(user.id);

    // Set cookies
    await setSessionCookie(token, sessionId);

    // Initialize user preferences
    await sql`
      INSERT INTO user_preferences (user_id)
      VALUES (${user.id})
    `;

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
