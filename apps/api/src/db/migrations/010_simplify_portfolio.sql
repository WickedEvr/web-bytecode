-- Migración 010: Simplificación del Portafolio

-- 1. Eliminar columnas client_name y description de portfolio_items
ALTER TABLE public.portfolio_items 
DROP COLUMN IF EXISTS client_name,
DROP COLUMN IF EXISTS description;
