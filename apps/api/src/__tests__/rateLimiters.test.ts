import http from 'node:http';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import express from 'express';
import type { Request } from 'express';
import { loginLimiter, loginRateLimitKey } from '../middleware/rateLimiters.js';

const app = express();
app.use(express.json());
app.post('/api/auth/login', loginLimiter, (_req, res) => {
  res.status(401).json({ message: 'Credenciales inválidas.' });
});

const server = http.createServer(app);
let baseUrl = '';

before(async () => {
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  assert.ok(address && typeof address === 'object');
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('login limiter returns 429 after five attempts for the same IP and email', async () => {
  const email = `admin-${crypto.randomUUID()}@bytecode.test`;

  for (let index = 0; index < 5; index += 1) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'wrong-password' }),
    });
    assert.equal(response.status, 401);
  }

  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'wrong-password' }),
  });

  const body = await response.json() as { message: string };
  assert.equal(response.status, 429);
  assert.equal(body.message, 'Demasiados intentos. Espera 15 minutos.');
});

test('login limiter key uses req.ip and email, not a raw spoofed x-forwarded-for value', () => {
  const request = {
    ip: '203.0.113.10',
    body: { email: 'Admin@Bytecode.test' },
    headers: { 'x-forwarded-for': '198.51.100.1' },
  } as unknown as Request;

  assert.equal(loginRateLimitKey(request), '203.0.113.10:admin@bytecode.test');
});
