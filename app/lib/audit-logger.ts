/**
 * Audit Logging Utility
 * 
 * Logs sensitive operations for security monitoring and compliance.
 * In production, these logs should be sent to a centralized logging service.
 */

export type AuditEventType =
  | "auth.login"
  | "auth.logout"
  | "auth.signup"
  | "auth.failed_login"
  | "card.add"
  | "card.delete"
  | "card.view"
  | "transaction.create"
  | "transaction.view"
  | "redemption.create"
  | "redemption.approve"
  | "redemption.complete"
  | "profile.update"
  | "profile.view"
  | "onboarding.complete"
  | "session.created"
  | "session.expired"
  | "rate_limit.exceeded"
  | "validation.failed"
  | "security.suspicious_activity";

export interface AuditLogEntry {
  timestamp: string;
  event_type: AuditEventType;
  user_id?: number;
  ip_address?: string;
  user_agent?: string;
  resource_type?: string;
  resource_id?: string | number;
  action: string;
  status: "success" | "failure" | "warning";
  details?: Record<string, any>;
  error_message?: string;
}

/**
 * Log an audit event
 * 
 * @param entry - Audit log entry
 */
export function logAuditEvent(entry: AuditLogEntry): void {
  // Add timestamp if not provided
  if (!entry.timestamp) {
    entry.timestamp = new Date().toISOString();
  }
  
  // In production, send to logging service (e.g., CloudWatch, Datadog, Splunk)
  // For now, log to console with structured format
  
  const logLevel = entry.status === "failure" ? "error" : entry.status === "warning" ? "warn" : "info";
  
  const logMessage = {
    ...entry,
    service: "finpoints",
    environment: process.env.NODE_ENV || "development"
  };
  
  // Use console methods based on status
  if (logLevel === "error") {
    console.error("[AUDIT]", JSON.stringify(logMessage));
  } else if (logLevel === "warn") {
    console.warn("[AUDIT]", JSON.stringify(logMessage));
  } else {
    console.log("[AUDIT]", JSON.stringify(logMessage));
  }
  
  // TODO: In production, also send to:
  // - Centralized logging service (CloudWatch, Datadog, etc.)
  // - SIEM system for security monitoring
  // - Compliance database for regulatory requirements
}

/**
 * Extract request metadata for audit logging
 */
export function getRequestMetadata(request: Request): {
  ip_address: string;
  user_agent: string;
} {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  
  const ip = cfConnectingIp || realIp || forwardedFor?.split(",")[0] || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  
  return {
    ip_address: ip,
    user_agent: userAgent
  };
}

/**
 * Sanitize sensitive data before logging
 * Removes or masks sensitive information
 */
export function sanitizeForLogging(data: any): any {
  if (!data || typeof data !== "object") {
    return data;
  }
  
  const sensitiveKeys = [
    "password",
    "card_number",
    "cvv",
    "cvv_hash",
    "encrypted_card_number",
    "encryption_key",
    "token",
    "secret",
    "api_key"
  ];
  
  const sanitized = { ...data };
  
  for (const key of sensitiveKeys) {
    if (key in sanitized) {
      sanitized[key] = "[REDACTED]";
    }
  }
  
  return sanitized;
}

// Convenience functions for common audit events

export function logAuthEvent(
  eventType: "auth.login" | "auth.logout" | "auth.signup" | "auth.failed_login",
  userId: number | undefined,
  request: Request,
  status: "success" | "failure",
  details?: Record<string, any>
): void {
  const metadata = getRequestMetadata(request);
  
  logAuditEvent({
    timestamp: new Date().toISOString(),
    event_type: eventType,
    user_id: userId,
    ip_address: metadata.ip_address,
    user_agent: metadata.user_agent,
    resource_type: "auth",
    action: eventType.split(".")[1],
    status,
    details: sanitizeForLogging(details)
  });
}

export function logCardEvent(
  eventType: "card.add" | "card.delete" | "card.view",
  userId: number,
  cardId: number | undefined,
  request: Request,
  status: "success" | "failure",
  details?: Record<string, any>
): void {
  const metadata = getRequestMetadata(request);
  
  logAuditEvent({
    timestamp: new Date().toISOString(),
    event_type: eventType,
    user_id: userId,
    ip_address: metadata.ip_address,
    user_agent: metadata.user_agent,
    resource_type: "card",
    resource_id: cardId,
    action: eventType.split(".")[1],
    status,
    details: sanitizeForLogging(details)
  });
}

export function logTransactionEvent(
  eventType: "transaction.create" | "transaction.view",
  userId: number,
  transactionId: number | undefined,
  request: Request,
  status: "success" | "failure",
  details?: Record<string, any>
): void {
  const metadata = getRequestMetadata(request);
  
  logAuditEvent({
    timestamp: new Date().toISOString(),
    event_type: eventType,
    user_id: userId,
    ip_address: metadata.ip_address,
    user_agent: metadata.user_agent,
    resource_type: "transaction",
    resource_id: transactionId,
    action: eventType.split(".")[1],
    status,
    details: sanitizeForLogging(details)
  });
}

export function logRedemptionEvent(
  eventType: "redemption.create" | "redemption.approve" | "redemption.complete",
  userId: number,
  redemptionId: number | undefined,
  request: Request,
  status: "success" | "failure",
  details?: Record<string, any>
): void {
  const metadata = getRequestMetadata(request);
  
  logAuditEvent({
    timestamp: new Date().toISOString(),
    event_type: eventType,
    user_id: userId,
    ip_address: metadata.ip_address,
    user_agent: metadata.user_agent,
    resource_type: "redemption",
    resource_id: redemptionId,
    action: eventType.split(".")[1],
    status,
    details: sanitizeForLogging(details)
  });
}

export function logProfileEvent(
  eventType: "profile.update" | "profile.view",
  userId: number,
  request: Request,
  status: "success" | "failure",
  details?: Record<string, any>
): void {
  const metadata = getRequestMetadata(request);
  
  logAuditEvent({
    timestamp: new Date().toISOString(),
    event_type: eventType,
    user_id: userId,
    ip_address: metadata.ip_address,
    user_agent: metadata.user_agent,
    resource_type: "profile",
    resource_id: userId,
    action: eventType.split(".")[1],
    status,
    details: sanitizeForLogging(details)
  });
}

export function logSecurityEvent(
  eventType: "rate_limit.exceeded" | "validation.failed" | "security.suspicious_activity",
  userId: number | undefined,
  request: Request,
  details?: Record<string, any>,
  errorMessage?: string
): void {
  const metadata = getRequestMetadata(request);
  
  logAuditEvent({
    timestamp: new Date().toISOString(),
    event_type: eventType,
    user_id: userId,
    ip_address: metadata.ip_address,
    user_agent: metadata.user_agent,
    resource_type: "security",
    action: eventType.split(".")[1] || eventType,
    status: "warning",
    details: sanitizeForLogging(details),
    error_message: errorMessage
  });
}
