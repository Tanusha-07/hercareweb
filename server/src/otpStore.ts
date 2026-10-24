import { createHash, randomInt, randomBytes, createHmac, timingSafeEqual } from 'node:crypto';
import { config } from './config';
import { getSmsProvider } from './sms';

/**
 * Server-authoritative OTP service.
 *
 * Security posture:
 *  - Codes are generated with a CSPRNG and stored only as a salted hash.
 *  - The plaintext code is NEVER returned except in clearly-labelled dev mock
 *    mode, and never in production.
 *  - Expiry, attempt limits and per-number resend timing are all owned here, so
 *    the browser cannot bypass them.
 *  - Verification uses a constant-time comparison.
 *
 * This in-memory store is a working reference for the hack. In production the
 * same logic maps directly onto the Supabase `otp_requests` table (see
 * server/supabase/schema.sql) with row-level security.
 */

export class OtpFailure extends Error {
  code: 'invalid_phone' | 'invalid_otp' | 'expired' | 'rate_limited' | 'server';
  status: number;
  constructor(code: OtpFailure['code'], status: number) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

interface OtpRecord {
  id: string;
  phone: string;
  codeHash: string;
  salt: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
  used: boolean;
}

const records = new Map<string, OtpRecord>();
const recentByPhone = new Map<string, number[]>();

/** Normalise + validate an Indian mobile number. Returns +91XXXXXXXXXX or null. */
export function normalizePhone(input: string): string | null {
  let digits = (input ?? '').replace(/\D/g, '');
  if (digits.startsWith('0091')) digits = digits.slice(4);
  else if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  else if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);
  if (digits.length !== 10 || !/^[6-9]/.test(digits)) return null;
  return `+91${digits}`;
}

function hash(code: string, salt: string): string {
  return createHash('sha256').update(`${salt}.${code}`).digest('hex');
}

function generateCode(): string {
  // 6-digit, zero-padded, CSPRNG.
  return String(randomInt(0, 10 ** config.otp.length)).padStart(config.otp.length, '0');
}

function pruneExpired(): void {
  const now = Date.now();
  for (const [id, r] of records) if (r.expiresAt < now) records.delete(id);
}

function checkPhoneRateLimit(phone: string): void {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const list = (recentByPhone.get(phone) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= config.otp.maxPerHour) throw new OtpFailure('rate_limited', 429);
  list.push(now);
  recentByPhone.set(phone, list);
}

export interface RequestResult {
  requestId: string;
  resendAfterSeconds: number;
  devMockCode?: string;
}

export async function requestOtp(rawPhone: string): Promise<RequestResult> {
  const phone = normalizePhone(rawPhone);
  if (!phone) throw new OtpFailure('invalid_phone', 400);

  pruneExpired();

  // Resend timing: if a fresh, unused record exists within the cooldown, hold.
  const existing = [...records.values()].find((r) => r.phone === phone && !r.used && r.expiresAt > Date.now());
  if (existing) {
    const elapsed = (Date.now() - existing.createdAt) / 1000;
    if (elapsed < config.otp.resendAfterSeconds) {
      // Reuse the pending request rather than minting a new code every tap.
      return buildResult(existing, config.otp.resendAfterSeconds - Math.ceil(elapsed));
    }
  }

  checkPhoneRateLimit(phone);

  const salt = randomBytes(12).toString('hex');
  const code = generateCode();
  const record: OtpRecord = {
    id: randomBytes(12).toString('hex'),
    phone,
    codeHash: hash(code, salt),
    salt,
    expiresAt: Date.now() + config.otp.ttlSeconds * 1000,
    attempts: 0,
    createdAt: Date.now(),
    used: false,
  };
  records.set(record.id, record);

  const body = `Your HerCare+ verification code is ${code}. It expires in ${Math.round(
    config.otp.ttlSeconds / 60,
  )} minutes. Do not share it.`;
  await getSmsProvider().send(phone, body);

  return buildResult(record, config.otp.resendAfterSeconds, code);
}

function buildResult(record: OtpRecord, resendAfterSeconds: number, code?: string): RequestResult {
  const result: RequestResult = {
    requestId: record.id,
    resendAfterSeconds,
  };
  // Only ever expose the code in dev mock mode, and only if caller passed it.
  if (config.devMockOtp && code) result.devMockCode = code;
  else if (config.devMockOtp) result.devMockCode = undefined;
  return result;
}

export interface VerifyResult {
  verified: true;
  token: string;
}

export function verifyOtp(rawPhone: string, requestId: string, code: string): VerifyResult {
  const phone = normalizePhone(rawPhone);
  if (!phone) throw new OtpFailure('invalid_phone', 400);

  pruneExpired();
  const record = records.get(requestId);
  if (!record || record.phone !== phone) throw new OtpFailure('invalid_otp', 400);

  if (record.used) throw new OtpFailure('invalid_otp', 400);
  if (record.expiresAt < Date.now()) throw new OtpFailure('expired', 400);
  if (record.attempts >= config.otp.maxAttempts) throw new OtpFailure('rate_limited', 429);

  record.attempts += 1;
  const candidate = createHash('sha256').update(`${record.salt}.${code}`).digest();
  const stored = Buffer.from(record.codeHash, 'hex');
  const ok = candidate.length === stored.length && timingSafeEqual(candidate, stored);
  if (!ok) throw new OtpFailure('invalid_otp', 400);

  record.used = true;
  records.delete(record.id);

  // Opaque session token. A real deployment issues a signed JWT / Supabase session.
  const token = createHmac('sha256', randomBytes(32).toString('hex'))
    .update(`${phone}.${Date.now()}`)
    .digest('hex');

  return { verified: true, token };
}

/** Exposed for tests: reset in-memory state between cases. */
export function __reset(): void {
  records.clear();
  recentByPhone.clear();
}
