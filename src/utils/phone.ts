/**
 * Indian phone-number normalisation and validation.
 *
 * Accepts the ways people actually type numbers: 10-digit local, with a
 * leading 0, or already prefixed with +91 / 91 / 0091. Always normalises to
 * +91XXXXXXXXXX so duplicate detection works.
 */

export const COUNTRY_CODE = '+91';

/** Strip everything that isn't a digit. */
function digitsOnly(input: string): string {
  return input.replace(/\D/g, '');
}

/**
 * Normalise a raw user string to +91 + 10 digits, or return null when the
 * number cannot be an Indian mobile number.
 */
export function normalizePhone(input: string): string | null {
  let digits = digitsOnly(input);

  // Drop international prefixes, leaving the 10-digit national number.
  if (digits.startsWith('0091')) digits = digits.slice(4);
  else if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  else if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);

  if (digits.length !== 10) return null;
  // Indian mobile numbers begin 6-9 in current numbering plans.
  if (!/^[6-9]/.test(digits)) return null;

  return `${COUNTRY_CODE}${digits}`;
}

export function isValidPhone(input: string): boolean {
  return normalizePhone(input) !== null;
}

/** Display form: +91 98765 43210 (readable, groups of 5). */
export function formatPhoneForDisplay(normalized: string): string {
  const d = digitsOnly(normalized);
  if (d.length === 12 && d.startsWith('91')) {
    const national = d.slice(2);
    return `+91 ${national.slice(0, 5)} ${national.slice(5)}`;
  }
  return normalized;
}

/** Digits only, for tel: links. */
export function toTelLink(normalized: string): string {
  return `tel:${normalized}`;
}
