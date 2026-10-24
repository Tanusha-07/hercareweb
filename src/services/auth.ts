import type { Language, User } from '@/types';
import { KEYS, storage } from '@/utils/storage';
import { uid } from '@/utils/id';
import { normalizePhone } from '@/utils/phone';
import { requestOtp, verifyOtp, OtpError } from './otp';

/**
 * Local auth service.
 *
 * Real phone-OTP verification happens on the server (see services/otp.ts). On
 * success we create a device-local user record and keep a session token. This
 * is the seam where a Supabase/PostgreSQL user upsert + JWT session would plug
 * in for production; the interface (register → verify → session) is unchanged.
 */

type Session = { token: string; userId: string };

function loadUserIndex(): Record<string, string> {
  // phone -> userId, so we can detect a duplicate verified number on-device.
  return storage.get<Record<string, string>>(`${KEYS.session}:index`, {});
}

function saveUserIndex(index: Record<string, string>) {
  storage.set(`${KEYS.session}:index`, index);
}

function readUser(userId: string): User | null {
  return storage.get<User | null>(`${KEYS.session}:user:${userId}`, null);
}

function writeUser(user: User) {
  storage.set(`${KEYS.session}:user:${user.id}`, user);
}

export function getSessionUser(): User | null {
  const session = storage.get<Session | null>(KEYS.session, null);
  if (!session) return null;
  return readUser(session.userId);
}

export function getToken(): string | null {
  return storage.get<Session | null>(KEYS.session, null)?.token ?? null;
}

/** Step 1: ask the server to send an OTP. Returns resend timing + dev mock code. */
export async function startRegistration(rawPhone: string) {
  const phone = normalizePhone(rawPhone);
  if (!phone) throw new OtpError('invalid_phone');
  return requestOtp(phone);
}

/** Step 2: verify the OTP with the server, then create the account locally. */
export async function completeRegistration(
  rawPhone: string,
  name: string,
  requestId: string,
  code: string,
): Promise<{ user: User; alreadyExisted: boolean }> {
  const phone = normalizePhone(rawPhone);
  if (!phone) throw new OtpError('invalid_phone');

  const { token } = await verifyOtp(phone, requestId, code);

  const index = loadUserIndex();
  const existingId = index[phone];
  const alreadyExisted = Boolean(existingId && readUser(existingId));

  let user: User;
  if (alreadyExisted && existingId) {
    const existing = readUser(existingId)!;
    user = { ...existing, name: name.trim() || existing.name, phoneVerified: true };
  } else {
    user = {
      id: uid('u_'),
      name: name.trim(),
      phone,
      language: 'en',
      createdAt: new Date().toISOString(),
      phoneVerified: true,
    };
  }

  writeUser(user);
  index[phone] = user.id;
  saveUserIndex(index);
  storage.set(KEYS.session, { token, userId: user.id });

  return { user, alreadyExisted };
}

export function setLanguage(lang: Language) {
  const user = getSessionUser();
  if (!user) return;
  writeUser({ ...user, language: lang });
}

export function logout() {
  storage.remove(KEYS.session);
}

/** Delete account + all per-user records on this device. */
export function deleteAccount() {
  const session = storage.get<Session | null>(KEYS.session, null);
  if (session) {
    storage.clearUser(session.userId);
    storage.remove(`${KEYS.session}:user:${session.userId}`);
    const index = loadUserIndex();
    for (const [phone, id] of Object.entries(index)) {
      if (id === session.userId) delete index[phone];
    }
    saveUserIndex(index);
  }
  storage.remove(KEYS.session);
}
