const { Client } = require('pg');
const fs = require('fs');

// Supabase connection details
const PROJECT_REF = 'mzkrcbbatnzzfcbrtjot';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16a3JjYmJhdG56emZjYnJ0am90Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk4MTIxMiwiZXhwIjoyMDg2NTU3MjEyfQ.Rnyajz3-h-b1v9M1KG4KW5fCOjBXijcC8_gr4n92AzU';


async function applyMigration() {
    console.log('📖 Reading migration file...');
    const sql = fs.readFileSync('supabase/migrations/20260215_add_entry_number.sql', 'utf8');

    const client = new Client({
        host: `db.${PROJECT_REF}.supabase.co`,
        port: 5432,
        user: 'postgres',
        password: SERVICE_KEY,
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected!');

        console.log('🚀 Executing migration...');
        console.log('='.repeat(60));

        const result = await client.query(sql);

        console.log('✅ Migration executed successfully!');
        console.log('Result:', result);

        // Verify
        console.log('\n🔍 Verifying entry_number column exists...');
        const verifyResult = await client.query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'journal_entries' 
            AND column_name = 'entry_number'
        `);

        if (verifyResult.rows.length > 0) {
            console.log('✅ Column exists:', verifyResult.rows[0]);
        } else {
            console.log('❌ Column not found!');
        }

        // Check sample data
        console.log('\n📊 Checking sample journal entries...');
        const sampleResult = await client.query(`
            SELECT id, entry_number, description 
            FROM journal_entries 
            LIMIT 5
        `);

        console.log('Sample entries:');
        sampleResult.rows.forEach(row => {
            console.log(`  - ${row.entry_number}: ${row.description}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n🔌 Connection closed');
    }
}

applyMigration();
