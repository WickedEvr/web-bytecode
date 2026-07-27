-- FASE 1: MIGRACIÓN DE BASE DE DATOS (DDL) para soporte B2B/Tenant y cálculo de subtotal en CPQ

-- 1. Añadir el soporte B2B/Tenant en la tabla quotes
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- 2. Modificar la fórmula generada del subtotal para incluir descuentos, eliminando y recreando la columna
ALTER TABLE public.quote_items DROP COLUMN IF EXISTS subtotal;
ALTER TABLE public.quote_items ADD COLUMN subtotal numeric(14,2) GENERATED ALWAYS AS ((quantity * unit_price) - discount_amount) STORED;
