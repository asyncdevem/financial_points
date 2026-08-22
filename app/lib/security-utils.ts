/**
 * Security Utilities
 * 
 * Common security functions for the application
 */

/**
 * Generate a secure random token
 * 
 * @param length - Length of the token in bytes (default: 32)
 * @returns Hex-encoded random token
 */
export function generateSecureToken(length: number = 32): string {
  const crypto = require("crypto");
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Constant-time string comparison to prevent timing attacks
 * 
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  const crypto = require("crypto");
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Check if a string contains SQL injection patterns
 * This is a basic check - parameterized queries are the primary defense
 * 
 * @param input - String to check
 * @returns True if suspicious patterns detected
 */
export function containsSQLInjectionPattern(input: string): boolean {
  const suspiciousPatterns = [
    /(\bOR\b.*=.*)/i,          // OR 1=1
    /(\bAND\b.*=.*)/i,         // AND 1=1
    /(\bUNION\b.*\bSELECT\b)/i, // UNION SELECT
    /(--)/,                     // SQL comment
    /(\/\*|\*\/)/,              // SQL comment
    /(\bDROP\b.*\bTABLE\b)/i,   // DROP TABLE
    /(\bINSERT\b.*\bINTO\b)/i,  // INSERT INTO
    /(\bDELETE\b.*\bFROM\b)/i,  // DELETE FROM
    /(\bUPDATE\b.*\bSET\b)/i,   // UPDATE SET
    /(';)/,                     // '; pattern
    /(\bEXEC\b)/i,              // EXEC
    /(\bEXECUTE\b)/i            // EXECUTE
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Check if a string contains XSS patterns
 * 
 * @param input - String to check
 * @returns True if suspicious patterns detected
 */
export function containsXSSPattern(input: string): boolean {
  const suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/i,
    /<iframe[^>]*>/i,
    /<object[^>]*>/i,
    /<embed[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,  // onclick=, onload=, etc.
    /<img[^>]*onerror/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Check for path traversal attempts
 * 
 * @param path - Path string to check
 * @returns True if path traversal detected
 */
export function containsPathTraversal(path: string): boolean {
  const suspiciousPatterns = [
    /\.\./,       // ../
    /\.\\/,       // .\
    /~\//,        // ~/
    /%2e%2e/i,    // URL encoded ..
    /%5c/i,       // URL encoded \
    /\0/          // Null byte
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(path));
}

/**
 * Validate origin header for CSRF protection
 * 
 * @param origin - Origin header value
 * @param allowedOrigins - List of allowed origins
 * @returns True if origin is allowed
 */
export function isValidOrigin(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) {
    return false;
  }
  
  return allowedOrigins.some(allowed => {
    if (allowed === "*") {
      return true;
    }
    
    // Exact match
    if (origin === allowed) {
      return true;
    }
    
    // Wildcard subdomain match (e.g., *.example.com)
    if (allowed.startsWith("*.")) {
      const domain = allowed.substring(2);
      return origin.endsWith(domain);
    }
    
    return false;
  });
}

/**
 * Get allowed origins for the application
 * In production, this should be from environment variables
 */
export function getAllowedOrigins(): string[] {
  const env = process.env.NODE_ENV || "development";
  
  if (env === "production") {
    // TODO: Set production origins from environment
    return [
      process.env.NEXT_PUBLIC_APP_URL || "https://finpoints.com"
    ];
  }
  
  // Development origins
  return [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001"
  ];
}

/**
 * Redact sensitive information from error messages
 * 
 * @param error - Error object or message
 * @returns Safe error message for client
 */
export function getSafeErrorMessage(error: unknown): string {
  // Never expose internal errors to clients
  // Return generic messages instead
  
  if (typeof error === "string") {
    // Don't expose SQL errors, file paths, or stack traces
    if (
      error.includes("SQL") ||
      error.includes("database") ||
      error.includes("/") ||
      error.includes("\\") ||
      error.includes("Error:")
    ) {
      return "An internal error occurred";
    }
    
    return error;
  }
  
  if (error instanceof Error) {
    // Known safe error types
    const safeErrors = [
      "Unauthorized",
      "Invalid credentials",
      "Session expired",
      "Insufficient points",
      "Card not found",
      "Invalid input"
    ];
    
    if (safeErrors.some(safe => error.message.includes(safe))) {
      return error.message;
    }
    
    return "An internal error occurred";
  }
  
  return "An unexpected error occurred";
}

/**
 * Check if request is coming from a suspicious source
 * Basic heuristics - expand based on your threat model
 * 
 * @param request - Request object
 * @returns True if request looks suspicious
 */
export function isSuspiciousRequest(request: Request): boolean {
  const userAgent = request.headers.get("user-agent");
  
  // No user agent (likely a bot)
  if (!userAgent) {
    return true;
  }
  
  // Known scanner/bot patterns
  const suspiciousAgents = [
    "sqlmap",
    "nikto",
    "nmap",
    "masscan",
    "nessus",
    "metasploit",
    "burp",
    "zaproxy"
  ];
  
  const lowerAgent = userAgent.toLowerCase();
  if (suspiciousAgents.some(agent => lowerAgent.includes(agent))) {
    return true;
  }
  
  // Extremely short user agent
  if (userAgent.length < 10) {
    return true;
  }
  
  return false;
}

/**
 * Security headers for API responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",
    
    // Enable XSS protection
    "X-XSS-Protection": "1; mode=block",
    
    // Prevent clickjacking
    "X-Frame-Options": "DENY",
    
    // Control referrer information
    "Referrer-Policy": "strict-origin-when-cross-origin",
    
    // Content Security Policy (basic)
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
    
    // Permissions Policy
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
  };
}

/**
 * Add security headers to a Response
 */
export function addSecurityHeaders(response: Response): Response {
  const headers = getSecurityHeaders();
  
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  
  return response;
}

/**
 * Create a secure API response with standard headers
 */
export function createSecureResponse(
  data: any,
  status: number = 200,
  additionalHeaders?: Record<string, string>
): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getSecurityHeaders(),
    ...additionalHeaders
  };
  
  return new Response(JSON.stringify(data), {
    status,
    headers
  });
}
