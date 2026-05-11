import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const adminRoutePath = path.resolve(dirname, '../routes/admin.ts');

test('admin detail queries do not expose internal attachment paths through SELECT *', async () => {
  const source = await readFile(adminRoutePath, 'utf8');

  assert.doesNotMatch(source, /SELECT\s+\*\s+FROM\s+contact_submissions/i);
  assert.doesNotMatch(source, /SELECT\s+\*\s+FROM\s+complaints/i);
  assert.match(source, /const complaintColumns =/);
  assert.doesNotMatch(source.match(/const complaintColumns = `([\s\S]*?)`;/)?.[1] ?? '', /attachment_path/);
});

test('quote queries use the enterprise schema column names', async () => {
  const source = await readFile(adminRoutePath, 'utf8');

  assert.match(source, /base_price AS unit_price/);
  assert.match(source, /pricing_catalog_id/);
  assert.doesNotMatch(source, /q\.status_id/);
  assert.doesNotMatch(source, /INSERT INTO quote_items \(quote_id, catalog_item_id/);
  assert.doesNotMatch(source, /INSERT INTO quotes \(quote_code, customer_id, total_amount, status_id, notes/);
});
