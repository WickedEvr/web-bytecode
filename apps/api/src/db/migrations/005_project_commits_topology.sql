-- Agregamos las columnas JSONB para soportar el linaje y referencias del grafo
ALTER TABLE project_commits 
ADD COLUMN IF NOT EXISTS parents JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS refs JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Opcional: Índices GIN para optimizar la búsqueda dentro de los arrays JSON en el futuro
CREATE INDEX IF NOT EXISTS idx_project_commits_parents ON project_commits USING GIN (parents);
CREATE INDEX IF NOT EXISTS idx_project_commits_refs ON project_commits USING GIN (refs);
