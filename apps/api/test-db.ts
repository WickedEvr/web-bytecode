import { pool } from './src/db/pool.js';
async function test() {
  const res = await pool.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'customer_documents';
  `);
  console.log(res.rows);
  process.exit(0);
}
test().catch(console.error);
