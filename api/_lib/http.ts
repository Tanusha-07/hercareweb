/**
 * Tiny shared plumbing for the Vercel `/api` functions: JSON body access,
 * method guard, and the same `{ error: code }` response shape the Express
 * reference server uses, so the client's OtpError mapping keeps working.
 */

import { OtpFailure } from './otpToken';

/** Minimal shapes of the Vercel (Node.js-style) req/res we actually use. */
export interface ReqLike {
  method?: string;
  body?: unknown;
}
export interface ResLike {
  statusCode: number;
  setHeader(name: string, value: string): void;
  end(body?: string): void;
}

export type Body = Record<string, unknown>;

export function json(res: ResLike, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

/** POST-only guard returning a normalised body, mirroring server/src/index.ts. */
export function requirePostJson(req: ReqLike, res: ResLike): Body | null {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'server' });
    return null;
  }
  // Vercel pre-parses JSON bodies; tolerate undefined when the parser is off.
  const body = req.body;
  if (body && typeof body === 'object') return body as Body;
  return {};
}

/** Map failures to the client-parsable shape; never leak internals. */
export function fail(res: ResLike, err: unknown): void {
  if (err instanceof OtpFailure) {
    json(res, err.status, { error: err.code });
    return;
  }
  console.error('[api] unexpected error:', err);
  json(res, 500, { error: 'server' });
}
