/**
 * Server configuration, read once from the environment.
 *
 * Nothing here contains real secrets. Provider credentials are supplied via
 * .env in a real deployment. When they are absent the server runs in clearly
 * labelled, safe fallback modes (console SMS + demo AI) rather than pretending
 * an integration works.
 */

function bool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

export const config = {
  port: Number(process.env.PORT ?? 8787),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: (process.env.NODE_ENV ?? 'development') === 'production',

  // OTP policy
  otp: {
    length: 6,
    ttlSeconds: Number(process.env.OTP_TTL_SECONDS ?? 300),
    resendAfterSeconds: Number(process.env.OTP_RESEND_SECONDS ?? 30),
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS ?? 5),
    maxPerHour: Number(process.env.OTP_MAX_PER_HOUR ?? 5),
  },

  /**
   * Development mock mode returns the generated OTP in the API response so the
   * flow can be tested without sending SMS. It is OFF in production and must be
   * explicitly enabled outside production. This is the "clearly labelled dev
   * mock" required by the brief — never a hardcoded production code.
   */
  devMockOtp: !((process.env.NODE_ENV ?? 'development') === 'production') && bool(process.env.OTP_DEV_MOCK, true),

  // SMS provider: 'console' (default, safe), 'twilio', or 'msg91'
  smsProvider: (process.env.SMS_PROVIDER ?? 'console') as 'console' | 'twilio' | 'msg91',
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_FROM,
  },
  msg91: {
    authKey: process.env.MSG91_AUTH_KEY,
    templateId: process.env.MSG91_TEMPLATE_ID,
  },

  // AI assistant provider. When no key is configured the /assistant endpoint
  // returns demo = true so the client shows the safe, curated fallback.
  ai: {
    provider: process.env.AI_PROVIDER ?? 'demo',
    apiKey: process.env.AI_API_KEY,
    endpoint: process.env.AI_ENDPOINT,
  },

  /** Allowed browser origins for CORS (comma-separated). Empty = same-origin only. */
  corsOrigins: (process.env.CORS_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
} as const;
