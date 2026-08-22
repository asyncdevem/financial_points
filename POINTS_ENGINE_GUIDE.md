# Points Calculation Engine Guide

## Overview

The Points Calculation Engine (`app/lib/points-engine.ts`) provides centralized utilities for all points-related calculations in the FinPoints application. This ensures consistency, accuracy, and maintainability across the entire codebase.

## Core Philosophy

**Never calculate points inline.** Always import and use the centralized functions from `points-engine.ts`.

## Points Calculation Formula

```
Points = (Amount / 100) × Base Rate × Category Multiplier
```

**Example:**
- Amount: PKR 5,000
- Base Rate: 2 (2% base reward)
- Category Multiplier: 3x for dining
- **Points = (5000 / 100) × 2 × 3 = 300 points**

## Key Functions

### 1. `calculatePoints(amount, baseRewardRate, categoryMultiplier)`

Primary function for calculating points earned on a transaction.

```typescript
import { calculatePoints } from "@/app/lib/points-engine";

const points = calculatePoints(
  5000,  // Amount in PKR
  2,     // Base reward rate
  3      // Category multiplier (3x for dining)
);
// Returns: 300
```

**When to use:**
- Processing new transactions
- Manual transaction entry
- Real-time points preview

**Used in:**
- `app/api/transactions/route.ts` - Transaction creation
- `app/lib/transaction-seeder.ts` - Mock transaction generation

---

### 2. `calculateBestCard(amount, category, cards)`

Compares all user cards for a given purchase and returns them ranked by points earned (highest first).

```typescript
import { calculateBestCard } from "@/app/lib/points-engine";

const rankedCards = calculateBestCard(
  5000,      // Purchase amount
  "dining",  // Category
  userCards  // Array of card objects
);

// Returns cards sorted by points, each with:
// - calculated_points: Points this card would earn
// - calculated_multiplier: Applied category multiplier
// - calculated_value_pkr: Estimated PKR value
```

**When to use:**
- Card recommendation screens
- Purchase optimization
- "Best card" suggestions

**Used in:**
- `app/components/screens/recommend-screen.tsx` - Interactive calculator

---

### 3. `validateSufficientPoints(available, required)`

Validates if user has enough points for a redemption.

```typescript
import { validateSufficientPoints } from "@/app/lib/points-engine";

const validation = validateSufficientPoints(
  12000,  // Available points
  5000    // Required points
);

// Returns: { sufficient: true, shortage: 0 }
// If insufficient: { sufficient: false, shortage: 1500 }
```

**When to use:**
- Before processing redemptions
- UI validation for checkout
- Showing shortage amounts

**Used in:**
- `app/api/redemption/redeem/route.ts` - Redemption validation

---

### 4. `getRedemptionStatus(pointsCost)`

Determines if a redemption is instant or requires approval based on business rules.

```typescript
import { getRedemptionStatus } from "@/app/lib/points-engine";

const status = getRedemptionStatus(3000);
// Returns: "instant" (≤ 5,000 points)

const status = getRedemptionStatus(8000);
// Returns: "pending" (> 5,000 points)
```

**Business Rule:**
- Redemptions ≤ 5,000 points: Instant
- Redemptions > 5,000 points: Pending approval

**When to use:**
- Creating redemptions
- Status display in catalog
- Admin workflow routing

**Used in:**
- `app/lib/database-helpers.ts` - `createRedemption()` function

---

### 5. `calculatePointsEfficiency(totalPoints, totalAmount)`

Calculates how efficiently a user is earning points (points per PKR 100 spent).

```typescript
import { calculatePointsEfficiency } from "@/app/lib/points-engine";

const efficiency = calculatePointsEfficiency(
  15000,   // Total points earned
  750000   // Total PKR spent
);
// Returns: 2.00 (earning 2 pts per PKR 100)
```

**When to use:**
- Analytics dashboards
- User performance reports
- Card comparison metrics

**Potential usage:**
- Reports screen analytics
- Card performance breakdown

---

### 6. `calculateOpportunityCost(bestPoints, actualPoints)`

Calculates missed points when not using the optimal card.

```typescript
import { calculateOpportunityCost } from "@/app/lib/points-engine";

const missed = calculateOpportunityCost(
  500,  // Best possible points
  300   // Actual points earned
);
// Returns: 200 (missed opportunity)
```

**When to use:**
- Recommendation warnings
- User education
- Optimization suggestions

**Potential usage:**
- Recommend screen alerts
- Transaction post-analysis

---

### 7. `calculateCategoryBreakdown(transactions)`

Analyzes spending patterns across categories.

```typescript
import { calculateCategoryBreakdown } from "@/app/lib/points-engine";

const breakdown = calculateCategoryBreakdown(transactions);
// Returns:
// {
//   "dining": { amount: 45000, points: 2700, count: 12, percentage: 35.5 },
//   "groceries": { amount: 32000, points: 640, count: 8, percentage: 25.2 },
//   ...
// }
```

**When to use:**
- Spending analytics
- Category insights
- Budget tracking

**Potential usage:**
- Reports screen category charts
- Dashboard insights

---

### 8. Formatting Functions

Consistent display formatting for points and currency.

```typescript
import { formatPoints, formatCurrency } from "@/app/lib/points-engine";

formatPoints(12345);              // "12,345 pts"
formatPoints(12345, false);       // "12,345"

formatCurrency(50000);            // "PKR 50,000"
formatCurrency(50000, false);     // "50,000"
```

**When to use:**
- All UI displays of points/currency
- Reports and exports
- User-facing messages

**Potential usage:**
- All React components
- Email templates
- PDF exports

---

## Constants

```typescript
import { POINTS_CONSTANTS } from "@/app/lib/points-engine";

POINTS_CONSTANTS.INSTANT_REDEMPTION_THRESHOLD  // 5000
POINTS_CONSTANTS.POINTS_TO_PKR                 // 1 (1 point = PKR 1)
POINTS_CONSTANTS.DEFAULT_MULTIPLIER            // 1
POINTS_CONSTANTS.DEFAULT_BASE_RATE            // 1
```

## Integration Checklist

When working with points calculations:

- [ ] **Never** write inline point calculations
- [ ] **Always** import from `points-engine.ts`
- [ ] Use `calculatePoints()` for transaction processing
- [ ] Use `calculateBestCard()` for recommendations
- [ ] Use `validateSufficientPoints()` before redemptions
- [ ] Use formatting functions for all UI display
- [ ] Reference `POINTS_CONSTANTS` for business rules

## Files Using Points Engine

### API Routes
- ✅ `app/api/transactions/route.ts` - Transaction creation with `calculatePoints()`
- ✅ `app/api/redemption/redeem/route.ts` - Redemption validation with `validateSufficientPoints()`

### UI Components
- ✅ `app/components/screens/recommend-screen.tsx` - Card comparison with `calculateBestCard()`

### Libraries
- ✅ `app/lib/transaction-seeder.ts` - Mock data generation with `calculatePoints()`
- ✅ `app/lib/database-helpers.ts` - Redemption creation with `getRedemptionStatus()`

## Future Enhancements

Potential additions to the points engine:

1. **Time-based Multipliers**: Bonus points during specific hours/days
2. **Tier-based Rewards**: Higher rates for premium users
3. **Promotional Campaigns**: Temporary bonus multipliers
4. **Points Expiry**: Calculate points nearing expiration
5. **Transfer Calculations**: Points transfer between users/accounts
6. **Predictive Earning**: Forecast points based on spending patterns

## Testing Considerations

When testing points calculations:

```typescript
// Example test structure
import { calculatePoints } from "@/app/lib/points-engine";

test("calculates points correctly", () => {
  expect(calculatePoints(5000, 2, 3)).toBe(300);
  expect(calculatePoints(0, 2, 3)).toBe(0);
  expect(calculatePoints(5000, 0, 3)).toBe(0);
  expect(calculatePoints(5000, 2, 0)).toBe(0);
  expect(calculatePoints(199, 2, 1)).toBe(3); // Rounds down
});
```

## Documentation

For detailed API documentation and implementation examples, see:
- Function JSDoc comments in `app/lib/points-engine.ts`
- This guide for usage patterns
- `PROJECT_DOCUMENTATION.md` for architecture overview

---

**Last Updated:** Task 16 Implementation
**Version:** 1.0
**Maintained By:** FinPoints Development Team
