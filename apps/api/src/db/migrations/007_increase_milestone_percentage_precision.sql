-- Migración para aumentar la precisión decimal de los porcentajes de los hitos
-- Esto previene la pérdida de centavos en la auto-reconciliación de pagos divididos en el backend.
ALTER TABLE project_milestones ALTER COLUMN payment_percentage TYPE numeric(20,10);
