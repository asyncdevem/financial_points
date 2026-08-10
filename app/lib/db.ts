import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const sql = neon(process.env.DATABASE_URL);

export type User = {
  id: number;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
};

export type Session = {
  id: string;
  user_id: number;
  last_activity_at: Date;
  created_at: Date;
  expires_at: Date;
};

export type UserPreferences = {
  id: number;
  user_id: number;
  preferences: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
};
