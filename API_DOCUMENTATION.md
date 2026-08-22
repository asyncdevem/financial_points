# FinPoints API Documentation

## Overview

FinPoints provides a RESTful API for managing user profiles, bank cards, transactions, points, and redemptions. All API endpoints require session-based authentication unless otherwise noted.

**Base URL:** `http://localhost:3000/api` (development)

**Authentication:** Session-based with HTTP-only cookies

**Content-Type:** `application/json`

**Rate Limiting:** Varies by endpoint (see Security Guide)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Profile Management](#profile-management)
3. [Onboarding](#onboarding)
4. [Bank Cards](#bank-cards)
5. [Transactions](#transactions)
6. [Points & Rewards](#points--rewards)
7. [Redemptions](#redemptions)
8. [Error Responses](#error-responses)

---

## Authentication

### POST /api/auth/signup

Create a new user account.

**Rate Limit:** 5 requests per 15 minutes per IP

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Errors:**
- 400: Invalid input or user already exists
- 429: Too many signup attempts

---

### POST /api/auth/login

Authenticate a user and create a session.

**Rate Limit:** 5 requests per 15 minutes per IP

**Request:**
```json
{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe"
  }
}
```

**Errors:**
- 401: Invalid credentials
- 429: Too many login attempts

---

### POST /api/auth/logout

End the current user session.

**Request:** Empty body

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

### GET /api/auth/session

Check current session status.

**Response (200):**
```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "username": "johndoe"
  },
  "session": {
    "created_at": "2024-01-15T10:00:00.000Z",
    "expires_at": "2024-01-15T10:15:00.000Z"
  }
}
```

**Response (401) - Not authenticated:**
```json
{
  "authenticated": false
}
```

---

## Profile Management

### GET /api/profile

Get the authenticated user's profile.

**Authentication:** Required

**Response (200):**
```json
{
  "profile": {
    "user_id": 1,
    "full_name": "John Doe",
    "phone": "+923001234567",
    "address": "123 Main Street, Karachi",
    "date_of_birth": "1990-01-15",
    "income_bracket": "PKR 50,000 - 100,000",
    "preferences": {
      "dining": 4,
      "groceries": 3,
      "fuel": 3,
      "travel": 2,
      "shopping": 4,
      "bills": 3,
      "entertainment": 2
    },
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

**Errors:**
- 401: Not authenticated
- 404: Profile not found

---

### POST /api/profile

Create a new profile for the authenticated user.

**Authentication:** Required

**Request:**
```json
{
  "full_name": "John Doe",
  "phone": "+923001234567",
  "address": "123 Main Street, Karachi",
  "date_of_birth": "1990-01-15",
  "income_bracket": "PKR 50,000 - 100,000"
}
```

**Validation:**
- `full_name`: 2-100 characters
- `phone`: Pakistani format (+92XXXXXXXXXX)
- `address`: Minimum 10 characters
- `date_of_birth`: Must be 18+ years old
- `income_bracket`: One of 7 predefined brackets

**Response (201):**
```json
{
  "message": "Profile created successfully",
  "profile": { /* profile object */ }
}
```

**Errors:**
- 400: Validation failed or profile already exists
- 401: Not authenticated

---

### PATCH /api/profile

Update the authenticated user's profile.

**Authentication:** Required

**Request (partial update):**
```json
{
  "full_name": "John Smith",
  "spending_preferences": {
    "dining": 5,
    "shopping": 4
  }
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "profile": { /* updated profile */ }
}
```

**Errors:**
- 400: Validation failed
- 401: Not authenticated
- 404: Profile not found

---

## Onboarding

### GET /api/onboarding/status

Check if user has completed onboarding.

**Authentication:** Required

**Response (200):**
```json
{
  "onboarding_completed": true,
  "completed_at": "2024-01-15T10:30:00.000Z"
}
```

---

### PATCH /api/onboarding/progress

Update onboarding step progress.

**Authentication:** Required

**Request:**
```json
{
  "step": "profile",
  "completed": true
}
```

**Valid steps:** `profile`, `cards`, `preferences`, `tutorial`

**Response (200):**
```json
{
  "message": "Progress updated",
  "progress": {
    "profile_completed": true,
    "cards_completed": false,
    "preferences_completed": false,
    "tutorial_completed": false
  }
}
```

---

### POST /api/onboarding/complete

Mark onboarding as complete.

**Authentication:** Required

**Request:** Empty body

**Response (200):**
```json
{
  "message": "Onboarding completed",
  "completed_at": "2024-01-15T10:30:00.000Z"
}
```

---

## Bank Cards

### GET /api/banks

Get list of supported Pakistani banks.

**Authentication:** Required

**Response (200):**
```json
{
  "banks": [
    {
      "id": 1,
      "bank_name": "Habib Bank Limited",
      "bank_code": "HBL",
      "base_reward_rate": 2.0,
      "category_multipliers": {
        "dining": 3,
        "fuel": 2,
        "groceries": 1.5
      },
      "supported_card_types": ["credit", "debit"]
    }
    /* ... more banks */
  ],
  "total": 15
}
```

---

### GET /api/cards

Get all cards for the authenticated user.

**Authentication:** Required

**Response (200):**
```json
{
  "cards": [
    {
      "id": 1,
      "user_id": 1,
      "bank_id": 1,
      "bank_name": "Habib Bank Limited",
      "card_type": "credit",
      "last_four": "1234",
      "expiry_month": 12,
      "expiry_year": 2025,
      "card_nickname": "HBL Platinum",
      "base_reward_rate": 2.0,
      "category_multipliers": {
        "dining": 3,
        "fuel": 2
      },
      "added_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

### POST /api/cards

Add a new card.

**Authentication:** Required

**Rate Limit:** 20 requests per minute

**Request:**
```json
{
  "bank_id": 1,
  "card_type": "credit",
  "card_number": "4111111111111111",
  "expiry_month": 12,
  "expiry_year": 2025,
  "cvv": "123",
  "card_nickname": "My HBL Card"
}
```

**Validation:**
- `card_number`: Valid 13-19 digit number (Luhn algorithm)
- `expiry_month`: 1-12
- `expiry_year`: Current year or future
- `cvv`: 3-4 digits
- Card must not be expired

**Security:**
- Card number encrypted with AES-256-CBC
- CVV hashed with SHA-256
- Only last 4 digits stored in plain text

**Response (201):**
```json
{
  "message": "Card added successfully",
  "card": {
    "id": 1,
    "last_four": "1111",
    /* other non-sensitive fields */
  }
}
```

**Errors:**
- 400: Invalid card data or expired card
- 401: Not authenticated
- 429: Too many card additions

---

### DELETE /api/cards/[id]

Remove a card.

**Authentication:** Required

**Response (200):**
```json
{
  "message": "Card deleted successfully"
}
```

**Errors:**
- 401: Not authenticated
- 404: Card not found or doesn't belong to user

---

## Transactions

### GET /api/transactions

Get user's transactions with optional filtering.

**Authentication:** Required

**Query Parameters:**
- `category`: Filter by category (dining, groceries, etc.)
- `card_id`: Filter by card ID
- `limit`: Max results (default: 50, max: 100)
- `offset`: Pagination offset (default: 0)

**Example:** `/api/transactions?category=dining&limit=20`

**Response (200):**
```json
{
  "transactions": [
    {
      "id": 1,
      "user_id": 1,
      "card_id": 1,
      "merchant_name": "Howdy Restaurant",
      "category": "dining",
      "amount": 2500,
      "points_earned": 150,
      "transaction_date": "2024-01-15T14:30:00.000Z",
      "is_user_added": false
    }
  ],
  "summary": {
    "count": 1,
    "total_amount": 2500,
    "total_points": 150
  }
}
```

---

### POST /api/transactions

Add a manual transaction or seed mock data.

**Authentication:** Required

**Rate Limit:** 20 requests per minute

**Add Manual Transaction:**
```json
{
  "card_id": 1,
  "merchant_name": "Local Shop",
  "category": "groceries",
  "amount": 1500
}
```

**Seed Mock Transactions:**
```json
{
  "action": "seed",
  "count": 30
}
```

**Response (201):**
```json
{
  "message": "Transaction added successfully",
  "transaction": { /* transaction object */ },
  "points_earned": 30
}
```

**Errors:**
- 400: Invalid input or amount exceeds PKR 1,000,000
- 401: Not authenticated
- 404: Card not found

---

### GET /api/transactions/analytics

Get spending analytics for the user.

**Authentication:** Required

**Response (200):**
```json
{
  "period": {
    "start_date": "2023-12-16",
    "end_date": "2024-01-15",
    "total_transactions": 45,
    "total_amount": 125000,
    "total_points": 3750,
    "average_transaction": 2777.78
  },
  "category_breakdown": [
    {
      "category": "dining",
      "amount": 45000,
      "points": 2700,
      "transaction_count": 12,
      "percentage": 36.0
    }
  ],
  "top_merchants": [
    {
      "merchant": "Howdy",
      "amount": 15000,
      "transaction_count": 6
    }
  ],
  "card_performance": [
    {
      "card_id": 1,
      "bank_name": "HBL",
      "last_four": "1234",
      "transactions": 25,
      "amount": 75000,
      "points": 2250
    }
  ],
  "points_efficiency": 3.0
}
```

---

## Points & Rewards

### GET /api/points

Get points balance and breakdown.

**Authentication:** Required

**Response (200):**
```json
{
  "total_earned": 5000,
  "total_redeemed": 1500,
  "available_balance": 3500,
  "estimated_value_pkr": 3500,
  "by_card": [
    {
      "card_id": 1,
      "bank_name": "HBL",
      "last_four": "1234",
      "points_earned": 3000,
      "points_redeemed": 900,
      "available": 2100
    }
  ]
}
```

---

## Redemptions

### GET /api/redemption/catalog

Get redemption catalog items.

**Authentication:** Required

**Query Parameters:**
- `category`: Filter by category (vouchers, bills, cashback, products, charity)

**Response (200):**
```json
{
  "categories": {
    "vouchers": {
      "items": [
        {
          "id": 1,
          "category": "vouchers",
          "title": "PKR 1,000 Amazon Gift Card",
          "description": "Redeemable on Amazon.pk",
          "provider": "Amazon",
          "points_cost": 1000,
          "estimated_delivery_days": null,
          "requires_delivery": false,
          "is_active": true
        }
      ],
      "count": 10,
      "min_points": 500,
      "max_points": 10000,
      "avg_points": 2500
    }
  },
  "total_items": 45
}
```

---

### POST /api/redemption/redeem

Redeem points for a catalog item.

**Authentication:** Required

**Rate Limit:** 10 requests per 5 minutes

**Request:**
```json
{
  "catalog_item_id": 1,
  "delivery_address": "123 Main St, Karachi" // Required for physical items
}
```

**Response (201):**
```json
{
  "message": "Redemption successful",
  "redemption": {
    "id": 1,
    "status": "instant",
    "points_spent": 1000,
    "redemption_date": "2024-01-15T15:00:00.000Z",
    "estimated_delivery": "Instant"
  },
  "item": {
    "title": "PKR 1,000 Amazon Gift Card",
    "category": "vouchers",
    "provider": "Amazon"
  },
  "balance": {
    "previous": 3500,
    "spent": 1000,
    "remaining": 2500
  }
}
```

**Business Rules:**
- Redemptions ≤ 5,000 points: Instant
- Redemptions > 5,000 points: Pending approval

**Errors:**
- 400: Insufficient points or missing delivery address
- 401: Not authenticated
- 404: Catalog item not found

---

### GET /api/redemption/history

Get user's redemption history.

**Authentication:** Required

**Query Parameters:**
- `status`: Filter by status (instant, pending, approved, completed, rejected)

**Response (200):**
```json
{
  "redemptions": [
    {
      "id": 1,
      "catalog_item_id": 1,
      "user_id": 1,
      "points_spent": 1000,
      "status": "instant",
      "delivery_address": null,
      "redemption_date": "2024-01-15T15:00:00.000Z",
      "approval_date": null,
      "completion_date": "2024-01-15T15:00:00.000Z",
      "admin_notes": null,
      "item_details": {
        "title": "PKR 1,000 Amazon Gift Card",
        "provider": "Amazon",
        "category": "vouchers"
      }
    }
  ],
  "summary": {
    "total_redemptions": 5,
    "total_points_spent": 6500,
    "pending_count": 1,
    "completed_count": 4
  },
  "category_breakdown": {
    "vouchers": { "count": 3, "points": 3000 },
    "cashback": { "count": 2, "points": 3500 }
  }
}
```

---

### POST /api/redemption/approve

Approve or complete a redemption (admin function).

**Authentication:** Required

**Request:**
```json
{
  "redemption_id": 1,
  "action": "approve",
  "notes": "Approved by admin"
}
```

**Valid actions:** `approve`, `complete`

**Response (200):**
```json
{
  "message": "Redemption approved",
  "redemption": { /* updated redemption */ }
}
```

---

## Error Responses

All endpoints may return the following error formats:

### 400 Bad Request
```json
{
  "error": "Invalid input",
  "errors": ["Field 'amount' must be between 1 and 1,000,000"]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many attempts. Please try again in 15 minutes.",
  "retry_after": 900
}
```

### 500 Internal Server Error
```json
{
  "error": "An internal error occurred"
}
```

**Note:** Error messages are sanitized and never expose internal implementation details, SQL errors, or file paths.

---

## Rate Limiting Headers

Rate-limited endpoints include these headers in responses:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1642251600
Retry-After: 900 (only when rate limited)
```

---

## Security Headers

All API responses include security headers:

```
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
```

---

## Testing

### Example with curl:

```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"test","password":"Test123!"}'

# Get profile (with session cookie)
curl http://localhost:3000/api/profile \
  -b cookies.txt
```

### Example with JavaScript (fetch):

```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'test', password: 'Test123!' }),
  credentials: 'include' // Important for cookies
});

// Get profile
const profile = await fetch('/api/profile', {
  credentials: 'include'
});
```

---

## Webhooks (Future Enhancement)

**Note:** Webhooks are not currently implemented but planned for future releases.

Potential webhook events:
- `redemption.approved`
- `redemption.completed`
- `transaction.high_value` (for transactions > PKR 50,000)
- `points.milestone` (when user reaches point thresholds)

---

## Versioning

**Current Version:** v1.0

API endpoints are not currently versioned. Future versions may use URL-based versioning (e.g., `/api/v2/profile`).

---

## Support

For API support, bug reports, or feature requests:
- Email: support@finpoints.com (TODO: set up)
- GitHub Issues: [github.com/finpoints/finpoints](https://github.com/finpoints/finpoints) (TODO: set up)

---

**Last Updated:** January 2024
**API Version:** 1.0
