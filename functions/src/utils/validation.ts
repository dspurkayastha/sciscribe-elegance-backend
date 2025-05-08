// utils/validation.ts

/**
 * Honeypot field validation: returns true if honeypot is empty or not present (not spam)
 */
export function validateHoneypot(honeypot?: string): boolean {
  return !honeypot || honeypot === "";
}
