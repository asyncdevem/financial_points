import { sql } from "./db";
import type {
  UserProfile,
  UserCard,
  PakistaniBank,
  MockTransaction,
  RedemptionCatalogItem,
  Redemption,
  OnboardingProgress,
} from "./db";
import { encrypt, decrypt, hash, getLastFour } from "./crypto";

/**
 * User Profile Operations
 */
export async function createUserProfile(
  userId: number,
  data: Omit<UserProfile, "id" | "user_id" | "created_at" | "updated_at">
): Promise<UserProfile> {
  const result = await sql`
    INSERT INTO user_profiles (user_id, full_name, phone, address, date_of_birth, income_bracket)
    VALUES (${userId}, ${data.full_name}, ${data.phone}, ${data.address}, ${data.date_of_birth}, ${data.income_bracket})
    RETURNING *
  `;
  return result[0] as UserProfile;
}

export async function getUserProfile(userId: number): Promise<UserProfile | null> {
  const result = await sql`
    SELECT * FROM user_profiles WHERE user_id = ${userId} LIMIT 1
  `;
  return result.length > 0 ? (result[0] as UserProfile) : null;
}

export async function updateUserProfile(
  userId: number,
  data: Partial<Omit<UserProfile, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<UserProfile> {
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.full_name) {
    updates.push(`full_name = $${values.length + 1}`);
    values.push(data.full_name);
  }
  if (data.phone) {
    updates.push(`phone = $${values.length + 1}`);
    values.push(data.phone);
  }
  if (data.address) {
    updates.push(`address = $${values.length + 1}`);
    values.push(data.address);
  }
  if (data.date_of_birth) {
    updates.push(`date_of_birth = $${values.length + 1}`);
    values.push(data.date_of_birth);
  }
  if (data.income_bracket) {
    updates.push(`income_bracket = $${values.length + 1}`);
    values.push(data.income_bracket);
  }
  
  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);
  
  const result = await sql`
    UPDATE user_profiles 
    SET ${sql.unsafe(updates.join(", "))}
    WHERE user_id = ${userId}
    RETURNING *
  `;
  return result[0] as UserProfile;
}

/**
 * Pakistani Banks Operations
 */
export async function getAllBanks(): Promise<PakistaniBank[]> {
  const result = await sql`
    SELECT * FROM pakistani_banks WHERE is_active = TRUE ORDER BY name
  `;
  return result as PakistaniBank[];
}

export async function getBankById(bankId: number): Promise<PakistaniBank | null> {
  const result = await sql`
    SELECT * FROM pakistani_banks WHERE id = ${bankId} LIMIT 1
  `;
  return result.length > 0 ? (result[0] as PakistaniBank) : null;
}

export async function getBankBySlug(slug: string): Promise<PakistaniBank | null> {
  const result = await sql`
    SELECT * FROM pakistani_banks WHERE slug = ${slug} LIMIT 1
  `;
  return result.length > 0 ? (result[0] as PakistaniBank) : null;
}

/**
 * User Cards Operations
 */
export async function createUserCard(
  userId: number,
  bankId: number,
  cardType: string,
  cardNumber: string,
  expiryDate: string,
  cvv: string,
  nickname?: string
): Promise<UserCard> {
  const encryptedNumber = encrypt(cardNumber);
  const lastFour = getLastFour(cardNumber);
  const cvvHash = hash(cvv);
  
  const result = await sql`
    INSERT INTO user_cards (user_id, bank_id, card_type, encrypted_card_number, last_four, expiry_date, cvv_hash, card_nickname)
    VALUES (${userId}, ${bankId}, ${cardType}, ${encryptedNumber}, ${lastFour}, ${expiryDate}, ${cvvHash}, ${nickname || null})
    RETURNING *
  `;
  return result[0] as UserCard;
}

export async function getUserCards(userId: number): Promise<UserCard[]> {
  const result = await sql`
    SELECT * FROM user_cards WHERE user_id = ${userId} AND is_active = TRUE ORDER BY created_at DESC
  `;
  return result as UserCard[];
}

export async function getUserCardWithBank(cardId: number) {
  const result = await sql`
    SELECT 
      uc.*,
      pb.name as bank_name,
      pb.slug as bank_slug,
      pb.logo_url,
      pb.base_reward_rate,
      pb.category_multipliers
    FROM user_cards uc
    JOIN pakistani_banks pb ON uc.bank_id = pb.id
    WHERE uc.id = ${cardId}
    LIMIT 1
  `;
  return result.length > 0 ? result[0] : null;
}

export async function getUserCardsWithBanks(userId: number) {
  const result = await sql`
    SELECT 
      uc.*,
      pb.name as bank_name,
      pb.slug as bank_slug,
      pb.logo_url,
      pb.base_reward_rate,
      pb.category_multipliers
    FROM user_cards uc
    JOIN pakistani_banks pb ON uc.bank_id = pb.id
    WHERE uc.user_id = ${userId} AND uc.is_active = TRUE
    ORDER BY uc.created_at DESC
  `;
  return result;
}

export async function deleteUserCard(cardId: number, userId: number): Promise<void> {
  await sql`
    UPDATE user_cards SET is_active = FALSE WHERE id = ${cardId} AND user_id = ${userId}
  `;
}

export async function decryptCardNumber(encryptedNumber: string): Promise<string> {
  return decrypt(encryptedNumber);
}

/**
 * Onboarding Progress Operations
 */
export async function createOnboardingProgress(userId: number): Promise<OnboardingProgress> {
  const result = await sql`
    INSERT INTO onboarding_progress (user_id)
    VALUES (${userId})
    ON CONFLICT (user_id) DO NOTHING
    RETURNING *
  `;
  return result[0] as OnboardingProgress;
}

export async function getOnboardingProgress(userId: number): Promise<OnboardingProgress | null> {
  const result = await sql`
    SELECT * FROM onboarding_progress WHERE user_id = ${userId} LIMIT 1
  `;
  return result.length > 0 ? (result[0] as OnboardingProgress) : null;
}

export async function updateOnboardingProgress(
  userId: number,
  updates: Partial<Omit<OnboardingProgress, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<OnboardingProgress> {
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.profile_completed !== undefined) {
    fields.push(`profile_completed = $${values.length + 1}`);
    values.push(updates.profile_completed);
  }
  if (updates.card_added !== undefined) {
    fields.push(`card_added = $${values.length + 1}`);
    values.push(updates.card_added);
  }
  if (updates.preferences_set !== undefined) {
    fields.push(`preferences_set = $${values.length + 1}`);
    values.push(updates.preferences_set);
  }
  if (updates.tutorial_completed !== undefined) {
    fields.push(`tutorial_completed = $${values.length + 1}`);
    values.push(updates.tutorial_completed);
  }
  if (updates.onboarding_completed !== undefined) {
    fields.push(`onboarding_completed = $${values.length + 1}`);
    values.push(updates.onboarding_completed);
  }
  if (updates.current_step !== undefined) {
    fields.push(`current_step = $${values.length + 1}`);
    values.push(updates.current_step);
  }
  
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);
  
  const result = await sql`
    UPDATE onboarding_progress 
    SET ${sql.unsafe(fields.join(", "))}
    WHERE user_id = ${userId}
    RETURNING *
  `;
  return result[0] as OnboardingProgress;
}

/**
 * Mock Transactions Operations
 */
export async function createMockTransaction(
  userId: number,
  cardId: number,
  merchantName: string,
  category: string,
  amount: number,
  pointsEarned: number,
  transactionDate: Date,
  isUserAdded = false
): Promise<MockTransaction> {
  const result = await sql`
    INSERT INTO mock_transactions (user_id, card_id, merchant_name, category, amount, points_earned, transaction_date, is_user_added)
    VALUES (${userId}, ${cardId}, ${merchantName}, ${category}, ${amount}, ${pointsEarned}, ${transactionDate.toISOString()}, ${isUserAdded})
    RETURNING *
  `;
  return result[0] as MockTransaction;
}

export async function getUserTransactions(
  userId: number,
  category?: string,
  cardId?: number,
  limit = 100,
  offset = 0
): Promise<MockTransaction[]> {
  let query = `SELECT * FROM mock_transactions WHERE user_id = ${userId}`;
  
  if (category) {
    query += ` AND category = '${category}'`;
  }
  
  if (cardId) {
    query += ` AND card_id = ${cardId}`;
  }
  
  query += ` ORDER BY transaction_date DESC LIMIT ${limit} OFFSET ${offset}`;
  
  const result = await sql.unsafe(query);
  return result as unknown as MockTransaction[];
}

export async function getUserTransactionsWithCards(userId: number, limit = 100) {
  const result = await sql`
    SELECT 
      mt.*,
      uc.last_four,
      uc.card_type,
      pb.name as bank_name,
      pb.slug as bank_slug
    FROM mock_transactions mt
    JOIN user_cards uc ON mt.card_id = uc.id
    JOIN pakistani_banks pb ON uc.bank_id = pb.id
    WHERE mt.user_id = ${userId}
    ORDER BY mt.transaction_date DESC
    LIMIT ${limit}
  `;
  return result;
}

/**
 * Redemption Catalog Operations
 */
export async function getRedemptionCatalog(category?: string): Promise<RedemptionCatalogItem[]> {
  if (category) {
    const result = await sql`
      SELECT * FROM redemption_catalog 
      WHERE is_active = TRUE AND category = ${category}
      ORDER BY points_cost ASC
    `;
    return result as RedemptionCatalogItem[];
  }
  
  const result = await sql`
    SELECT * FROM redemption_catalog WHERE is_active = TRUE ORDER BY category, points_cost ASC
  `;
  return result as RedemptionCatalogItem[];
}

export async function getCatalogItemById(itemId: number): Promise<RedemptionCatalogItem | null> {
  const result = await sql`
    SELECT * FROM redemption_catalog WHERE id = ${itemId} LIMIT 1
  `;
  return result.length > 0 ? (result[0] as RedemptionCatalogItem) : null;
}

/**
 * Redemptions Operations
 */
export async function createRedemption(
  userId: number,
  catalogItemId: number,
  pointsSpent: number,
  deliveryAddress?: string
): Promise<Redemption> {
  // Determine status based on points (instant ≤5000, pending >5000)
  const status = pointsSpent <= 5000 ? "instant" : "pending";
  const completedAt = status === "instant" ? new Date().toISOString() : null;
  
  const result = await sql`
    INSERT INTO redemptions (user_id, catalog_item_id, points_spent, status, delivery_address, completed_at)
    VALUES (${userId}, ${catalogItemId}, ${pointsSpent}, ${status}, ${deliveryAddress || null}, ${completedAt})
    RETURNING *
  `;
  return result[0] as Redemption;
}

export async function getUserRedemptions(userId: number): Promise<Redemption[]> {
  const result = await sql`
    SELECT 
      r.*,
      rc.title as item_title,
      rc.category as item_category,
      rc.image_url as item_image_url,
      rc.provider as item_provider,
      rc.estimated_delivery_days
    FROM redemptions r
    JOIN redemption_catalog rc ON r.catalog_item_id = rc.id
    WHERE r.user_id = ${userId}
    ORDER BY r.redemption_date DESC
  `;
  return result as any[];
}

export async function approveRedemption(redemptionId: number, notes?: string): Promise<Redemption> {
  const result = await sql`
    UPDATE redemptions
    SET status = 'approved', approved_at = CURRENT_TIMESTAMP, approval_notes = ${notes || null}
    WHERE id = ${redemptionId}
    RETURNING *
  `;
  return result[0] as Redemption;
}

export async function completeRedemption(redemptionId: number): Promise<Redemption> {
  const result = await sql`
    UPDATE redemptions
    SET status = 'completed', completed_at = CURRENT_TIMESTAMP
    WHERE id = ${redemptionId}
    RETURNING *
  `;
  return result[0] as Redemption;
}
