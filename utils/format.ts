/**
 * Formats an Egyptian phone number for the WhatsApp wa.me API.
 * The API expects the country code (20) followed by the 10-digit number.
 * 
 * Handles cases where:
 * - Number starts with 0 (e.g. 01012345678 -> 201012345678)
 * - Number already has country code with + (e.g. +201012345678 -> 201012345678)
 * - Number already has country code without + (e.g. 201012345678 -> 201012345678)
 * - Number contains spaces, dashes, or parentheses
 * 
 * @param phone The raw phone number string
 * @returns The formatted phone number for wa.me, or empty string if invalid
 */
export function formatEgyptianPhoneForWhatsApp(phone: string | null | undefined): string {
  if (!phone) return "";

  // 1. Strip all non-digit characters (spaces, dashes, plus signs, parentheses)
  const digitsOnly = phone.replace(/\D/g, "");

  if (!digitsOnly) return "";

  // 2. Handle Egyptian prefixes
  if (digitsOnly.startsWith("01") && digitsOnly.length === 11) {
    // Standard local format: 01xxxxxxxxx -> replace 0 with 20
    return `20${digitsOnly.substring(1)}`;
  }

  if (digitsOnly.startsWith("201") && digitsOnly.length === 12) {
    // Already has country code (with or without plus, since + was stripped)
    return digitsOnly;
  }

  // 3. Fallback: Return stripped digits (might not be a valid Egyptian mobile, but safe for API)
  return digitsOnly;
}
