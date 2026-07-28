ALTER TABLE public.milestone_payments ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.admin_users(id);
