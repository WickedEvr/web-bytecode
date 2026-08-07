-- Drop the trigger that enforces payment currency to match project currency
-- This allows milestones to be paid in the currency of their original quote/addendum (e.g., EUR)
-- even if the root project is in another currency (e.g., USD).
DROP TRIGGER IF EXISTS trg_milestone_payments_validate_currency ON milestone_payments;
