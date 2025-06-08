// utils/validation.ts

/**
 * Honeypot field validation: returns true if honeypot is empty or not present
 *   (not spam)
 * @param {string} [honeypot]
 *   The honeypot field value used to determine
 *   if the request is spam or not
 * @return {boolean} True if honeypot is empty or not present (not spam)
 */
export function validateHoneypot(
  honeypot?: string
): boolean {
  return (
    !honeypot || honeypot === ""
  );
}
