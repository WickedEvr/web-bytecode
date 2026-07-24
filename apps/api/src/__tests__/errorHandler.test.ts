import http from 'node:http';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

process.env.NODE_ENV = 'production';
process.env.CORS_ORIGINS = 'https://web.bytecode.test';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/bytecode';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ?? 'test-cloud';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ?? 'test-key';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ?? 'test-secret';

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

test('production Zod errors return normalized fields without schema internals', async () => {
  const response = await fetch(`${baseUrl}/api/contact-submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personType: 'individual',
      nombre: 'A',
      apellido: 'Lovelace',
      email: 'invalid-email',
      celular: '999999999',
      servicio: 'Desarrollo web',
      mensaje: 'Necesito información sobre el servicio.',
      documentType: 'DNI',
      documentNumber: '12345678',
    }),
  });

  const body = (await response.json()) as { error?: string; fields?: string[]; issues?: unknown };

  assert.equal(response.status, 400);
  assert.equal(body.error, 'Datos inválidos');
  assert.ok(Array.isArray(body.fields));
  assert.ok(body.fields.includes('nombre'));
  assert.equal('issues' in body, false);
});
