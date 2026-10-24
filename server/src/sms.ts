import { config } from './config';

/**
 * SMS provider abstraction.
 *
 * The app must never hardcode a carrier or claim a provider works when it is
 * not configured. `getSmsProvider()` returns a real provider only when the
 * matching credentials exist; otherwise it returns the safe ConsoleProvider,
 * which logs to the server console and is clearly marked as non-delivering.
 */

export interface SmsResult {
  ok: boolean;
  provider: string;
  /** True when the message was NOT actually delivered (dev/log mode). */
  simulated: boolean;
  id?: string;
}

export interface SmsProvider {
  readonly name: string;
  send(to: string, body: string): Promise<SmsResult>;
}

/** Never sends anything: used in development and when a provider is missing. */
const consoleProvider: SmsProvider = {
  name: 'console',
  async send(to, body) {
    // Do not log the OTP itself in production; in dev this is the intended
    // reviewable output. We only log a redacted preview here.
    console.log(`[sms:console] (simulated) to=${redact(to)} body=${redact(body)}`);
    return { ok: true, provider: this.name, simulated: true };
  },
};

/**
 * Twilio example. Activated only when SID + token + from are all present.
 * Uses Twilio's REST API directly so no extra dependency is required.
 */
const twilioProvider: SmsProvider = {
  name: 'twilio',
  async send(to, body) {
    const { accountSid, authToken, from } = config.twilio;
    if (!accountSid || !authToken || !from) return consoleProvider.send(to, body);
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const res = await fetch(`https://api.twilio.com/2010-04-07/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    });
    const data = (await res.json().catch(() => ({}))) as { sid?: string };
    return { ok: res.ok, provider: this.name, simulated: false, id: data.sid };
  },
};

/** MSG91 OTP example. Activated only when an auth key is present. */
const msg91Provider: SmsProvider = {
  name: 'msg91',
  async send(to, body) {
    const { authKey } = config.msg91;
    if (!authKey) return consoleProvider.send(to, body);
    const res = await fetch('https://api.msg91.com/api/v5/flow/?', {
      method: 'POST',
      headers: { authkey: authKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: to.replace('+91', ''), message: body }),
    });
    return { ok: res.ok, provider: this.name, simulated: false };
  },
};

export function getSmsProvider(): SmsProvider {
  switch (config.smsProvider) {
    case 'twilio':
      return twilioProvider;
    case 'msg91':
      return msg91Provider;
    default:
      return consoleProvider;
  }
}

function redact(value: string): string {
  if (value.length <= 4) return '••••';
  return `${value.slice(0, 2)}${'•'.repeat(Math.max(0, value.length - 4))}${value.slice(-2)}`;
}
