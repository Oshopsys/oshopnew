-- 1. Add missing columns to partners table
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'LYD',
ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 0;

COMMENT ON COLUMN public.partners.credit_limit IS 'Maximum credit allowed for the partner';
COMMENT ON COLUMN public.partners.currency IS 'Default currency for the partner';
COMMENT ON COLUMN public.partners.payment_terms IS 'Payment terms in days';

-- 2. Apply RLS Policies for Invoices
ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."invoices";
CREATE POLICY "Enable read access for authenticated users" ON "public"."invoices" AS PERMISSIVE FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable write access for authenticated users" ON "public"."invoices";
CREATE POLICY "Enable write access for authenticated users" ON "public"."invoices" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for authenticated users" ON "public"."invoices";
CREATE POLICY "Enable update access for authenticated users" ON "public"."invoices" AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 3. Apply RLS Policies for Invoice Lines
ALTER TABLE "public"."invoice_lines" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."invoice_lines";
CREATE POLICY "Enable read access for authenticated users" ON "public"."invoice_lines" AS PERMISSIVE FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable write access for authenticated users" ON "public"."invoice_lines";
CREATE POLICY "Enable write access for authenticated users" ON "public"."invoice_lines" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for authenticated users" ON "public"."invoice_lines";
CREATE POLICY "Enable update access for authenticated users" ON "public"."invoice_lines" AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON "public"."invoice_lines";
CREATE POLICY "Enable delete access for authenticated users" ON "public"."invoice_lines" AS PERMISSIVE FOR DELETE TO authenticated USING (true);
