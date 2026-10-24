/**
 * POST /api/otp/verify — checks the entered code against the hash carried in
 * the signed requestId (stateless, so it works across serverless instances)
 * and returns an opaque session token on success.
 */

import { fail, json, requirePostJson, type ReqLike, type ResLike } from '../_lib/http.js';
import { sessionToken, verifyCode } from '../_lib/otpToken.js';

export default function handler(req: ReqLike, res: ResLike): void {
  try {
    const body = requirePostJson(req, res);
    if (!body) return;

    const phone = verifyCode(String(body.requestId ?? ''), String(body.phone ?? ''), String(body.code ?? ''));
    json(res, 200, { verified: true, token: sessionToken(phone) });
  } catch (err) {
    fail(res, err);
  }
}
