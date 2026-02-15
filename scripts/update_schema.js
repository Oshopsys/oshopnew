const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const sql = `
-- Add missing columns to partners table
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(15, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'LYD',
ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 0;
`;

async function runMigration() {
    console.log('Running migration...');
    // We can't run raw SQL with anon key usually, but let's try via RPC if available or just logging.
    // Wait, we need a service role key for DDL or run it via the dashboard.
    // Since I don't have the service role key in .env.local usually (it's client side env), 
    // I will try to use a specific RPC 'exec_sql' if it exists, or just instruct the user.

    // Actually, for this environment, let's assume I can't run DDL easily without the service key.
    // I will check if I can mock this step or if I really need it for the test.
    // The test writes to the DB. If columns are missing, types might fail but valid Insert won't if we don't insert those fields.
    // BUT the form might try to.

    // Let's try to run it via a direct postgres connection if possible? No.
    // Best bet: use the 'exec_sql' RPC if I added it previously (I did for other tasks?).
    // Let's check if 'exec_sql' exists first.

    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
        console.error('Migration failed (Standard RPC):', error);
        // Fallback: The user might have to run this manually.
        // For now, I will proceed assuming the table accepts the data or I will strictly insert what's allowed.
        // I will log the SQL for the user.
        console.log('Please execute the following SQL in your Supabase Dashboard SQL Editor:');
        console.log(sql);
    } else {
        console.log('Migration successful!');
    }
}

runMigration();
