import { createMockTransaction } from "./database-helpers";
import { calculatePoints } from "./points-engine";

const PAKISTANI_MERCHANTS = {
  dining: [
    "Howdy", "Gloria Jean's", "Nando's", "Subway", "McDonald's", "KFC", 
    "Pizza Hut", "Domino's Pizza", "The Monal", "Café Aylanto", 
    "Bundoo Khan", "BBQ Tonight", "Salt'n Pepper", "Ginsoy", "Dynasty Restaurant"
  ],
  groceries: [
    "Imtiaz Super Market", "Carrefour", "Al-Fatah", "Metro Cash & Carry",
    "Naheed Super Market", "ChenOne", "Hyperstar", "Agha's Supermarket"
  ],
  fuel: [
    "PSO Petrol Pump", "Shell Pakistan", "Total Parco", "GO Petroleum",
    "Attock Petroleum", "Hascol Petroleum"
  ],
  travel: [
    "Careem Ride", "Uber Pakistan", "PIA Booking", "Airblue",
    "Serena Hotels", "Pearl Continental", "Avari Hotels", "Booking.com"
  ],
  shopping: [
    "Daraz.pk", "Khaadi", "Sapphire", "Junaid Jamshed", "Gul Ahmed",
    "Nishat Linen", "Outfitters", "Breakout", "Levi's Store", "Adidas Pakistan"
  ],
  bills: [
    "K-Electric", "SSGC Bill", "PTCL", "Jazz Mobile", "Telenor",
    "Zong Recharge", "Ufone", "SNGPL", "WASA Bill"
  ],
  entertainment: [
    "Cinepax Cinema", "Nueplex Cinemas", "Netflix Pakistan", "Spotify",
    "YouTube Premium", "Amazon Prime", "PlayStation Store"
  ]
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomAmount(category: string): number {
  const ranges: Record<string, [number, number]> = {
    dining: [500, 5000],
    groceries: [1000, 8000],
    fuel: [2000, 6000],
    travel: [3000, 25000],
    shopping: [1500, 15000],
    bills: [1000, 10000],
    entertainment: [500, 3000]
  };
  
  const [min, max] = ranges[category] || [500, 5000];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(daysBack: number): Date {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysBack);
  const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
  
  // Random hour between 8 AM and 10 PM
  const hour = 8 + Math.floor(Math.random() * 14);
  date.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  
  return date;
}

function calculatePointsForTransaction(
  amount: number,
  baseRate: number,
  category: string,
  multipliers: Record<string, number>
): number {
  const multiplier = multipliers[category] || 1;
  return calculatePoints(amount, baseRate, multiplier);
}

/**
 * Seeds mock transactions for a user across their cards
 */
export async function seedUserTransactions(
  userId: number,
  cards: Array<{
    id: number;
    base_reward_rate: number;
    category_multipliers: Record<string, number>;
  }>,
  count = 30
): Promise<void> {
  if (cards.length === 0) {
    console.log("No cards found for user, skipping transaction seeding");
    return;
  }
  
  const categories = Object.keys(PAKISTANI_MERCHANTS);
  const transactions: Promise<any>[] = [];
  
  for (let i = 0; i < count; i++) {
    const category = getRandomElement(categories);
    const merchant = getRandomElement(PAKISTANI_MERCHANTS[category as keyof typeof PAKISTANI_MERCHANTS]);
    const amount = getRandomAmount(category);
    const transactionDate = getRandomDate(90); // Last 90 days
    
    // Randomly select a card
    const card = getRandomElement(cards);
    const pointsEarned = calculatePointsForTransaction(
      amount,
      card.base_reward_rate,
      category,
      card.category_multipliers
    );
    
    transactions.push(
      createMockTransaction(
        userId,
        card.id,
        merchant,
        category,
        amount,
        pointsEarned,
        transactionDate,
        false // Not user-added
      )
    );
  }
  
  await Promise.all(transactions);
  console.log(`Seeded ${count} transactions for user ${userId}`);
}

/**
 * Get category-wise spending breakdown
 */
export function getCategoryBreakdown(transactions: Array<{
  category: string;
  amount: number;
  points_earned: number;
}>) {
  const breakdown: Record<string, { amount: number; points: number; count: number }> = {};
  
  for (const tx of transactions) {
    if (!breakdown[tx.category]) {
      breakdown[tx.category] = { amount: 0, points: 0, count: 0 };
    }
    breakdown[tx.category].amount += tx.amount;
    breakdown[tx.category].points += tx.points_earned;
    breakdown[tx.category].count += 1;
  }
  
  return breakdown;
}

/**
 * Get top merchants by spending
 */
export function getTopMerchants(
  transactions: Array<{ merchant_name: string; amount: number }>,
  limit = 5
) {
  const merchantTotals: Record<string, number> = {};
  
  for (const tx of transactions) {
    merchantTotals[tx.merchant_name] = (merchantTotals[tx.merchant_name] || 0) + tx.amount;
  }
  
  return Object.entries(merchantTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([merchant, amount]) => ({ merchant, amount }));
}
