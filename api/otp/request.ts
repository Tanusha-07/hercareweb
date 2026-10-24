/**
 * POST /api/otp/request — serverless counterpart of the Express endpoint.
 * Generates a code, mints a self-contained signed requestId, and (in dev-mock
 * mode only) returns the code so demos can complete sign-in without SMS.
 * Without a real SMS provider the code is otherwise undeliverable — this is
 * the clearly-labelled simulated-delivery path, same policy as server/.
 */

import { fail, json, requirePostJson, type ReqLike, type ResLike } from '../_lib/http';
import { createRequestId, devMockEnabled, generateCode, normalizePhone, OtpFailure, resendSeconds } from '../_lib/otpToken';

export default function handler(req: ReqLike, res: ResLike): void {
  try {
    const body = requirePostJson(req, res);
    if (!body) return;

    const phone = normalizePhone(String(body.phone ?? ''));
    if (!phone) throw new OtpFailure('invalid_phone', 400);

    const code = generateCode();
    const requestId = createRequestId(phone, code);

    if (devMockEnabled) {
      console.log(`[otp] (simulated SMS, dev-mock) code for ${phone}: ${code}`);
      json(res, 200, { requestId, resendAfterSeconds: resendSeconds, devMockCode: code });
      return;
    }

    console.log(`[otp] (simulated SMS) code generated for ${phone} but not delivered — configure a provider or dev-mock`);
    json(res, 200, { requestId, resendAfterSeconds: resendSeconds });
  } catch (err) {
    fail(res, err);
  }
}
