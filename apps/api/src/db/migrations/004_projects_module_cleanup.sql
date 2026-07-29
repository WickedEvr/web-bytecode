-- 1. Eliminar tabla huérfana de Pull Requests
DROP TABLE IF EXISTS public.project_pull_requests CASCADE;

-- 2. Limpiar columnas obsoletas y redundantes de la tabla projects
ALTER TABLE public.projects 
  DROP COLUMN IF EXISTS vercel_bypass_secret,
  DROP COLUMN IF EXISTS github_branch,
  DROP COLUMN IF EXISTS production_url,
  DROP COLUMN IF EXISTS staging_url;

-- 3. Limpiar columna reason de la tabla project_status_history (estandarización)
ALTER TABLE public.project_status_history 
  DROP COLUMN IF EXISTS reason;
