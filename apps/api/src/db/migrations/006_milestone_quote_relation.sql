-- Añadimos la relación a la cotización (quote) en los hitos
ALTER TABLE project_milestones
ADD COLUMN IF NOT EXISTS quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL;

-- Asignamos la cotización principal del proyecto a los hitos que ya existan
UPDATE project_milestones pm
SET quote_id = p.quote_id
FROM projects p
WHERE pm.project_id = p.id AND pm.quote_id IS NULL;
