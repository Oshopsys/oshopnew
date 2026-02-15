const fs = require('fs');

const projectRef = 'mzkrcbbatnzzfcbrtjot';
const token = 'sbp_v0_04f8e627b739955c274bc9a449bf444c07a09be8';

async function applyMigration() {
    console.log('📖 Reading migration file...');
    const sql = fs.readFileSync('supabase/migrations/20260215_add_entry_number.sql', 'utf8');

    console.log('🚀 Applying migration to project:', projectRef);
    console.log('='.repeat(60));

    try {
        const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query: sql })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('❌ Failed to apply migration:', response.status);
            console.error('Response:', text);
            process.exit(1);
        }

        const data = await response.json();
        console.log('✅ Migration applied successfully!');
        console.log('Response:', JSON.stringify(data, null, 2));

        console.log('\n🔍 Verifying changes...');

        // Verify by querying the table
        const verifyQuery = `
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'journal_entries' 
            AND column_name = 'entry_number';
        `;

        const verifyResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query: verifyQuery })
        });

        if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            console.log('✅ Verification successful:');
            console.log(JSON.stringify(verifyData, null, 2));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

applyMigration();
