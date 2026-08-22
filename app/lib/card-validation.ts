/**
 * Validates credit/debit card number using Luhn algorithm
 */
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, "");
  
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Validates card expiry date (MM/YY or MM/YYYY format)
 */
export function validateExpiry(expiry: string): boolean {
  const cleaned = expiry.replace(/\s/g, "");
  
  // Check format MM/YY or MM/YYYY
  if (!/^\d{2}\/\d{2,4}$/.test(cleaned)) {
    return false;
  }
  
  const [month, year] = cleaned.split("/");
  const monthNum = parseInt(month, 10);
  
  if (monthNum < 1 || monthNum > 12) {
    return false;
  }
  
  // Convert to full year
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  let fullYear = parseInt(year, 10);
  
  if (fullYear < 100) {
    fullYear += 2000;
  }
  
  // Check if expired
  if (fullYear < currentYear) {
    return false;
  }
  
  if (fullYear === currentYear && monthNum < currentMonth) {
    return false;
  }
  
  return true;
}

/**
 * Validates CVV (3 or 4 digits)
 */
export function validateCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

/**
 * Formats card number with spaces (XXXX XXXX XXXX XXXX)
 */
export function formatCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, "");
  const parts = cleaned.match(/.{1,4}/g) || [];
  return parts.join(" ");
}

/**
 * Detects card type from card number
 */
export function detectCardType(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, "");
  
  if (/^4/.test(cleaned)) return "Visa";
  if (/^5[1-5]/.test(cleaned)) return "Mastercard";
  if (/^3[47]/.test(cleaned)) return "American Express";
  if (/^6(?:011|5)/.test(cleaned)) return "Discover";
  if (/^9792/.test(cleaned)) return "Troy"; // Turkish cards
  if (/^35/.test(cleaned)) return "JCB";
  
  return "Unknown";
}

/**
 * Validates Pakistani phone number format
 */
export function validatePakistaniPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  
  // Format: +92XXXXXXXXXX or 03XXXXXXXXX
  return /^(\+92|92|0)?3\d{9}$/.test(cleaned);
}

/**
 * Formats Pakistani phone number
 */
export function formatPakistaniPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  
  if (cleaned.startsWith("+92")) {
    return cleaned.replace(/(\+92)(\d{3})(\d{7})/, "$1 $2 $3");
  }
  
  if (cleaned.startsWith("92")) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{7})/, "+$1 $2 $3");
  }
  
  if (cleaned.startsWith("0")) {
    return cleaned.replace(/(\d{4})(\d{7})/, "$1 $2");
  }
  
  return phone;
}
