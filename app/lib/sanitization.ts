/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize and validate user inputs to prevent
 * injection attacks, XSS, and data corruption.
 */

/**
 * Sanitize string input by removing potentially harmful characters
 * and limiting length
 * 
 * @param input - Raw string input
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized string
 */
export function sanitizeString(input: unknown, maxLength: number = 1000): string {
  if (typeof input !== "string") {
    return "";
  }
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitize HTML to prevent XSS attacks
 * Basic implementation - removes all HTML tags
 * 
 * @param input - Raw HTML string
 * @returns Plain text without HTML tags
 */
export function sanitizeHTML(input: unknown): string {
  if (typeof input !== "string") {
    return "";
  }
  
  // Remove all HTML tags
  let sanitized = input.replace(/<[^>]*>/g, "");
  
  // Decode HTML entities to prevent double encoding attacks
  sanitized = sanitized
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");
  
  // Remove remaining HTML tags after decoding
  sanitized = sanitized.replace(/<[^>]*>/g, "");
  
  return sanitized.trim();
}

/**
 * Validate and sanitize email address
 * 
 * @param email - Email address to validate
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: unknown): string | null {
  if (typeof email !== "string") {
    return null;
  }
  
  const sanitized = sanitizeString(email, 254).toLowerCase();
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    return null;
  }
  
  return sanitized;
}

/**
 * Validate and sanitize phone number (Pakistani format)
 * 
 * @param phone - Phone number to validate
 * @returns Sanitized phone or null if invalid
 */
export function sanitizePhone(phone: unknown): string | null {
  if (typeof phone !== "string") {
    return null;
  }
  
  // Remove all non-digit characters except +
  const sanitized = phone.replace(/[^\d+]/g, "");
  
  // Pakistani phone validation: +92XXXXXXXXXX (13 chars) or 03XXXXXXXXX (11 chars)
  if (sanitized.startsWith("+92") && sanitized.length === 13) {
    return sanitized;
  }
  
  if (sanitized.startsWith("03") && sanitized.length === 11) {
    return `+92${sanitized.substring(1)}`;
  }
  
  return null;
}

/**
 * Sanitize numeric input
 * 
 * @param input - Input to parse as number
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Sanitized number or null if invalid
 */
export function sanitizeNumber(
  input: unknown,
  min?: number,
  max?: number
): number | null {
  let num: number;
  
  if (typeof input === "number") {
    num = input;
  } else if (typeof input === "string") {
    num = parseFloat(input);
  } else {
    return null;
  }
  
  // Check for NaN or Infinity
  if (!Number.isFinite(num)) {
    return null;
  }
  
  // Check bounds
  if (min !== undefined && num < min) {
    return null;
  }
  
  if (max !== undefined && num > max) {
    return null;
  }
  
  return num;
}

/**
 * Sanitize integer input
 * 
 * @param input - Input to parse as integer
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Sanitized integer or null if invalid
 */
export function sanitizeInteger(
  input: unknown,
  min?: number,
  max?: number
): number | null {
  const num = sanitizeNumber(input, min, max);
  
  if (num === null) {
    return null;
  }
  
  // Check if it's actually an integer
  if (!Number.isInteger(num)) {
    return null;
  }
  
  return num;
}

/**
 * Sanitize date input
 * 
 * @param input - Date string or Date object
 * @param minDate - Minimum allowed date
 * @param maxDate - Maximum allowed date
 * @returns Valid Date object or null if invalid
 */
export function sanitizeDate(
  input: unknown,
  minDate?: Date,
  maxDate?: Date
): Date | null {
  let date: Date;
  
  if (input instanceof Date) {
    date = input;
  } else if (typeof input === "string" || typeof input === "number") {
    date = new Date(input);
  } else {
    return null;
  }
  
  // Check for invalid date
  if (isNaN(date.getTime())) {
    return null;
  }
  
  // Check bounds
  if (minDate && date < minDate) {
    return null;
  }
  
  if (maxDate && date > maxDate) {
    return null;
  }
  
  return date;
}

/**
 * Validate SQL identifier (table name, column name)
 * Prevents SQL injection in dynamic queries
 * 
 * @param identifier - SQL identifier to validate
 * @returns True if valid identifier
 */
export function isValidSQLIdentifier(identifier: string): boolean {
  // SQL identifiers: alphanumeric, underscore, max 63 chars
  // Must start with letter or underscore
  const regex = /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/;
  return regex.test(identifier);
}

/**
 * Sanitize object keys to prevent prototype pollution
 * 
 * @param obj - Object to sanitize
 * @returns New object with safe keys
 */
export function sanitizeObjectKeys<T extends Record<string, any>>(obj: T): Partial<T> {
  const dangerous = ["__proto__", "constructor", "prototype"];
  const sanitized: Partial<T> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && !dangerous.includes(key)) {
      sanitized[key] = obj[key];
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize JSON input
 * 
 * @param input - JSON string or object
 * @param maxDepth - Maximum nesting depth (default: 5)
 * @returns Parsed and validated object or null if invalid
 */
export function sanitizeJSON(input: unknown, maxDepth: number = 5): any {
  let obj: any;
  
  if (typeof input === "string") {
    try {
      obj = JSON.parse(input);
    } catch {
      return null;
    }
  } else if (typeof input === "object" && input !== null) {
    obj = input;
  } else {
    return null;
  }
  
  // Check depth to prevent deeply nested objects
  function checkDepth(value: any, depth: number): boolean {
    if (depth > maxDepth) {
      return false;
    }
    
    if (typeof value === "object" && value !== null) {
      if (Array.isArray(value)) {
        return value.every(item => checkDepth(item, depth + 1));
      } else {
        return Object.values(value).every(val => checkDepth(val, depth + 1));
      }
    }
    
    return true;
  }
  
  if (!checkDepth(obj, 0)) {
    return null;
  }
  
  // Sanitize keys
  return sanitizeObjectKeys(obj);
}

/**
 * Sanitize category value (must be from allowed list)
 * 
 * @param category - Category to validate
 * @returns Valid category or null
 */
export function sanitizeCategory(category: unknown): string | null {
  const validCategories = [
    "dining",
    "groceries",
    "fuel",
    "travel",
    "shopping",
    "bills",
    "entertainment"
  ];
  
  if (typeof category !== "string") {
    return null;
  }
  
  const sanitized = category.toLowerCase().trim();
  
  if (validCategories.includes(sanitized)) {
    return sanitized;
  }
  
  return null;
}

/**
 * Sanitize redemption category
 */
export function sanitizeRedemptionCategory(category: unknown): string | null {
  const validCategories = [
    "vouchers",
    "bills",
    "cashback",
    "products",
    "charity"
  ];
  
  if (typeof category !== "string") {
    return null;
  }
  
  const sanitized = category.toLowerCase().trim();
  
  if (validCategories.includes(sanitized)) {
    return sanitized;
  }
  
  return null;
}

/**
 * Sanitize address input
 * 
 * @param address - Address string
 * @returns Sanitized address
 */
export function sanitizeAddress(address: unknown): string {
  if (typeof address !== "string") {
    return "";
  }
  
  // Remove HTML, trim, limit length
  let sanitized = sanitizeHTML(address);
  sanitized = sanitizeString(sanitized, 500);
  
  // Ensure minimum length for valid address
  if (sanitized.length < 10) {
    return "";
  }
  
  return sanitized;
}

/**
 * Sanitize merchant name
 */
export function sanitizeMerchantName(name: unknown): string {
  if (typeof name !== "string") {
    return "";
  }
  
  let sanitized = sanitizeHTML(name);
  sanitized = sanitizeString(sanitized, 200);
  
  // Ensure minimum length
  if (sanitized.length < 2) {
    return "";
  }
  
  return sanitized;
}

/**
 * Comprehensive input validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: any;
}

/**
 * Validate and sanitize transaction input
 */
export function validateTransactionInput(input: any): ValidationResult {
  const errors: string[] = [];
  const sanitized: any = {};
  
  // Card ID
  const cardId = sanitizeInteger(input.card_id, 1);
  if (cardId === null) {
    errors.push("Invalid card_id");
  } else {
    sanitized.card_id = cardId;
  }
  
  // Merchant name
  const merchantName = sanitizeMerchantName(input.merchant_name);
  if (!merchantName) {
    errors.push("Invalid merchant_name");
  } else {
    sanitized.merchant_name = merchantName;
  }
  
  // Category
  const category = sanitizeCategory(input.category);
  if (!category) {
    errors.push("Invalid category");
  } else {
    sanitized.category = category;
  }
  
  // Amount
  const amount = sanitizeNumber(input.amount, 1, 1000000);
  if (amount === null) {
    errors.push("Invalid amount (must be between 1 and 1,000,000)");
  } else {
    sanitized.amount = amount;
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : undefined
  };
}

/**
 * Validate and sanitize profile input
 */
export function validateProfileInput(input: any): ValidationResult {
  const errors: string[] = [];
  const sanitized: any = {};
  
  // Full name
  if (input.full_name !== undefined) {
    const fullName = sanitizeString(input.full_name, 100);
    if (fullName.length < 2) {
      errors.push("Invalid full_name (minimum 2 characters)");
    } else {
      sanitized.full_name = fullName;
    }
  }
  
  // Phone
  if (input.phone !== undefined) {
    const phone = sanitizePhone(input.phone);
    if (!phone) {
      errors.push("Invalid phone number (must be Pakistani format)");
    } else {
      sanitized.phone = phone;
    }
  }
  
  // Address
  if (input.address !== undefined) {
    const address = sanitizeAddress(input.address);
    if (!address) {
      errors.push("Invalid address (minimum 10 characters)");
    } else {
      sanitized.address = address;
    }
  }
  
  // Date of birth
  if (input.date_of_birth !== undefined) {
    const dob = sanitizeDate(input.date_of_birth);
    if (!dob) {
      errors.push("Invalid date_of_birth");
    } else {
      // Check age 18+
      const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) {
        errors.push("Must be at least 18 years old");
      } else {
        sanitized.date_of_birth = dob.toISOString();
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: errors.length === 0 ? sanitized : undefined
  };
}
