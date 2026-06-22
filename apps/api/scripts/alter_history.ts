import { pool } from '../src/db/pool.js';

async function alterTable() {
  try {
    console.log('Altering project_status_history table...');
    await pool.query(`
      ALTER TABLE project_status_history 
      DROP COLUMN IF EXISTS old_status, 
      DROP COLUMN IF EXISTS new_status,
      ADD COLUMN IF NOT EXISTS old_status_id UUID REFERENCES status_catalog(id),
      ADD COLUMN IF NOT EXISTS new_status_id UUID REFERENCES status_catalog(id);
    `);
    
    // We cannot add NOT NULL immediately if the table has data without new_status_id, but assuming it's fine for dev/production if it's empty or we can clean it up.
    // Let's add NOT NULL constraint to new_status_id if possible, or just skip the constraint.
    // First, let's clean up any records that don't have new_status_id since we just added it.
    await pool.query(`DELETE FROM project_status_history WHERE new_status_id IS NULL;`);
    await pool.query(`ALTER TABLE project_status_history ALTER COLUMN new_status_id SET NOT NULL;`);
    
    console.log('Table altered successfully.');
  } catch (error) {
    console.error('Error altering table:', error);
  } finally {
    await pool.end();
  }
}

alterTable();
