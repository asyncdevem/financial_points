# FinPoints - Financial Points Aggregator

<div align="center">

**Maximize your credit card rewards with intelligent Pakistani bank card management**

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## Overview

FinPoints is a comprehensive financial aggregator platform designed specifically for Pakistani users to track, manage, and maximize their credit card reward points across multiple banks. The application provides intelligent purchase recommendations, transaction tracking, points redemption, and detailed analytics—all in one unified dashboard.

**Key Highlights:**
- 🏦 Support for 15 major Pakistani banks
- 💳 Secure card management with AES-256 encryption
- 📊 Real-time transaction tracking and analytics
- 🎁 Points redemption marketplace (vouchers, bills, cashback, products, charity)
- 🤖 Smart card recommendations for optimal rewards
- 📱 Responsive design for desktop and mobile

---

## Features

### 🔐 Secure Authentication & Onboarding
- Session-based authentication with 15-minute timeout
- Guided 4-step onboarding wizard
- Interactive tutorial system
- Profile management with Pakistani phone validation

### 💳 Card Management
- Add multiple credit/debit cards from supported banks
- Luhn algorithm validation for card numbers
- AES-256-CBC encryption for card storage
- SHA-256 CVV hashing (never stored in plain text)
- View reward rates and category multipliers per card

### 📊 Transaction Tracking
- Manual transaction entry
- Mock transaction seeding for testing
- Category-based filtering (7 categories)
- 90-day historical data
- Real-time points calculation

### 💰 Points & Rewards
- Centralized points calculation engine
- Points formula: `(amount / 100) × base_rate × multiplier`
- Track points across all cards
- Estimated PKR value (1 point ≈ PKR 1)
- Points efficiency metrics (points per PKR 100)

### 🎁 Redemption Marketplace
- 45+ catalog items across 5 categories:
  - Vouchers (Amazon, Daraz, etc.)
  - Bill payments (utilities, mobile recharge)
  - Cashback
  - Physical products
  - Charity donations
- Instant redemption for ≤ 5,000 points
- Approval workflow for > 5,000 points
- Delivery address management for physical items

### 📈 Analytics & Reports
- 30-day spending overview
- Category breakdown with percentages
- Top merchants analysis
- Card performance comparison
- Points efficiency tracking
- PDF export capability

### 🤖 Smart Recommendations
- Interactive purchase calculator
- Compare all cards for a specific purchase
- Best card recommendations by category
- Opportunity cost warnings
- Multiplier visualization

### 🔒 Security Features
- Rate limiting (5-200 req/min based on endpoint)
- Input sanitization (XSS, SQL injection prevention)
- Audit logging for sensitive operations
- Security headers (CSP, X-Frame-Options, etc.)
- Safe error messages (no implementation details leaked)

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/finpoints.git
cd finpoints
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/finpoints

# Session
SESSION_SECRET=your-long-random-secret-string-here

# Encryption
ENCRYPTION_KEY=your-32-byte-hex-encryption-key-here

# Environment
NODE_ENV=development
```

**Generate secure keys:**
```bash
# Session secret (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Encryption key (64 characters, 32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. **Initialize the database**

```bash
# Create database
createdb finpoints

# Run initialization script
psql -d finpoints -f scripts/init-db.sql
```

5. **Start the development server**

```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
financial_points/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── cards/                # Card management
│   │   ├── transactions/         # Transaction tracking
│   │   ├── points/               # Points calculation
│   │   ├── redemption/           # Redemption system
│   │   ├── profile/              # User profile
│   │   └── onboarding/           # Onboarding flow
│   ├── components/               # React components
│   │   ├── onboarding/           # Onboarding wizard steps
│   │   ├── screens/              # Main application screens
│   │   ├── transactions/         # Transaction components
│   │   ├── error-boundary.tsx    # Error handling
│   │   ├── app-shell.tsx         # Navigation shell
│   │   ├── icons.tsx             # Icon components
│   │   └── ui.tsx                # UI primitives
│   ├── lib/                      # Utility libraries
│   │   ├── db.ts                 # Database connection
│   │   ├── session.ts            # Session management
│   │   ├── crypto.ts             # Encryption utilities
│   │   ├── card-validation.ts    # Luhn algorithm
│   │   ├── points-engine.ts      # Points calculation
│   │   ├── rate-limiter.ts       # Rate limiting
│   │   ├── sanitization.ts       # Input sanitization
│   │   ├── audit-logger.ts       # Audit logging
│   │   ├── security-utils.ts     # Security functions
│   │   ├── database-helpers.ts   # Database queries
│   │   ├── transaction-seeder.ts # Mock data generation
│   │   └── banks.ts              # Bank configurations
│   ├── (routes)/                 # Page routes
│   │   ├── dashboard/
│   │   ├── banks/
│   │   ├── onboarding/
│   │   ├── redemption/
│   │   ├── recommend/
│   │   ├── reports/
│   │   ├── deals/
│   │   └── settings/
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── scripts/                      # Database scripts
│   ├── init-db.sql               # Schema & seed data
│   └── README.md                 # Script documentation
├── public/                       # Static assets
├── middleware.ts                 # Route middleware
├── API_DOCUMENTATION.md          # API reference
├── SECURITY_GUIDE.md             # Security documentation
├── POINTS_ENGINE_GUIDE.md        # Points system docs
├── PROJECT_DOCUMENTATION.md      # Architecture overview
├── DEPLOYMENT_GUIDE.md           # Deployment instructions
├── TROUBLESHOOTING.md            # Common issues & fixes
└── README.md                     # This file
```

---

## Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[Security Guide](./SECURITY_GUIDE.md)** - Security architecture and best practices
- **[Points Engine Guide](./POINTS_ENGINE_GUIDE.md)** - Points calculation system
- **[Project Documentation](./PROJECT_DOCUMENTATION.md)** - Architecture and design decisions
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

---

## Usage

### Getting Started

1. **Sign Up**: Create an account on the registration page
2. **Complete Onboarding**: Follow the 4-step wizard:
   - Step 1: Enter personal profile information
   - Step 2: Add your first bank card
   - Step 3: Set spending preferences
   - Step 4: Review and complete
3. **Tutorial**: Interactive guide to key features (can be skipped)
4. **Dashboard**: Your central hub for points and transactions

### Adding Cards

1. Navigate to "My Cards" from the navigation menu
2. Click "Add New Card"
3. Select your bank from the dropdown
4. Enter card details (validated with Luhn algorithm)
5. Card number is encrypted before storage

### Tracking Transactions

**Manual Entry:**
1. Go to Dashboard
2. Click "Add Transaction"
3. Select card, enter merchant, category, and amount
4. Points calculated automatically

**Mock Data for Testing:**
1. Click "Seed Mock Transactions"
2. 30 realistic transactions generated across 90 days
3. Uses Pakistani merchants and realistic amounts

### Redeeming Points

1. Navigate to "Redeem" from the menu
2. Browse catalog by category
3. Click "Redeem" on desired item
4. Provide delivery address if required
5. Confirm redemption:
   - ≤ 5,000 points: Instant
   - > 5,000 points: Pending approval
6. Track status in "Redemption History"

### Smart Recommendations

1. Go to "Recommend" screen
2. Enter purchase amount and category
3. View ranked cards by points earned
4. See opportunity cost if using suboptimal card

### Analytics & Reports

1. Navigate to "Reports"
2. View 30-day spending overview
3. Analyze category breakdown
4. Compare card performance
5. Export report as PDF

---

## Supported Banks

FinPoints supports 15 major Pakistani banks:

1. **Habib Bank Limited (HBL)** - 2% base, 3x dining, 2x fuel
2. **United Bank Limited (UBL)** - 1.8% base, 3x travel, 2x shopping
3. **Meezan Bank** - 1.5% base, 2.5x groceries, 2x bills
4. **MCB Bank** - 2.2% base, 3x entertainment, 2x dining
5. **Allied Bank** - 1.6% base, 2x fuel, 1.5x shopping
6. **Askari Bank** - 1.7% base, 2.5x dining, 2x travel
7. **Bank Alfalah** - 2% base, 3x shopping, 2.5x groceries
8. **Habib Metro Bank** - 1.5% base, 2x dining, 1.5x fuel
9. **Standard Chartered** - 2.5% base, 4x travel, 3x dining
10. **Faysal Bank** - 1.5% base, 2x groceries, 1.5x bills
11. **JS Bank** - 1.8% base, 2.5x shopping, 2x entertainment
12. **Soneri Bank** - 1.4% base, 2x fuel, 1.5x groceries
13. **Bank Al-Habib** - 1.9% base, 2.5x dining, 2x shopping
14. **Silk Bank** - 1.6% base, 2x travel, 1.5x entertainment
15. **Dubai Islamic Bank** - 1.5% base, 2x bills, 1.5x groceries

*Note: Reward rates are for demonstration purposes. Actual rates vary by card product.*

---

## Technology Stack

- **Frontend**: React 18, Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS, Custom DeFi Chrome theme
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL 14+ with `pg` driver
- **Authentication**: Session-based with HTTP-only cookies
- **Encryption**: AES-256-CBC (card numbers), SHA-256 (CVV)
- **Validation**: Luhn algorithm, Zod schemas
- **Security**: Rate limiting, input sanitization, audit logging

---

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

### Linting & Formatting

```bash
npm run lint
npm run format
```

### Database Migrations

```bash
# Create a new migration
psql -d finpoints -f scripts/migrations/001_migration_name.sql
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Keep commits atomic and well-described

---

## Security

### Reporting Security Issues

If you discover a security vulnerability, please email security@finpoints.com (do NOT open a public issue).

### Security Features

- AES-256-CBC encryption for card numbers
- SHA-256 hashing for CVV codes
- Rate limiting on all sensitive endpoints
- Input sanitization and validation
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF protection via session-based auth
- Audit logging for compliance
- Security headers (CSP, X-Frame-Options, etc.)

See [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) for complete security documentation.

---

## License

**Proprietary** - All rights reserved

This software is proprietary and confidential. Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited.

For licensing inquiries, contact: licensing@finpoints.com

---

## Support

- **Email**: support@finpoints.com
- **Documentation**: [docs.finpoints.com](https://docs.finpoints.com) (TODO)
- **GitHub Issues**: [github.com/finpoints/finpoints/issues](https://github.com/finpoints/finpoints/issues) (TODO)

---

## Roadmap

### v1.1 (Q2 2024)
- [ ] Mobile app (React Native)
- [ ] Push notifications for high-value deals
- [ ] Automated transaction imports (via bank APIs)
- [ ] AI-powered spending insights

### v1.2 (Q3 2024)
- [ ] Multi-user accounts (family plans)
- [ ] Budgeting tools
- [ ] Goal-based savings
- [ ] Social features (leaderboards)

### v2.0 (Q4 2024)
- [ ] Investment tracking
- [ ] Cryptocurrency integration
- [ ] International cards support
- [ ] Advanced analytics with ML

---

## Acknowledgments

- Pakistani banking community for reward program information
- Open-source libraries and tools that made this possible
- Beta testers and early adopters

---

## Disclaimer

**Important**: This application is for demonstration and educational purposes. It does NOT:
- Process actual payments
- Connect to real bank APIs
- Store actual financial transaction data
- Provide real redemptions

All card data is encrypted and mock transactions are used for testing. Never enter real financial credentials into unauthorized applications.

---

<div align="center">

**Made with ❤️ for the Pakistani fintech community**

[Website](https://finpoints.com) • [Twitter](https://twitter.com/finpoints) • [LinkedIn](https://linkedin.com/company/finpoints)

</div>
