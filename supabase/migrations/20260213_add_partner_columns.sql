-- Add missing columns to partners table
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'LYD',
ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 0; -- In days

-- Notify user of schema change
COMMENT ON COLUMN public.partners.credit_limit IS 'Maximum credit allowed for the partner';
COMMENT ON COLUMN public.partners.currency IS 'Default currency for the partner';
COMMENT ON COLUMN public.partners.payment_terms IS 'Payment terms in days';
