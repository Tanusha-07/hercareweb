/**
 * OTP client. Talks to the backend at /api — never generates or trusts an OTP
 * in the browser. The server owns expiry, rate limiting and (in a clearly
 * labelled development mode) the mock code.
 */

export type OtpRequestResult = {
  requestId: string;
  resendAfterSeconds: number;
  /** Only present when the server runs in explicitly-enabled dev mock mode. */
  devMockCode?: string;
};

export type OtpVerifyResult = {
  verified: true;
  /** Opaque session token from the server. Stored, never logged. */
  token: string;
};

export type OtpErrorCode =
  | 'invalid_phone'
  | 'duplicate'
  | 'invalid_otp'
  | 'expired'
  | 'rate_limited'
  | 'network'
  | 'server';

export class OtpError extends Error {
  code: OtpErrorCode;
  constructor(code: OtpErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'OtpError';
  }
}

const BASE = '/api';

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'same-origin',
    });
  } catch {
    throw new OtpError('network');
  }

  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    /* keep empty */
  }

  if (!res.ok) {
    const code = (data.error as OtpErrorCode) ?? (res.status === 429 ? 'rate_limited' : 'server');
    throw new OtpError(code, data.message as string | undefined);
  }
  return data as T;
}

export function requestOtp(phone: string): Promise<OtpRequestResult> {
  return post<OtpRequestResult>('/otp/request', { phone });
}

export function verifyOtp(phone: string, requestId: string, code: string): Promise<OtpVerifyResult> {
  return post<OtpVerifyResult>('/otp/verify', { phone, requestId, code });
}
