/**
 * Rate Limiting Utility
 * 
 * Implements in-memory rate limiting for API endpoints to prevent abuse.
 * Uses sliding window algorithm with configurable limits per endpoint.
 * 
 * Note: This is a session-based in-memory implementation.
 * For production, consider Redis-based rate limiting for distributed systems.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
  requests: number[];
}

// In-memory store for rate limit tracking
// Key format: "endpoint:identifier" (e.g., "auth:192.168.1.1" or "auth:user123")
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number;
  
  /**
   * Time window in seconds
   */
  windowSeconds: number;
  
  /**
   * Optional message to return when rate limit is exceeded
   */
  message?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Default rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  // Authentication endpoints - stricter limits
  AUTH: {
    maxRequests: 5,
    windowSeconds: 900, // 15 minutes
    message: "Too many authentication attempts. Please try again in 15 minutes."
  },
  
  // Transaction creation - moderate limits
  TRANSACTION_CREATE: {
    maxRequests: 20,
    windowSeconds: 60, // 1 minute
    message: "Too many transactions. Please slow down."
  },
  
  // Redemption - moderate limits (prevents rapid point spending)
  REDEMPTION: {
    maxRequests: 10,
    windowSeconds: 300, // 5 minutes
    message: "Too many redemption attempts. Please wait a few minutes."
  },
  
  // General API - lenient limits
  GENERAL: {
    maxRequests: 100,
    windowSeconds: 60, // 1 minute
    message: "Too many requests. Please slow down."
  },
  
  // Read-only endpoints - very lenient
  READ_ONLY: {
    maxRequests: 200,
    windowSeconds: 60, // 1 minute
    message: "Too many requests. Please slow down."
  }
} as const;

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Unique identifier (IP address, user ID, session ID)
 * @param endpoint - Endpoint name for tracking
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  
  let entry = rateLimitStore.get(key);
  
  // Initialize or reset if window has passed
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
      requests: []
    };
    rateLimitStore.set(key, entry);
  }
  
  // Remove requests outside the sliding window
  entry.requests = entry.requests.filter(timestamp => timestamp > now - windowMs);
  
  // Check if limit exceeded
  if (entry.requests.length >= config.maxRequests) {
    const oldestRequest = entry.requests[0];
    const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);
    
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter
    };
  }
  
  // Allow request and record timestamp
  entry.requests.push(now);
  entry.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.requests.length,
    resetAt: entry.resetAt
  };
}

/**
 * Clear rate limit for a specific identifier (useful for testing or admin override)
 */
export function clearRateLimit(identifier: string, endpoint: string): void {
  const key = `${endpoint}:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Get rate limit status without incrementing counter
 */
export function getRateLimitStatus(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetAt < now) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: now + windowMs
    };
  }
  
  // Filter requests within window
  const validRequests = entry.requests.filter(timestamp => timestamp > now - windowMs);
  const remaining = config.maxRequests - validRequests.length;
  
  if (remaining <= 0) {
    const oldestRequest = validRequests[0];
    const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);
    
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter
    };
  }
  
  return {
    allowed: true,
    remaining,
    resetAt: entry.resetAt
  };
}

/**
 * Helper to get client identifier from request
 * Uses IP address as fallback, but prefers user ID if authenticated
 */
export function getClientIdentifier(request: Request, userId?: number): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  // Try to get IP from various headers (for proxies/load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  
  const ip = cfConnectingIp || realIp || forwardedFor?.split(",")[0] || "unknown";
  
  return `ip:${ip}`;
}
