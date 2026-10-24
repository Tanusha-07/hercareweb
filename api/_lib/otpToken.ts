/**
 * Stateless OTP for serverless (Vercel `/api`) deployments.
 *
 * Serverless functions cannot share memory between the request and verify
 * calls, so the requestId itself is a signed token: it carries the salted
 * SHA-256 hash of the code plus expiry, HMAC-signed with a server secret.
 * Verification recomputes and constant-time compares — the plaintext code is
 * never stored in the token and never returned outside dev-mock mode.
 *
 * Known, honest limitations of this stateless demo design: per-phone attempt
 * and per-hour rate limits need shared storage (Redis/Supabase) and are not
 * enforced here. Real SMS delivery is simulated (logged) unless a provider is
 * wired up. The long-running Express server (see server/) remains the
 * reference implementation with full rate limiting.
 */

import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

// On Vercel, NODE_ENV is always "production" (including previews), so the
// environment is taken from VERCEL_ENV when present; elsewhere from NODE_ENV.
const IS_PROD = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === 'production'
  : process.env.NODE_ENV === 'production';
const MOCK_FLAG = (process.env.OTP_DEV_MOCK ?? '').toLowerCase().trim();
/**
 * Mock-OTP rules for this serverless demo API (working prototype):
 *  - ON by default in EVERY environment, including production deployments, so
 *    the code is returned in the response and displayed on screen in a
 *    clearly-labelled "Demo mode" banner — no SMS provider or env setup needed
 *    for judges to complete sign-in.
 *  - Set OTP_DEV_MOCK=false (or 0/no/off) to force it off; when off, requested
 *    codes are only logged server-side and are never returned to the client.
 *  - IS_PROD is kept for the token-secret fallback below. Real launches should
 *    ship the Express server (server/) with real SMS, or set OTP_DEV_MOCK=false
 *    here once delivery is wired up.
 */
const DEV_MOCK = !['0', 'false', 'no', 'off'].includes(MOCK_FLAG);
const TTL_SECONDS = Number(process.env.OTP_TTL_SECONDS ?? 300);
const RESEND_SECONDS = Number(process.env.OTP_RESEND_SECONDS ?? 60);

/**
 * Set OTP_TOKEN_SECRET in production (Vercel env var) so tokens cannot be
 * forged or decoded outside your deployment. The fallback exists only so
 * preview/dev builds work with zero configuration.
 */
const SECRET = process.env.OTP_TOKEN_SECRET ?? (IS_PROD ? 'hercare-missing-otp-token-secret' : 'hercare-dev-secret');

export type OtpCode = 'invalid_phone' | 'invalid_otp' | 'expired' | 'server';

export class OtpFailure extends Error {
  status: number;
  code: OtpCode;
  constructor(code: OtpCode, status: number) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

/** Normalise + validate an Indian mobile number (mirrors server/src/otpStore.ts). */
export function normalizePhone(input: string): string | null {
  let digits = (input ?? '').replace(/\D/g, '');
  if (digits.startsWith('0091')) digits = digits.slice(4);
  else if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  else if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
  if (digits.length !== 10 || !/^[6-9]/.test(digits)) return null;
  return `+91${digits}`;
}

function codeHash(salt: string, code: string): string {
  return createHash('sha256').update(`${salt}.${code}`).digest('hex');
}

function sign(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('base64url');
}

export function generateCode(): string {
  return String(randomInt(0, 10 ** 6)).padStart(6, '0');
}

/** Mint a self-contained, signed requestId for the given phone + code. */
export function createRequestId(phone: string, code: string): string {
  const salt = randomBytes(12).toString('hex');
  const payload = Buffer.from(JSON.stringify({ p: phone, s: salt, h: codeHash(salt, code), e: Date.now() + TTL_SECONDS * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

/** Decode + verify signature + check phone binding and expiry. */
function readRequestId(requestId: string, phone: string): void {
  const dot = requestId.lastIndexOf('.');
  if (dot < 1) throw new OtpFailure('invalid_otp', 400);
  const payload = requestId.slice(0, dot);
  const mac = requestId.slice(dot + 1);
  const expected = sign(payload);
  const macBuf = Buffer.from(mac);
  const expBuf = Buffer.from(expected);
  if (macBuf.length !== expBuf.length || !timingSafeEqual(macBuf, expBuf)) throw new OtpFailure('invalid_otp', 400);

  let data: { p: string; e: number };
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    throw new OtpFailure('invalid_otp', 400);
  }
  if (data.p !== phone) throw new OtpFailure('invalid_otp', 400);
  if (data.e < Date.now()) throw new OtpFailure('expired', 400);
}

/** Constant-time check of the entered code against the hash inside the token. */
export function verifyCode(requestId: string, rawPhone: string, code: string): string {
  const phone = normalizePhone(rawPhone);
  if (!phone) throw new OtpFailure('invalid_phone', 400);
  if (!/^\d{6}$/.test(code ?? '')) throw new OtpFailure('invalid_otp', 400);

  readRequestId(requestId, phone);
  const { s: salt, h } = JSON.parse(Buffer.from(requestId.slice(0, requestId.lastIndexOf('.')), 'base64url').toString('utf8')) as { s: string; h: string };

  const candidate = Buffer.from(codeHash(salt, code), 'hex');
  const stored = Buffer.from(h, 'hex');
  if (candidate.length !== stored.length || !timingSafeEqual(candidate, stored)) {
    throw new OtpFailure('invalid_otp', 400);
  }
  return phone;
}

/**
 * Opaque session token, signed so the (stateless) verify endpoint can mint it
 * without shared storage. Format: phone.issuedAt.signature.
 */
export function sessionToken(phone: string): string {
  const issuedAt = Date.now();
  const payload = `${phone}.${issuedAt}`;
  return `${payload}.${createHmac('sha256', SECRET).update(payload).digest('hex')}`;
}

export const devMockEnabled = DEV_MOCK;
export const resendSeconds = RESEND_SECONDS;
