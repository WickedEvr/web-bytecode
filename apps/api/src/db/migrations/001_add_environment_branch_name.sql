ALTER TABLE project_environments
  ADD COLUMN IF NOT EXISTS branch_name VARCHAR;
