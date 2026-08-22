# Security & Validation Guide

## Overview

This guide documents the security measures implemented in the FinPoints application to protect against common vulnerabilities and ensure data integrity.

## Security Utilities

### 1. Rate Limiting (`app/lib/rate-limiter.ts`)

Prevents abuse by limiting the number of requests per time window.

**Implementation:**
- In-memory sliding window algorithm
- Configurable limits per endpoint type
- Automatic cleanup of expired entries

**Rate Limit Configurations:**

| Endpoint Type | Max Requests | Window | Purpose |
|--------------|--------------|--------|---------|
| AUTH | 5 | 15 min | Prevent brute force attacks |
| TRANSACTION_CREATE | 20 | 1 min | Prevent spam transactions |
| REDEMPTION | 10 | 5 min | Prevent rapid point spending |
| GENERAL | 100 | 1 min | General API protection |
| READ_ONLY | 200 | 1 min | Lenient for data fetching |

**Usage Example:**
```typescript
import { checkRateLimit, RATE_LIMITS, getClientIdentifier } from "@/app/lib/rate-limiter";

const identifier = getClientIdentifier(request, sessionData?.userId);
const rateLimit = checkRateLimit(identifier, "auth", RATE_LIMITS.AUTH);

if (!rateLimit.allowed) {
  return NextResponse.json(
    { 
      error: "Too many attempts",
      retry_after: rateLimit.retryAfter
    },
    { 
      status: 429,
      headers: {
        "Retry-After": rateLimit.retryAfter?.toString() || "900"
      }
    }
  );
}
```

---

### 2. Input Sanitization (`app/lib/sanitization.ts`)

Cleans and validates all user inputs to prevent injection attacks and data corruption.

**Key Functions:**

#### `sanitizeString(input, maxLength)`
Removes null bytes, trims whitespace, enforces length limits.

```typescript
import { sanitizeString } from "@/app/lib/sanitization";

const name = sanitizeString(userInput.name, 100);
// Removes null bytes, trims, max 100 chars
```

#### `sanitizeHTML(input)`
Strips all HTML tags to prevent XSS attacks.

```typescript
import { sanitizeHTML } from "@/app/lib/sanitization";

const safeText = sanitizeHTML(userInput);
// "<script>alert('xss')</script>" → "alert('xss')"
```

#### `sanitizeNumber(input, min, max)`
Validates numeric input with bounds checking.

```typescript
import { sanitizeNumber } from "@/app/lib/sanitization";

const amount = sanitizeNumber(userInput.amount, 1, 1000000);
if (amount === null) {
  // Invalid number or out of range
}
```

#### `sanitizePhone(phone)`
Validates Pakistani phone format.

```typescript
import { sanitizePhone } from "@/app/lib/sanitization";

const phone = sanitizePhone("+923001234567");
// Returns: "+923001234567" or null if invalid
```

#### `sanitizeCategory(category)`
Validates against whitelist of allowed categories.

```typescript
import { sanitizeCategory } from "@/app/lib/sanitization";

const category = sanitizeCategory(userInput.category);
// Only allows: dining, groceries, fuel, travel, shopping, bills, entertainment
```

#### Comprehensive Validators

**Transaction Validation:**
```typescript
import { validateTransactionInput } from "@/app/lib/sanitization";

const validation = validateTransactionInput(body);
if (!validation.valid) {
  return NextResponse.json(
    { errors: validation.errors },
    { status: 400 }
  );
}

// Use validation.sanitized for safe data
```

**Profile Validation:**
```typescript
import { validateProfileInput } from "@/app/lib/sanitization";

const validation = validateProfileInput(body);
if (!validation.valid) {
  return NextResponse.json(
    { errors: validation.errors },
    { status: 400 }
  );
}
```

---

### 3. Audit Logging (`app/lib/audit-logger.ts`)

Records sensitive operations for security monitoring and compliance.

**Logged Event Types:**
- Authentication: login, logout, signup, failed attempts
- Card operations: add, delete, view
- Transactions: create, view
- Redemptions: create, approve, complete
- Profile: update, view
- Security: rate limit violations, validation failures, suspicious activity

**Usage Example:**
```typescript
import { logAuthEvent } from "@/app/lib/audit-logger";

// Log successful login
logAuthEvent("auth.login", userId, request, "success", {
  method: "password"
});

// Log failed login attempt
logAuthEvent("auth.failed_login", undefined, request, "failure", {
  username: sanitizedUsername,
  reason: "invalid_credentials"
});
```

**Structured Log Format:**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "event_type": "auth.login",
  "user_id": 123,
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "resource_type": "auth",
  "action": "login",
  "status": "success",
  "service": "finpoints",
  "environment": "production"
}
```

**Convenience Functions:**
- `logAuthEvent()` - Authentication events
- `logCardEvent()` - Card operations
- `logTransactionEvent()` - Transaction operations
- `logRedemptionEvent()` - Redemption operations
- `logProfileEvent()` - Profile changes
- `logSecurityEvent()` - Security violations

**Sensitive Data Protection:**
All logs automatically sanitize:
- Passwords
- Card numbers
- CVV codes
- Encryption keys
- API tokens

---

### 4. Security Utilities (`app/lib/security-utils.ts`)

Common security functions for the application.

#### SQL Injection Detection
```typescript
import { containsSQLInjectionPattern } from "@/app/lib/security-utils";

if (containsSQLInjectionPattern(userInput)) {
  logSecurityEvent("security.suspicious_activity", userId, request, {
    pattern: "sql_injection",
    input: "[REDACTED]"
  });
  return NextResponse.json(
    { error: "Invalid input" },
    { status: 400 }
  );
}
```

#### XSS Pattern Detection
```typescript
import { containsXSSPattern } from "@/app/lib/security-utils";

if (containsXSSPattern(userInput)) {
  // Block and log suspicious input
}
```

#### Path Traversal Detection
```typescript
import { containsPathTraversal } from "@/app/lib/security-utils";

if (containsPathTraversal(filePath)) {
  // Block directory traversal attempts
}
```

#### Secure Error Messages
```typescript
import { getSafeErrorMessage } from "@/app/lib/security-utils";

try {
  // ... operation
} catch (error) {
  const safeMessage = getSafeErrorMessage(error);
  // Returns generic message for sensitive errors
  // Never exposes stack traces, file paths, or SQL errors to clients
  return NextResponse.json({ error: safeMessage }, { status: 500 });
}
```

#### Security Headers
```typescript
import { createSecureResponse } from "@/app/lib/security-utils";

// Automatically includes security headers:
// - X-Content-Type-Options: nosniff
// - X-XSS-Protection: 1; mode=block
// - X-Frame-Options: DENY
// - Referrer-Policy: strict-origin-when-cross-origin
// - Content-Security-Policy
// - Permissions-Policy

return createSecureResponse({ data: result }, 200);
```

---

## Defense in Depth Strategy

### Layer 1: Input Validation
1. **Whitelist validation** for categories, enums
2. **Type checking** for numbers, dates, strings
3. **Length limits** on all text inputs
4. **Format validation** for phones, emails, cards
5. **Bounds checking** for numeric values

### Layer 2: Sanitization
1. **HTML stripping** to prevent XSS
2. **Null byte removal** to prevent injection
3. **SQL pattern detection** as secondary check
4. **Object key sanitization** to prevent prototype pollution
5. **JSON depth limits** to prevent DoS

### Layer 3: Parameterized Queries
1. **Never** concatenate user input into SQL
2. Always use **parameterized queries** via `pg` library
3. SQL identifiers validated with `isValidSQLIdentifier()`

### Layer 4: Encryption
1. **AES-256-CBC** for card numbers (see `crypto.ts`)
2. **SHA-256** for CVV hashing
3. **Unique IV** per encryption operation
4. **Key derivation** from environment secret

### Layer 5: Rate Limiting
1. **Per-endpoint** limits
2. **Sliding window** algorithm
3. **User and IP-based** tracking
4. **Graceful degradation** with Retry-After headers

### Layer 6: Audit Logging
1. **All sensitive operations** logged
2. **Structured logging** for analysis
3. **Automatic PII sanitization**
4. **Centralized monitoring** (production)

### Layer 7: Secure Responses
1. **Security headers** on all responses
2. **Safe error messages** without leaking implementation
3. **CORS restrictions** by origin
4. **HTTPS enforcement** (production)

---

## Security Checklist for New Endpoints

When creating a new API endpoint:

- [ ] Add authentication check via `verifySession()`
- [ ] Implement rate limiting with appropriate limits
- [ ] Sanitize all input parameters
- [ ] Use parameterized queries for database access
- [ ] Add audit logging for sensitive operations
- [ ] Return safe error messages via `getSafeErrorMessage()`
- [ ] Add security headers via `createSecureResponse()` or `addSecurityHeaders()`
- [ ] Validate authorization (user can only access their own data)
- [ ] Add input validation tests
- [ ] Document any new sensitive operations

---

## Common Vulnerability Prevention

### SQL Injection
**Prevented by:**
- Parameterized queries (primary defense)
- Input sanitization (secondary)
- SQL pattern detection (monitoring)

**Example Safe Query:**
```typescript
// ✅ SAFE - Parameterized
await pool.query(
  "SELECT * FROM users WHERE id = $1",
  [userId]
);

// ❌ UNSAFE - String concatenation
await pool.query(
  `SELECT * FROM users WHERE id = ${userId}` // NEVER DO THIS
);
```

### XSS (Cross-Site Scripting)
**Prevented by:**
- HTML sanitization on all text inputs
- React's automatic escaping in JSX
- Content-Security-Policy headers
- XSS pattern detection

### CSRF (Cross-Site Request Forgery)
**Prevented by:**
- Session-based auth with HTTP-only cookies
- Origin header validation
- Same-site cookie attribute
- No CORS for sensitive endpoints

### Brute Force Attacks
**Prevented by:**
- Rate limiting on authentication endpoints
- Account lockout after repeated failures (TODO)
- Audit logging of failed attempts
- Suspicious activity detection

### Data Exposure
**Prevented by:**
- Never returning sensitive data in errors
- PII sanitization in logs
- Encryption of card data at rest
- Secure error messages only

### Injection Attacks
**Prevented by:**
- Parameterized SQL queries
- Input sanitization
- Type validation
- Whitelist validation for enums

---

## Production Recommendations

### Environment Variables
```env
# Required for production
DATABASE_URL=postgresql://...
SESSION_SECRET=<long-random-string>
ENCRYPTION_KEY=<32-byte-hex-string>

# Optional security enhancements
ALLOWED_ORIGINS=https://finpoints.com,https://www.finpoints.com
ENABLE_RATE_LIMITING=true
LOG_LEVEL=info
SENTRY_DSN=<sentry-dsn-for-error-tracking>
```

### Infrastructure Security
1. **HTTPS Only**: Force HTTPS in production
2. **Firewall Rules**: Restrict database access to app servers only
3. **Secrets Management**: Use AWS Secrets Manager, Vault, or similar
4. **Regular Updates**: Keep dependencies updated
5. **Security Scanning**: Run automated security scans (npm audit, Snyk)
6. **WAF**: Consider Web Application Firewall (CloudFlare, AWS WAF)
7. **DDoS Protection**: Use CloudFlare or similar service
8. **Monitoring**: Set up alerts for security events

### Audit Log Storage
- **Development**: Console logs
- **Production**: Send to centralized logging service
  - AWS CloudWatch
  - Datadog
  - Splunk
  - ELK Stack
- **Retention**: Keep audit logs for at least 90 days (compliance)
- **Access Control**: Restrict audit log access to security team

### Rate Limiting in Production
- **Redis Backend**: Replace in-memory store with Redis for distributed systems
- **CDN Layer**: Implement rate limiting at CDN level (CloudFlare)
- **Progressive Penalties**: Increase lockout duration for repeat offenders
- **Geographic Restrictions**: Block requests from high-risk countries (optional)

---

## Compliance Considerations

### PCI DSS (Payment Card Industry)
**Note**: This app does NOT process actual payments or store full card numbers.
- Card numbers are encrypted with AES-256
- CVV is hashed (SHA-256), never stored plain
- No actual payment processing occurs

**If adding real payment processing:**
- Use PCI-compliant payment gateway (Stripe, Braintree)
- Never handle raw card data directly
- Implement SAQ (Self-Assessment Questionnaire)
- Regular security audits required

### GDPR (General Data Protection Regulation)
**If serving EU users:**
- Add consent management for data collection
- Implement "Right to be Forgotten" (account deletion)
- Data export functionality
- Privacy policy with clear data usage
- Opt-out of analytics/tracking

### SOC 2
**For enterprise customers:**
- Formalize audit logging
- Access control policies
- Incident response plan
- Regular penetration testing
- Security awareness training

---

## Testing Security

### Manual Testing
```bash
# Test rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}'
done

# Should return 429 after 5 attempts
```

### Automated Testing
```typescript
// Example security test
describe("Input Sanitization", () => {
  test("blocks SQL injection", () => {
    const input = "admin' OR '1'='1";
    expect(containsSQLInjectionPattern(input)).toBe(true);
  });
  
  test("strips XSS attempts", () => {
    const input = "<script>alert('xss')</script>";
    const sanitized = sanitizeHTML(input);
    expect(sanitized).not.toContain("<script>");
  });
});
```

---

## Incident Response

If a security incident occurs:

1. **Isolate**: Block affected systems/users
2. **Investigate**: Review audit logs
3. **Contain**: Patch the vulnerability
4. **Notify**: Inform affected users (if data breach)
5. **Document**: Write incident report
6. **Improve**: Update security measures

### Security Contacts
- **Security Issues**: security@finpoints.com (TODO: set up)
- **Bug Bounty**: Consider HackerOne or Bugcrowd program

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [CWE (Common Weakness Enumeration)](https://cwe.mitre.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

---

**Last Updated:** Task 17 Implementation
**Version:** 1.0
**Security Contact:** security@finpoints.com (TODO)
