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
