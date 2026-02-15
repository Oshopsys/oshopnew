const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://mzkrcbbatnzzfcbrtjot.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16a3JjYmJhdG56emZjYnJ0am90Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk4MTIxMiwiZXhwIjoyMDg2NTU3MjEyfQ.Rnyajz3-h-b1v9M1KG4KW5fCOjBXijcC8_gr4n92AzU';

async function applyMigration() {
    console.log('📖 Reading migration file...');
    const migrationSQL = fs.readFileSync('supabase/migrations/20260215_add_entry_number.sql', 'utf8');

    console.log('🔌 Creating Supabase admin client...');
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    console.log('🚀 Executing migration statements...');
    console.log('='.repeat(60));

    // Split into individual statements and execute one by one
    const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--') && s.length > 5);

    console.log(`Found ${statements.length} statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i] + ';';
        console.log(`\n[${i + 1}/${statements.length}] Executing:`);
        console.log(stmt.substring(0, 80) + '...');

        try {
            const { data, error } = await supabase.rpc('exec_sql', {
                sql_string: stmt
            });

            if (error) {
                console.log(`⚠️  RPC not available, trying direct query...`);
                // This won't work but let's try to check current state
            } else {
                console.log(`✅ Success`);
            }
        } catch (err) {
            console.log(`⚠️  Note: ${err.message}`);
        }
    }

    console.log('\n📊 Verifying column exists...');

    try {
        const { data, error } = await supabase
            .from('journal_entries')
            .select('entry_number')
            .limit(1);

        if (error) {
            if (error.message.includes('entry_number')) {
                console.log('❌ Column entry_number still does not exist');
                console.log('\n⚠️  Migration needs to be applied manually via Supabase Dashboard');
                console.log('\n📋 Instructions:');
                console.log('1. Go to: https://supabase.com/dashboard/project/mzkrcbbatnzzfcbrtjot/sql/new');
                console.log('2. Copy the SQL from: supabase/migrations/20260215_add_entry_number.sql');
                console.log('3. Paste and run it in the SQL Editor');
                return false;
            } else {
                console.error('Error:', error.message);
            }
        } else {
            console.log('✅ Column entry_number exists!');
            if (data && data.length > 0 && data[0].entry_number) {
                console.log('Sample entry_number:', data[0].entry_number);
            }
            return true;
        }
    } catch (err) {
        console.error('Verification error:', err.message);
    }

    return false;
}

applyMigration().then(success => {
    if (success) {
        console.log('\n🎉 Migration completed successfully!');
        process.exit(0);
    } else {
        console.log('\n⚠️  Migration may need manual application');
        process.exit(1);
    }
});
