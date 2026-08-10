import bcrypt from "bcryptjs";
import * as jose from "jose";
import { cookies } from "next/headers";
import { sql } from "./db";
import type { User } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production",
);
const SESSION_TIMEOUT = parseInt(
  process.env.SESSION_TIMEOUT_MINUTES || "15",
  10,
);

export type AuthUser = Omit<User, "password_hash">;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createJWT(userId: number): Promise<string> {
  const token = await new jose.SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TIMEOUT}m`)
    .sign(JWT_SECRET);
  return token;
}

export async function verifyJWT(
  token: string,
): Promise<{ userId: number } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return { userId: payload.userId as number };
  } catch {
    return null;
  }
}

export async function createUser(
  email: string,
  password: string,
): Promise<AuthUser> {
  const passwordHash = await hashPassword(password);
  const result = await sql`
    INSERT INTO users (email, password_hash)
    VALUES (${email}, ${passwordHash})
    RETURNING id, email, created_at, updated_at
  `;
  return result[0] as AuthUser;
}

export async function findUserByEmail(
  email: string,
): Promise<User | null> {
  const result = await sql`
    SELECT id, email, password_hash, created_at, updated_at
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;
  return result.length > 0 ? (result[0] as User) : null;
}

export async function findUserById(userId: number): Promise<AuthUser | null> {
  const result = await sql`
    SELECT id, email, created_at, updated_at
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;
  return result.length > 0 ? (result[0] as AuthUser) : null;
}

export async function createSession(userId: number): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_TIMEOUT * 60 * 1000);
  const result = await sql`
    INSERT INTO sessions (user_id, expires_at)
    VALUES (${userId}, ${expiresAt.toISOString()})
    RETURNING id
  `;
  return result[0].id as string;
}

export async function updateSessionActivity(sessionId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_TIMEOUT * 60 * 1000);
  await sql`
    UPDATE sessions
    SET last_activity_at = CURRENT_TIMESTAMP,
        expires_at = ${expiresAt.toISOString()}
    WHERE id = ${sessionId}
  `;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await sql`
    DELETE FROM sessions
    WHERE id = ${sessionId}
  `;
}

export async function cleanupExpiredSessions(): Promise<void> {
  await sql`
    DELETE FROM sessions
    WHERE expires_at < CURRENT_TIMESTAMP
  `;
}

export async function getSessionFromCookie(): Promise<{
  user: AuthUser;
  sessionId: string;
} | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;
  const token = cookieStore.get("session")?.value;

  if (!token || !sessionId) {
    return null;
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return null;
  }

  const user = await findUserById(payload.userId);
  if (!user) {
    return null;
  }

  return { user, sessionId };
}

export async function setSessionCookie(
  token: string,
  sessionId: string,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TIMEOUT * 60,
    path: "/",
  });
  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TIMEOUT * 60,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete("session_id");
}
