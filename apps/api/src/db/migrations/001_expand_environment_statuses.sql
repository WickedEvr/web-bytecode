ALTER TABLE project_environments
  DROP CONSTRAINT IF EXISTS ck_project_environments_status;

ALTER TABLE project_environments
  ADD CONSTRAINT ck_project_environments_status
  CHECK (status IN ('active', 'ready', 'inactive', 'failed', 'verifying', 'deployed_ui'));
