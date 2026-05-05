import http from 'node:http';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

process.env.NODE_ENV = 'test';
process.env.CORS_ORIGINS = 'https://web.bytecode.test';

const { app } = await import('../app.js');

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

test('rejects unlisted origins with a CORS error', async () => {
  const response = await fetch(`${baseUrl}/health`, {
    headers: {
      Origin: 'http://evil.example.com',
    },
  });

  assert.equal(response.status, 500);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('does not allow credentialed CORS for requests without an origin header', async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
  assert.equal(response.headers.get('access-control-allow-credentials'), null);
});

test('allows whitelisted origins with credentials', async () => {
  const response = await fetch(`${baseUrl}/health`, {
    headers: {
      Origin: 'https://web.bytecode.test',
    },
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://web.bytecode.test');
  assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
});
