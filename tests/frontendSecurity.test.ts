import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('admin route is protected while admin login remains public', async () => {
  const appSource = await readFile('src/App.tsx', 'utf8');
  const protectedRouteSource = await readFile('src/components/auth/ProtectedRoute.tsx', 'utf8');

  assert.match(appSource, /path="\/admin\/login"\s+element=\{<AdminLogin \/>\}/);
  assert.match(appSource, /path="\/admin"[\s\S]*<ProtectedRoute>[\s\S]*<AdminLayout \/>[\s\S]*<\/ProtectedRoute>/);
  assert.match(protectedRouteSource, /apiRequest(?:<[^>]+>)?\('\/auth\/me'\)/);
  assert.match(protectedRouteSource, /\/admin\/login\?redirect=/);
});

test('Caddy applies baseline security headers to public domains', async () => {
  const caddyfile = await readFile('Caddyfile', 'utf8');

  assert.match(caddyfile, /\(security_headers\)\s*\{[\s\S]*X-Content-Type-Options\s+"nosniff"/);
  assert.match(caddyfile, /\(security_headers\)\s*\{[\s\S]*X-Frame-Options\s+"DENY"/);
  assert.match(caddyfile, /\(security_headers\)\s*\{[\s\S]*Referrer-Policy\s+"strict-origin-when-cross-origin"/);
  assert.match(caddyfile, /\(security_headers\)\s*\{[\s\S]*Strict-Transport-Security\s+"max-age=31536000; includeSubDomains; preload"/);
  assert.match(caddyfile, /bytecode\.com\.pe, www\.bytecode\.com\.pe\s*\{\s*import security_headers/);
  assert.match(caddyfile, /api\.bytecode\.com\.pe\s*\{\s*import security_headers/);
});
