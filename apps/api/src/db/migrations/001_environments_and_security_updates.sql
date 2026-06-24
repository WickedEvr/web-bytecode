-- Catch-up migration for the Environments Hub and Vercel integration.

-- 1. Add error observability for environment health checks.
ALTER TABLE project_environments
  ADD COLUMN IF NOT EXISTS error_details TEXT;

-- 2. Track the Git branch associated with preview environments.
ALTER TABLE project_environments
  ADD COLUMN IF NOT EXISTS branch_name VARCHAR;

-- 3. Store the per-project Vercel protection bypass secret.
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS vercel_bypass_secret VARCHAR;

-- Remove any global UNIQUE(project_id, type, name) constraint. It prevents
-- branch-based preview upserts and must only apply to fixed environments.
DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT constraint_definition.conname
    FROM pg_constraint AS constraint_definition
    WHERE constraint_definition.conrelid = 'project_environments'::regclass
      AND constraint_definition.contype = 'u'
      AND (
        SELECT array_agg(attribute.attname::text ORDER BY key_column.ordinality)
        FROM unnest(constraint_definition.conkey) WITH ORDINALITY AS key_column(attnum, ordinality)
        JOIN pg_attribute AS attribute
          ON attribute.attrelid = constraint_definition.conrelid
         AND attribute.attnum = key_column.attnum
      ) = ARRAY['project_id', 'type', 'name']
  LOOP
    EXECUTE format('ALTER TABLE project_environments DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

-- Remove an equivalent standalone non-partial unique index, if present.
DO $$
DECLARE
  index_name text;
BEGIN
  FOR index_name IN
    SELECT index_relation.relname
    FROM pg_index AS index_definition
    JOIN pg_class AS index_relation ON index_relation.oid = index_definition.indexrelid
    WHERE index_definition.indrelid = 'project_environments'::regclass
      AND index_definition.indisunique
      AND index_definition.indpred IS NULL
      AND NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conindid = index_definition.indexrelid
      )
      AND (
        SELECT array_agg(attribute.attname::text ORDER BY key_column.ordinality)
        FROM unnest(index_definition.indkey) WITH ORDINALITY AS key_column(attnum, ordinality)
        JOIN pg_attribute AS attribute
          ON attribute.attrelid = index_definition.indrelid
         AND attribute.attnum = key_column.attnum
      ) = ARRAY['project_id', 'type', 'name']
  LOOP
    EXECUTE format('DROP INDEX %I', index_name);
  END LOOP;
END $$;

-- Preserve name-based uniqueness for production and staging environments.
CREATE UNIQUE INDEX IF NOT EXISTS unique_fixed_environment_name
  ON project_environments (project_id, type, name)
  WHERE type != 'ephemeral';

-- Keep the newest row for any branch duplicated before this constraint existed.
WITH ranked_ephemeral_environments AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY project_id, type, branch_name
           ORDER BY created_at DESC NULLS LAST, id DESC
         ) AS duplicate_rank
  FROM project_environments
  WHERE type = 'ephemeral'
    AND branch_name IS NOT NULL
)
DELETE FROM project_environments AS environment
USING ranked_ephemeral_environments AS ranked
WHERE environment.id = ranked.id
  AND ranked.duplicate_rank > 1;

-- 4. Resolve preview upserts and PR cleanup by branch identity.
CREATE UNIQUE INDEX IF NOT EXISTS unique_ephemeral_branch
  ON project_environments (project_id, type, branch_name)
  WHERE type = 'ephemeral';
