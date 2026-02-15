const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const sql = `
-- Invoices Policies
ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."invoices";
CREATE POLICY "Enable read access for authenticated users" ON "public"."invoices" AS PERMISSIVE FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable write access for authenticated users" ON "public"."invoices";
CREATE POLICY "Enable write access for authenticated users" ON "public"."invoices" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for authenticated users" ON "public"."invoices";
CREATE POLICY "Enable update access for authenticated users" ON "public"."invoices" AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Invoice Lines Policies
ALTER TABLE "public"."invoice_lines" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."invoice_lines";
CREATE POLICY "Enable read access for authenticated users" ON "public"."invoice_lines" AS PERMISSIVE FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable write access for authenticated users" ON "public"."invoice_lines";
CREATE POLICY "Enable write access for authenticated users" ON "public"."invoice_lines" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update access for authenticated users" ON "public"."invoice_lines";
CREATE POLICY "Enable update access for authenticated users" ON "public"."invoice_lines" AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON "public"."invoice_lines";
CREATE POLICY "Enable delete access for authenticated users" ON "public"."invoice_lines" AS PERMISSIVE FOR DELETE TO authenticated USING (true);
`;

async function runMigration() {
    console.log('Running RLS migration for invoices...');
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
        console.error('Migration failed:', error);
        console.log('Please execute the SQL manually if RPC exec_sql is not available.');
    } else {
        console.log('RLS policies applied successfully!');
    }
}

runMigration();
