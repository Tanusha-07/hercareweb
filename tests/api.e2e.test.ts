import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';

process.env.NODE_ENV = 'development';
process.env.OTP_DEV_MOCK = 'true';
process.env.OTP_RESEND_SECONDS = '0';

const { createApp } = await import('../server/src/index');

async function withServer(run: (base: string) => Promise<void>) {
  const app = createApp();
  const server: Server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    server.close();
  }
}

test('GET /api/health reports status', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.devMockOtp, true);
  });
});

test('OTP request + verify works end to end over HTTP', async () => {
  await withServer(async (base) => {
    const req = await fetch(`${base}/api/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876512345' }),
    });
    assert.equal(req.status, 200);
    const { requestId, devMockCode } = await req.json();
    assert.match(devMockCode, /^\d{6}$/);

    const ver = await fetch(`${base}/api/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876512345', requestId, code: devMockCode }),
    });
    assert.equal(ver.status, 200);
    const vbody = await ver.json();
    assert.equal(vbody.verified, true);
    assert.ok(vbody.token);
  });
});

test('invalid phone returns a client-parsable error code', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '123' }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error, 'invalid_phone');
  });
});

test('assistant returns demo=true when no AI provider is configured', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'how to prevent anaemia', lang: 'en' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.demo, true);
  });
});
