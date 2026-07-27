-- Migración 002: Paquete de Pulido de Cotizaciones y Catálogo (Quoter Polish)
-- 1. Eliminar columna huérfana legal_penalty_policy
ALTER TABLE public.quotes DROP COLUMN IF EXISTS legal_penalty_policy;

-- 2. Añadir columna de canal de adquisición (Tracking CRM) para analítica de ventas
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS acquisition_channel VARCHAR(50) DEFAULT 'web_form';

-- 3. Crear índice para reportería rápida por canal de adquisición
CREATE INDEX IF NOT EXISTS idx_quotes_acquisition_channel ON public.quotes(acquisition_channel);
