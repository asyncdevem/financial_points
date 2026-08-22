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

export type UserProfile = {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  address: string;
  date_of_birth: Date;
  income_bracket: string;
  created_at: Date;
  updated_at: Date;
};

export type PakistaniBank = {
  id: number;
  slug: string;
  name: string;
  logo_url: string | null;
  card_types: string[];
  base_reward_rate: number;
  category_multipliers: Record<string, number>;
  is_active: boolean;
  created_at: Date;
};

export type UserCard = {
  id: number;
  user_id: number;
  bank_id: number;
  card_type: string;
  encrypted_card_number: string;
  last_four: string;
  expiry_date: string;
  cvv_hash: string;
  card_nickname: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type MockTransaction = {
  id: number;
  user_id: number;
  card_id: number;
  merchant_name: string;
  category: string;
  amount: number;
  points_earned: number;
  transaction_date: Date;
  is_user_added: boolean;
  created_at: Date;
};

export type RedemptionCatalogItem = {
  id: number;
  title: string;
  description: string;
  category: string;
  points_cost: number;
  image_url: string | null;
  stock_quantity: number | null;
  is_active: boolean;
  provider: string | null;
  estimated_delivery_days: number | null;
  created_at: Date;
  updated_at: Date;
};

export type Redemption = {
  id: number;
  user_id: number;
  catalog_item_id: number;
  points_spent: number;
  status: "instant" | "pending" | "approved" | "rejected" | "completed";
  approval_notes: string | null;
  redemption_date: Date;
  approved_at: Date | null;
  completed_at: Date | null;
  delivery_address: string | null;
  created_at: Date;
};

export type OnboardingProgress = {
  id: number;
  user_id: number;
  profile_completed: boolean;
  card_added: boolean;
  preferences_set: boolean;
  tutorial_completed: boolean;
  onboarding_completed: boolean;
  current_step: number;
  created_at: Date;
  updated_at: Date;
};
