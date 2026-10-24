/**
 * GET /api/health — same shape as the Express reference server, so the client
 * and any judge can confirm which backend answers on the deployed site.
 */

import { json, type ReqLike, type ResLike } from './_lib/http';
import { devMockEnabled } from './_lib/otpToken';

export default function handler(_req: ReqLike, res: ResLike): void {
  json(res, 200, {
    ok: true,
    env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
    sms: 'console',
    ai: 'demo',
    devMockOtp: devMockEnabled,
  });
}
