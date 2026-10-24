import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { requestOtp, verifyOtp, OtpFailure } from './otpStore';
import { answerAssistant } from './assistant';

/**
 * HerCare+ API.
 *
 * Endpoints (all under /api, proxied by Vite in dev):
 *   POST /api/otp/request  { phone }
 *   POST /api/otp/verify   { phone, requestId, code }
 *   POST /api/assistant    { message, lang }
 *   GET  /api/health
 *
 * The server owns OTP truth. It never trusts a client-supplied code and never
 * returns a production OTP to the browser.
 */

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '16kb' }));
  if (config.corsOrigins.length > 0) {
    app.use(cors({ origin: config.corsOrigins, credentials: true }));
  }

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, env: config.nodeEnv, sms: config.smsProvider, ai: config.ai.provider, devMockOtp: config.devMockOtp });
  });

  app.post('/api/otp/request', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await requestOtp(String(req.body?.phone ?? ''));
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/otp/verify', (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = verifyOtp(String(req.body?.phone ?? ''), String(req.body?.requestId ?? ''), String(req.body?.code ?? ''));
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/assistant', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lang = ['en', 'hi', 'kn'].includes(String(req.body?.lang)) ? (req.body.lang as 'en' | 'hi' | 'kn') : 'en';
      const answer = await answerAssistant({ message: String(req.body?.message ?? '').slice(0, 2000), lang });
      res.json(answer);
    } catch (err) {
      next(err);
    }
  });

  // Central error handler: map OtpFailure to a stable, client-parsable shape.
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof OtpFailure) {
      res.status(err.status).json({ error: err.code });
      return;
    }
    console.error('[api] unexpected error:', err);
    res.status(500).json({ error: 'server' });
  });

  return app;
}

// Start only when run directly (so tests can import createApp without a port).
const isDirectRun = process.argv[1] && /(?:^|[\\/])index\.ts$/.test(process.argv[1]);
if (isDirectRun) {
  createApp().listen(config.port, () => {
    console.log(`HerCare+ API listening on http://localhost:${config.port} (${config.nodeEnv})`);
    if (config.devMockOtp) console.log('OTP dev mock mode is ON — codes are returned in responses. Never enable in production.');
  });
}
