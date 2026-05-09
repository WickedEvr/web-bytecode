import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('admin route is protected while admin login remains public', async () => {
  const appSource = await readFile('src/App.tsx', 'utf8');
  const protectedRouteSource = await readFile('src/components/auth/ProtectedRoute.tsx', 'utf8');

  assert.match(appSource, /path="\/admin\/login"\s+element=\{<AdminLogin \/>\}/);
  assert.match(appSource, /path="\/admin"[\s\S]*<ProtectedRoute>[\s\S]*<AdminLayout \/>[\s\S]*<\/ProtectedRoute>/);
  assert.match(protectedRouteSource, /apiRequest(?:<[^>]+>)?\('\/api\/auth\/me'\)/);
  assert.match(protectedRouteSource, /\/admin\/login\?redirect=/);
});

test('vercel security headers include the required baseline controls', async () => {
  const vercelConfig = JSON.parse(await readFile('vercel.json', 'utf8')) as {
    headers?: Array<{ headers?: Array<{ key: string; value: string }> }>;
  };
  const headers = new Map(vercelConfig.headers?.[0]?.headers?.map((header) => [header.key, header.value]));

  assert.equal(headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(headers.get('X-Frame-Options'), 'DENY');
  assert.equal(headers.get('Referrer-Policy'), 'strict-origin-when-cross-origin');
  assert.match(headers.get('Strict-Transport-Security') ?? '', /max-age=63072000/);
  assert.match(headers.get('Content-Security-Policy-Report-Only') ?? '', /frame-ancestors 'none'/);
});
