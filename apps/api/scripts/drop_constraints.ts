import { pool } from '../src/db/pool.js';

async function dropConstraints() {
  try {
    console.log('Dropping ck_project_status_history_new_status...');
    await pool.query('ALTER TABLE project_status_history DROP CONSTRAINT IF EXISTS ck_project_status_history_new_status;');
    
    console.log('Dropping ck_project_status_history_old_status...');
    await pool.query('ALTER TABLE project_status_history DROP CONSTRAINT IF EXISTS ck_project_status_history_old_status;');
    
    console.log('Constraints dropped successfully.');
  } catch (error) {
    console.error('Error dropping constraints:', error);
  } finally {
    await pool.end();
  }
}

dropConstraints();
