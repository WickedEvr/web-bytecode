-- Migración 009: Asegurar integridad de pagos de hitos (Payment Methods & Reference Number)

-- 1. Estandarizar cualquier dato legacy suelto a 'transfer' para no romper el constraint
UPDATE milestone_payments 
SET payment_method = 'transfer' 
WHERE payment_method NOT IN ('transfer', 'cash', 'credit_card', 'paypal');

-- 2. Agregar Constraint CHECK a payment_method (Idempotente)
ALTER TABLE milestone_payments DROP CONSTRAINT IF EXISTS ck_milestone_payments_method;
ALTER TABLE milestone_payments 
ADD CONSTRAINT ck_milestone_payments_method 
CHECK (payment_method IN ('transfer', 'cash', 'credit_card', 'paypal'));

-- 3. Crear índice único para prevenir duplicidad de voucher/referencia en pagos válidos
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_valid_reference 
ON milestone_payments (reference_number, payment_method) 
WHERE status = 'valid' AND reference_number IS NOT NULL;
