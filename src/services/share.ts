import type { Facility } from '@/types';
import { formatPhoneForDisplay } from '@/utils/phone';

/**
 * Facility sharing helpers.
 *
 * These build wa.me / sms: links that a user reviews before sending. Only
 * public facility information is ever included — never the user's health
 * records, menstrual/pregnancy data, or journal logs (there is no code path
 * that mixes those into a share message).
 */

export function facilityShareText(f: Facility): string {
  const lines = [
    `${f.name}${f.isSample ? ' (demo)' : ''}`,
    `${f.type} • ${f.ownership}`,
    f.address,
    [f.village, f.block, f.district, f.state].filter(Boolean).join(', '),
  ];
  if (f.phone) lines.push(`Phone: ${formatPhoneForDisplay(f.phone)}`);
  if (f.free && f.feeVerified) lines.push('Free / subsidised');
  else if (f.feeNote) lines.push(f.feeNote);
  if (typeof window !== 'undefined') lines.push(window.location.origin);
  return lines.filter(Boolean).join('\n');
}

export function whatsappShareUrl(f: Facility): string {
  return `https://wa.me/?text=${encodeURIComponent(facilityShareText(f))}`;
}

export function smsShareUrl(f: Facility): string {
  // No pre-filled recipient: the user chooses who to send to.
  const body = encodeURIComponent(facilityShareText(f));
  // Use the non-address form so it opens a new SMS rather than texting a number.
  return typeof window !== 'undefined' && /iPhone|iPad/i.test(navigator.userAgent)
    ? `sms:&body=${body}`
    : `sms:?body=${body}`;
}

/** Native share when the platform supports it; returns false otherwise. */
export async function nativeShare(f: Facility): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) return false;
  try {
    await navigator.share({ title: f.name, text: facilityShareText(f) });
    return true;
  } catch {
    // User cancelled or share failed — caller falls back to links.
    return false;
  }
}
