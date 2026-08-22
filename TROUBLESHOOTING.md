# Troubleshooting Guide

This guide provides solutions to common issues encountered when running FinPoints.

---

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Database Issues](#database-issues)
3. [Authentication Issues](#authentication-issues)
4. [API Issues](#api-issues)
5. [Performance Issues](#performance-issues)
6. [Security Issues](#security-issues)
7. [Deployment Issues](#deployment-issues)
8. [Common Error Messages](#common-error-messages)

---

## Installation Issues

### Error: `npm install` fails with EACCES

**Symptom:**
```
npm ERR! code EACCES
npm ERR! syscall access
npm ERR! path /usr/local/lib/node_modules
```

**Solution:**
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

---

### Error: Node version mismatch

**Symptom:**
```
error: The engine "node" is incompatible with this module
```

**Solution:**
```bash
# Check Node version
node --version

# Install correct version (18+)
nvm install 18
nvm use 18

# Or using n
sudo npm install -g n
sudo n 18
```

---

### Error: TypeScript compilation fails

**Symptom:**
```
Type error: Cannot find module '@/app/lib/db'
```

**Solution:**
```bash
# Clean build cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

---

## Database Issues

### Error: Connection refused (ECONNREFUSED)

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

1. **Check if PostgreSQL is running:**
```bash
# Linux
sudo systemctl status postgresql

# macOS
brew services list

# Start if not running
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS
```

2. **Verify connection string:**
```bash
# Test connection
psql -U finpoints -d finpoints -h localhost

# If fails, check DATABASE_URL in .env.local
DATABASE_URL=postgresql://finpoints:password@localhost:5432/finpoints
```

3. **Check firewall:**
```bash
# Linux
sudo ufw allow 5432/tcp

# macOS
sudo pfctl -d  # Disable firewall temporarily
```

---

### Error: Database "finpoints" does not exist

**Symptom:**
```
error: database "finpoints" does not exist
```

**Solution:**
```bash
# Create database
createdb finpoints

# Initialize schema
psql -d finpoints -f scripts/init-db.sql

# Verify
psql -d finpoints -c "\dt"
```

---

### Error: Permission denied for table

**Symptom:**
```
error: permission denied for table user_profiles
```

**Solution:**
```sql
-- Connect as superuser
psql -U postgres

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE finpoints TO finpoints;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO finpoints;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO finpoints;
```

---

### Error: Too many connections

**Symptom:**
```
Error: remaining connection slots are reserved
```

**Solution:**
```sql
-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- Increase max_connections in postgresql.conf
max_connections = 100

-- Or reduce pool size in app
DATABASE_POOL_MAX=5
```

---

## Authentication Issues

### Error: Session expired immediately after login

**Symptom:**
User logs in successfully but is immediately logged out.

**Solutions:**

1. **Check SESSION_SECRET:**
```env
# Ensure SESSION_SECRET is set and consistent
SESSION_SECRET=your-64-character-hex-string-here
```

2. **Clear cookies:**
```javascript
// In browser console
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

3. **Check cookie settings:**
```typescript
// In session.ts
cookie: {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Must be true in prod
  sameSite: "lax",
  maxAge: 900000 // 15 minutes
}
```

---

### Error: "Unauthorized" on all API requests

**Symptom:**
All protected API routes return 401 Unauthorized.

**Solutions:**

1. **Verify session middleware:**
```typescript
// Check verifySession() is called
const sessionData = await verifySession();
if (!sessionData) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

2. **Check credentials mode:**
```javascript
// In fetch requests
fetch('/api/profile', {
  credentials: 'include' // Required for cookies
})
```

3. **CORS issues:**
```typescript
// In middleware or API routes
headers: {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': request.headers.get('origin') || '*'
}
```

---

## API Issues

### Error: 429 Too Many Requests

**Symptom:**
```json
{
  "error": "Too many attempts. Please try again in 15 minutes.",
  "retry_after": 900
}
```

**Solutions:**

1. **Wait for rate limit to reset** (check `retry_after` value)

2. **Clear rate limit (development only):**
```typescript
import { clearRateLimit } from "@/app/lib/rate-limiter";

clearRateLimit("ip:127.0.0.1", "auth");
```

3. **Adjust rate limits:**
```typescript
// In rate-limiter.ts
export const RATE_LIMITS = {
  AUTH: {
    maxRequests: 10, // Increase from 5
    windowSeconds: 900
  }
};
```

---

### Error: Invalid card number

**Symptom:**
Card validation fails with "Invalid card number".

**Solutions:**

1. **Use valid test cards:**
```
Visa:       4111 1111 1111 1111
Mastercard: 5555 5555 5555 4444
Amex:       3782 822463 10005
```

2. **Check Luhn algorithm:**
```typescript
import { isValidCardNumber } from "@/app/lib/card-validation";

console.log(isValidCardNumber("4111111111111111")); // true
```

3. **Verify card not expired:**
```typescript
// Expiry must be current month or future
expiry_month: 12,
expiry_year: 2025 // Must be >= current year
```

---

### Error: Points calculation mismatch

**Symptom:**
Points earned don't match expected calculation.

**Solution:**
```typescript
import { calculatePoints } from "@/app/lib/points-engine";

// Formula: (amount / 100) × base_rate × multiplier
const amount = 5000;
const baseRate = 2;
const multiplier = 3; // dining

const points = calculatePoints(amount, baseRate, multiplier);
console.log(points); // Should be 300

// Verify card has correct multipliers
const card = await getUserCard(cardId);
console.log(card.category_multipliers.dining); // Should be 3
```

---

## Performance Issues

### Issue: Slow page load times

**Symptoms:**
- Pages take > 3 seconds to load
- API responses are slow

**Solutions:**

1. **Check database queries:**
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
SELECT pg_reload_conf();

-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

2. **Add database indexes:**
```sql
-- Common indexes
CREATE INDEX idx_transactions_user_date ON mock_transactions(user_id, transaction_date DESC);
CREATE INDEX idx_cards_user ON user_cards(user_id);
CREATE INDEX idx_redemptions_user_status ON redemptions(user_id, status);
```

3. **Enable connection pooling:**
```typescript
// In db.ts
const pool = new Pool({
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

---

### Issue: High memory usage

**Symptoms:**
- Node process uses > 2GB RAM
- Out of memory errors

**Solutions:**

1. **Limit response sizes:**
```typescript
// Add pagination
const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "50"), 100);
const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");
```

2. **Stream large responses:**
```typescript
// For large datasets
const stream = pool.query(new QueryStream('SELECT * FROM large_table'));
```

3. **Increase Node memory:**
```bash
# In package.json scripts
"start": "NODE_OPTIONS='--max-old-space-size=4096' next start"
```

---

## Security Issues

### Issue: CORS errors in production

**Symptom:**
```
Access to fetch at 'https://api.finpoints.com' from origin 'https://finpoints.com' has been blocked by CORS policy
```

**Solution:**
```typescript
// In middleware.ts or API routes
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  const origin = request.headers.get("origin");
  const allowedOrigins = [
    "https://finpoints.com",
    "https://www.finpoints.com"
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  
  return response;
}
```

---

### Issue: XSS vulnerability detected

**Symptom:**
Security scanner flags XSS vulnerability.

**Solution:**
```typescript
import { sanitizeHTML } from "@/app/lib/sanitization";

// Sanitize all user input
const safeMerchantName = sanitizeHTML(input.merchant_name);
const safeAddress = sanitizeHTML(input.address);

// Use React's built-in escaping (don't use dangerouslySetInnerHTML)
<div>{userInput}</div> // ✓ Safe
<div dangerouslySetInnerHTML={{__html: userInput}} /> // ✗ Unsafe
```

---

### Issue: SQL injection attempt detected

**Symptom:**
Audit logs show SQL injection patterns.

**Solution:**
```typescript
// Always use parameterized queries
await pool.query(
  "SELECT * FROM users WHERE id = $1", // ✓ Safe
  [userId]
);

// Never concatenate user input
await pool.query(
  `SELECT * FROM users WHERE id = ${userId}` // ✗ Unsafe
);

// Validate SQL identifiers
import { isValidSQLIdentifier } from "@/app/lib/sanitization";

if (!isValidSQLIdentifier(tableName)) {
  throw new Error("Invalid table name");
}
```

---

## Deployment Issues

### Error: Build fails in production

**Symptom:**
```
Error: Failed to compile
Module not found: Can't resolve '@/app/lib/db'
```

**Solutions:**

1. **Check tsconfig.json paths:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

2. **Verify all imports:**
```bash
# Find files with broken imports
grep -r "from '@/" app/ | grep -v ".next"
```

3. **Clear build cache:**
```bash
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

---

### Error: Environment variables not loaded

**Symptom:**
```
Error: DATABASE_URL is not defined
```

**Solutions:**

1. **Check .env file location:**
```bash
# Development
.env.local

# Production
.env.production

# Verify file exists
ls -la .env*
```

2. **Restart application:**
```bash
# Vercel
vercel --prod

# Self-hosted
pm2 restart finpoints

# Docker
docker-compose down && docker-compose up -d
```

3. **Check environment in Vercel:**
```bash
vercel env ls
vercel env pull .env.local
```

---

### Error: Database migrations fail

**Symptom:**
```
ERROR: relation "user_profiles" already exists
```

**Solutions:**

1. **Check if migrations were already run:**
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

2. **Reset database (development only):**
```bash
# Drop and recreate database
dropdb finpoints
createdb finpoints
psql -d finpoints -f scripts/init-db.sql
```

3. **Run migrations individually:**
```bash
# Run each section separately
psql -d finpoints -c "CREATE TABLE IF NOT EXISTS user_profiles (...);"
```

---

## Common Error Messages

### "Cannot read property 'id' of undefined"

**Cause:** Session data is null

**Solution:**
```typescript
// Always check session before accessing properties
const sessionData = await verifySession();
if (!sessionData) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const userId = sessionData.userId; // Now safe
```

---

### "FATAL: password authentication failed"

**Cause:** Incorrect database credentials

**Solution:**
```bash
# Reset PostgreSQL user password
sudo -u postgres psql
ALTER USER finpoints WITH PASSWORD 'new_password';
\q

# Update .env.local
DATABASE_URL=postgresql://finpoints:new_password@localhost:5432/finpoints
```

---

### "Error: listen EADDRINUSE: address already in use :::3000"

**Cause:** Port 3000 is already in use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=3001 npm run dev
```

---

### "Maximum call stack size exceeded"

**Cause:** Circular dependency or infinite loop

**Solution:**
```bash
# Check for circular dependencies
npx madge --circular app/

# Fix by refactoring imports
# Example: Move shared types to separate file
```

---

## Getting Help

If you can't resolve an issue:

1. **Check logs:**
```bash
# Application logs
pm2 logs finpoints

# Database logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

2. **Enable debug mode:**
```env
LOG_LEVEL=debug
NODE_ENV=development
```

3. **Contact support:**
- Email: support@finpoints.com
- GitHub Issues: Create a new issue with:
  - Error message
  - Steps to reproduce
  - Environment details (OS, Node version, etc.)
  - Relevant logs

---

## Diagnostic Commands

```bash
# Check system info
node --version
npm --version
psql --version

# Check application status
pm2 status
pm2 logs finpoints --lines 100

# Check database
psql -d finpoints -c "SELECT version();"
psql -d finpoints -c "\dt"  # List tables
psql -d finpoints -c "SELECT count(*) FROM user_profiles;"

# Check network
curl http://localhost:3000/api/health
netstat -tulpn | grep 3000

# Check disk space
df -h

# Check memory
free -h

# Check processes
top -c
ps aux | grep node
```

---

**Last Updated:** January 2024
