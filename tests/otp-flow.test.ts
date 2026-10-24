import { test } from 'node:test';
import assert from 'node:assert/strict';

// node --test runs each test FILE in its own process, so config (which snapshots
// env at import time) is fresh here. Dev mock mode is the default outside
// production, so these flow tests can read the generated code.
process.env.NODE_ENV = 'development';
process.env.OTP_DEV_MOCK = 'true';
process.env.OTP_RESEND_SECONDS = '0';

const m = await import('../server/src/otpStore');

test('normalizePhone accepts common Indian formats', () => {
  assert.equal(m.normalizePhone('9876543210'), '+919876543210');
  assert.equal(m.normalizePhone('09876543210'), '+919876543210');
  assert.equal(m.normalizePhone('+91 98765 43210'), '+919876543210');
  assert.equal(m.normalizePhone('12345'), null);
  assert.equal(m.normalizePhone('5876543210'), null); // must start 6-9
});

test('request rejects an invalid phone number', async () => {
  await assert.rejects(() => m.requestOtp('not-a-phone'), (e: any) => e.code === 'invalid_phone');
});

test('dev mock returns a 6-digit code', async () => {
  const res = await m.requestOtp('+919876500001');
  assert.match(res.devMockCode ?? '', /^\d{6}$/);
});

test('full happy path: request then verify returns a token', async () => {
  const { requestId, devMockCode } = await m.requestOtp('+919876500003');
  const verified = m.verifyOtp('+919876500003', requestId, devMockCode!);
  assert.equal(verified.verified, true);
  assert.ok(typeof verified.token === 'string' && verified.token.length > 10);
});

test('wrong code is rejected and the request can be retried', async () => {
  const { requestId, devMockCode } = await m.requestOtp('+919876500004');
  const wrong = devMockCode === '000000' ? '000001' : '000000';
  assert.throws(() => m.verifyOtp('+919876500004', requestId, wrong), (e: any) => e.code === 'invalid_otp');
  assert.equal(m.verifyOtp('+919876500004', requestId, devMockCode!).verified, true);
});

test('a code cannot be reused after success', async () => {
  const { requestId, devMockCode } = await m.requestOtp('+919876500005');
  m.verifyOtp('+919876500005', requestId, devMockCode!);
  assert.throws(() => m.verifyOtp('+919876500005', requestId, devMockCode!), (e: any) => e.code === 'invalid_otp');
});
