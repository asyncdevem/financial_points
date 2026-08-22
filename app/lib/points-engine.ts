/**
 * Points Calculation Engine
 * 
 * Central utility for calculating loyalty points across the application.
 * Ensures consistent point calculation logic everywhere.
 * 
 * Formula: Points = (Amount / 100) × Base Rate × Category Multiplier
 * 
 * Example:
 * - Amount: PKR 5,000
 * - Base Rate: 2 (2% base reward)
 * - Category Multiplier: 3x for dining
 * - Points = (5000 / 100) × 2 × 3 = 300 points
 */

/**
 * Calculate points earned for a transaction
 * 
 * @param amount - Transaction amount in PKR
 * @param baseRewardRate - Base reward rate (percentage points per PKR 100)
 * @param categoryMultiplier - Category-specific multiplier (1x, 2x, 3x, etc.)
 * @returns Points earned (rounded down to nearest integer)
 */
export function calculatePoints(
  amount: number,
  baseRewardRate: number,
  categoryMultiplier: number = 1
): number {
  if (amount <= 0 || baseRewardRate <= 0 || categoryMultiplier <= 0) {
    return 0;
  }

  // Formula: (amount / 100) × base_rate × multiplier
  // Math.floor ensures we always round down (never overpay points)
  return Math.floor((amount / 100) * baseRewardRate * categoryMultiplier);
}

/**
 * Calculate points for multiple cards to find the best one
 * 
 * @param amount - Transaction amount in PKR
 * @param category - Transaction category
 * @param cards - Array of cards with their reward structures
 * @returns Array of cards with calculated points, sorted by points (highest first)
 */
export function calculateBestCard(
  amount: number,
  category: string,
  cards: Array<{
    id: number;
    base_reward_rate: number;
    category_multipliers: Record<string, number>;
    [key: string]: any;
  }>
) {
  return cards
    .map(card => {
      const multiplier = card.category_multipliers[category] || 1;
      const points = calculatePoints(amount, card.base_reward_rate, multiplier);
      
      return {
        ...card,
        calculated_points: points,
        calculated_multiplier: multiplier,
        calculated_value_pkr: points // 1 point ≈ PKR 1
      };
    })
    .sort((a, b) => b.calculated_points - a.calculated_points);
}

/**
 * Calculate opportunity cost (missed points)
 * 
 * @param bestPoints - Points from the optimal card
 * @param actualPoints - Points from the card actually used
 * @returns Missed points (opportunity cost)
 */
export function calculateOpportunityCost(
  bestPoints: number,
  actualPoints: number
): number {
  const missed = bestPoints - actualPoints;
  return missed > 0 ? missed : 0;
}

/**
 * Calculate points efficiency (points per PKR 100 spent)
 * 
 * @param totalPoints - Total points earned
 * @param totalAmount - Total amount spent in PKR
 * @returns Points efficiency (points per PKR 100), rounded to 2 decimals
 */
export function calculatePointsEfficiency(
  totalPoints: number,
  totalAmount: number
): number {
  if (totalAmount <= 0) {
    return 0;
  }

  return parseFloat(((totalPoints / totalAmount) * 100).toFixed(2));
}

/**
 * Estimate PKR value of points
 * 
 * Current conversion: 1 point ≈ PKR 1
 * This can be adjusted based on redemption catalog average values
 * 
 * @param points - Number of points
 * @param conversionRate - Points to PKR conversion rate (default: 1)
 * @returns Estimated PKR value
 */
export function estimatePointsValue(
  points: number,
  conversionRate: number = 1
): number {
  return Math.floor(points * conversionRate);
}

/**
 * Determine if a redemption is instant or requires approval
 * 
 * Business Rule: Redemptions ≤ 5,000 points are instant
 *                Redemptions > 5,000 points require approval
 * 
 * @param pointsCost - Points cost of redemption
 * @returns Redemption status ("instant" or "pending")
 */
export function getRedemptionStatus(
  pointsCost: number
): "instant" | "pending" {
  return pointsCost <= 5000 ? "instant" : "pending";
}

/**
 * Validate if user has sufficient points for redemption
 * 
 * @param availablePoints - User's available point balance
 * @param requiredPoints - Points required for redemption
 * @returns Object with validation result and shortage amount
 */
export function validateSufficientPoints(
  availablePoints: number,
  requiredPoints: number
): {
  sufficient: boolean;
  shortage: number;
} {
  const sufficient = availablePoints >= requiredPoints;
  const shortage = sufficient ? 0 : requiredPoints - availablePoints;
  
  return { sufficient, shortage };
}

/**
 * Calculate category breakdown for analytics
 * 
 * @param transactions - Array of transactions with category and points
 * @returns Category breakdown with totals
 */
export function calculateCategoryBreakdown(
  transactions: Array<{
    category: string;
    amount: number;
    points_earned: number;
  }>
): Record<string, { amount: number; points: number; count: number; percentage: number }> {
  const breakdown: Record<string, { amount: number; points: number; count: number; percentage: number }> = {};
  
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  for (const tx of transactions) {
    if (!breakdown[tx.category]) {
      breakdown[tx.category] = { amount: 0, points: 0, count: 0, percentage: 0 };
    }
    breakdown[tx.category].amount += tx.amount;
    breakdown[tx.category].points += tx.points_earned;
    breakdown[tx.category].count += 1;
  }
  
  // Calculate percentages
  for (const category in breakdown) {
    breakdown[category].percentage = totalAmount > 0
      ? parseFloat(((breakdown[category].amount / totalAmount) * 100).toFixed(1))
      : 0;
  }
  
  return breakdown;
}

/**
 * Format points for display
 * 
 * @param points - Points to format
 * @param includeLabel - Whether to include "pts" label
 * @returns Formatted string (e.g., "1,234 pts")
 */
export function formatPoints(points: number, includeLabel: boolean = true): string {
  const formatted = points.toLocaleString();
  return includeLabel ? `${formatted} pts` : formatted;
}

/**
 * Format PKR amount for display
 * 
 * @param amount - Amount in PKR
 * @param includeSymbol - Whether to include "PKR" prefix
 * @returns Formatted string (e.g., "PKR 1,234")
 */
export function formatCurrency(amount: number, includeSymbol: boolean = true): string {
  const formatted = Math.floor(amount).toLocaleString();
  return includeSymbol ? `PKR ${formatted}` : formatted;
}

/**
 * Constants for the points system
 */
export const POINTS_CONSTANTS = {
  // Redemption thresholds
  INSTANT_REDEMPTION_THRESHOLD: 5000,
  
  // Conversion rates
  POINTS_TO_PKR: 1, // 1 point = PKR 1
  
  // Calculation precision
  EFFICIENCY_DECIMALS: 2,
  
  // Default values
  DEFAULT_MULTIPLIER: 1,
  DEFAULT_BASE_RATE: 1,
} as const;
