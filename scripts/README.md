# Database Setup Guide

This directory contains SQL scripts for initializing the Financial Points Aggregator database.

## Quick Setup

### Option 1: Using Neon Console (Recommended)

1. Log in to your [Neon Console](https://console.neon.tech/)
2. Select your project
3. Navigate to the SQL Editor
4. Copy and paste the contents of `init-db.sql`
5. Execute the script

### Option 2: Using psql Command Line

```bash
psql $DATABASE_URL -f scripts/init-db.sql
```

### Option 3: Using Node.js Script

```bash
npm run db:init
```

## Database Schema

### Core Tables

#### `user_profiles`
Stores user profile information collected during onboarding.
- Full name, phone, address, date of birth, income bracket

#### `pakistani_banks`
Pre-seeded with 15 major Pakistani banks and their reward structures.
- Bank name, logo, card types, reward rates, category multipliers

#### `user_cards`
Stores user's bank cards with encrypted card numbers.
- Bank reference, card type, encrypted number, last 4 digits, expiry, CVV hash

#### `mock_transactions`
Transaction history (volatile - loaded into session RAM).
- Merchant, category, amount, points earned, transaction date

#### `redemption_catalog`
Available rewards for points redemption.
- Vouchers, bill payments, cash, physical products, charity donations

#### `redemptions`
Redemption history with approval workflow.
- Status tracking (instant/pending/approved/completed)

#### `onboarding_progress`
Tracks user onboarding completion state.
- Profile, card, preferences, tutorial completion flags

## Seeded Data

### Pakistani Banks (15)
- HBL, UBL, Meezan Bank, MCB, Allied Bank, Askari Bank
- Bank Alfalah, Habib Metro, Standard Chartered, Faysal Bank
- JS Bank, Soneri Bank, Bank Al-Habib, Silk Bank, Dubai Islamic Bank

Each bank has:
- Base reward rate (1.0 = 1 point per PKR 100)
- Category multipliers (e.g., 5x on dining, 3x on fuel)

### Redemption Catalog (45+ items)

**Vouchers:**
- Daraz, Foodpanda, Careem, Amazon gift cards

**Bill Payments:**
- K-Electric, SSGC, PTCL, Jazz, Telenor

**Cash Conversion:**
- Bank transfers (PKR 1,000 to PKR 10,000)

**Physical Products:**
- Electronics, appliances, gadgets

**Charity Donations:**
- Edhi Foundation, Shaukat Khanum, TCF, Akhuwat

## Approval Workflow

Redemptions follow a mixed approval model:
- **≤5,000 points**: Instant redemption (status: "instant")
- **>5,000 points**: Requires approval (status: "pending")

Admins can approve via `/api/redemption/approve` endpoint.

## Security Features

- Card numbers: AES-256-CBC encryption
- CVV: SHA-256 one-way hash
- Session-based financial data (volatile)
- Audit logging for all redemptions

## Environment Variables Required

```env
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=your-32-character-encryption-key
```

## Indexes

The schema includes optimized indexes for:
- User card lookups
- Transaction queries (by user, date, card)
- Redemption status filtering
- Catalog category searches

## Migration Notes

This is the initial schema. Future migrations should be:
1. Created in separate files (e.g., `001_add_feature.sql`)
2. Applied sequentially
3. Tracked in a migrations table

## Support

For issues or questions, check:
- PROJECT_DOCUMENTATION.md
- README.md in project root
