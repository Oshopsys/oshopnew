-- Fix RLS Policies to allow Anonymous access (since app has no login yet)

-- 1. Invoices
ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."invoices";
CREATE POLICY "Enable read access for all users" ON "public"."invoices" AS PERMISSIVE FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Enable write access for authenticated users" ON "public"."invoices";
CREATE POLICY "Enable write access for all users" ON "public"."invoices" AS PERMISSIVE FOR INSERT TO authenticated, anon WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for authenticated users" ON "public"."invoices";
CREATE POLICY "Enable update access for all users" ON "public"."invoices" AS PERMISSIVE FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);

-- 2. Invoice Lines
ALTER TABLE "public"."invoice_lines" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."invoice_lines";
CREATE POLICY "Enable read access for all users" ON "public"."invoice_lines" AS PERMISSIVE FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Enable write access for authenticated users" ON "public"."invoice_lines";
CREATE POLICY "Enable write access for all users" ON "public"."invoice_lines" AS PERMISSIVE FOR INSERT TO authenticated, anon WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for authenticated users" ON "public"."invoice_lines";
CREATE POLICY "Enable update access for all users" ON "public"."invoice_lines" AS PERMISSIVE FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON "public"."invoice_lines";
CREATE POLICY "Enable delete access for all users" ON "public"."invoice_lines" AS PERMISSIVE FOR DELETE TO authenticated, anon USING (true);

-- 3. Inventory Items
ALTER TABLE "public"."inventory_items" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."inventory_items";
CREATE POLICY "Enable read access for all users" ON "public"."inventory_items" AS PERMISSIVE FOR SELECT TO authenticated, anon USING (true);

DROP POLICY IF EXISTS "Enable write access for all users" ON "public"."inventory_items";
CREATE POLICY "Enable write access for all users" ON "public"."inventory_items" AS PERMISSIVE FOR INSERT TO authenticated, anon WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON "public"."inventory_items";
CREATE POLICY "Enable update access for all users" ON "public"."inventory_items" AS PERMISSIVE FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON "public"."inventory_items";
CREATE POLICY "Enable delete access for all users" ON "public"."inventory_items" AS PERMISSIVE FOR DELETE TO authenticated, anon USING (true);
