import { test } from 'node:test';
import assert from 'node:assert/strict';

// Each file runs in its own process; force a production snapshot of config.
process.env.NODE_ENV = 'production';
process.env.OTP_DEV_MOCK = 'true'; // even if someone tries to force it on

const { config } = await import('../server/src/config');

test('production ignores OTP_DEV_MOCK — plaintext codes are never exposed', () => {
  assert.equal(config.isProduction, true);
  assert.equal(config.devMockOtp, false, 'dev mock MUST be off in production');
});

test('server SMS falls back to a safe console provider when unconfigured', async () => {
  const { getSmsProvider } = await import('../server/src/sms');
  const provider = getSmsProvider();
  const result = await provider.send('+919876500009', 'secret code 123456');
  assert.equal(result.simulated, true); // nothing was really delivered
  assert.equal(result.ok, true);
});

test('the AI assistant reports demo mode when no provider is configured', async () => {
  const { answerAssistant } = await import('../server/src/assistant');
  const answer = await answerAssistant({ message: 'I feel tired', lang: 'en' });
  assert.equal(answer.demo, true, 'must not pretend a live model is connected');
});
