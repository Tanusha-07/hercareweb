/**
 * Namespaced localStorage wrapper.
 *
 * Security rules baked in here:
 *  - Personal health records are scoped per-user (userId prefix) so a shared
 *    device does not mix one woman's data with another's.
 *  - Only non-sensitive preferences (language) and per-user records are stored.
 *  - OTPs and auth secrets are NEVER written through this module.
 */

const PREFIX = 'hercare';

/** Non-sensitive, device-wide preferences. */
export const KEYS = {
  language: `${PREFIX}:lang`,
  session: `${PREFIX}:session`,
  onboardingDone: `${PREFIX}:onboarded`,
} as const;

function scoped(userId: string, kind: string): string {
  return `${PREFIX}:user:${userId}:${kind}`;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof localStorage === 'undefined') return fallback;
    return safeParse(localStorage.getItem(key), fallback);
  },
  set(key: string, value: unknown): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  },

  /** Per-user record list. */
  readRecords<T>(userId: string, kind: string, fallback: T[] = []): T[] {
    return this.get<T[]>(scoped(userId, kind), fallback);
  },
  writeRecords<T>(userId: string, kind: string, records: T[]): void {
    this.set(scoped(userId, kind), records);
  },
  readObject<T>(userId: string, kind: string, fallback: T): T {
    return this.get<T>(scoped(userId, kind), fallback);
  },
  writeObject<T>(userId: string, kind: string, value: T): void {
    this.set(scoped(userId, kind), value);
  },

  /** Wipe every record for a user (logout / account deletion / quick safety). */
  clearUser(userId: string): void {
    if (typeof localStorage === 'undefined') return;
    const needle = `${PREFIX}:user:${userId}:`;
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(needle)) doomed.push(k);
    }
    doomed.forEach((k) => localStorage.removeItem(k));
  },
};
