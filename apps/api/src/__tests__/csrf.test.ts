import http from 'node:http';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import cookieParser from 'cookie-parser';
import express from 'express';
import { requireCsrf } from '../middleware/csrf.js';

const app = express();
app.use(cookieParser());
app.post('/api/admin', requireCsrf, (_req, res) => {
  res.json({ ok: true });
});
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error
    ? Number(error.statusCode)
    : 500;
  const message = error instanceof Error ? error.message : 'Error';
  res.status(statusCode).json({ message });
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

test('rejects admin mutation requests without x-csrf-token', async () => {
  const response = await fetch(`${baseUrl}/api/admin`, {
    method: 'POST',
    headers: {
      Cookie: 'bc_csrf=test-token',
    },
  });

  const body = await response.json() as { message: string };
  assert.equal(response.status, 403);
  assert.equal(body.message, 'CSRF token inválido');
});

test('allows admin mutation requests with matching CSRF cookie and header', async () => {
  const response = await fetch(`${baseUrl}/api/admin`, {
    method: 'POST',
    headers: {
      Cookie: 'bc_csrf=test-token',
      'x-csrf-token': 'test-token',
    },
  });

  assert.equal(response.status, 200);
});
