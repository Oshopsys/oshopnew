const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mzkrcbbatnzzfcbrtjot.supabase.co';
const token = 'sbp_v0_04f8e627b739955c274bc9a449bf444c07a09be8';

console.log('Testing connection to:', supabaseUrl);
console.log('Using token:', token.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, token, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});

async function testConnection() {
    try {
        console.log('Attempting to fetch chart_of_accounts...');
        const { data, error } = await supabase
            .from('chart_of_accounts')
            .select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Connection failed:', error.message);
            console.error('Full error:', JSON.stringify(error, null, 2));
        } else {
            console.log('Connection successful!');
            console.log('Row count:', data); // data is null for head: true with count, but check count
        }

        // Try to insert a dummy record to check write access if read worked or regardless
        console.log('Attempting to insert a test record...');
        const testAccount = {
            code: 'TEST_' + Date.now(),
            name: 'Token Test Account',
            type: 'ASSET'
        };

        // We expect this to fail if RLS blocks it, or succeed if token has admin/authorized rights
        const { data: insertData, error: insertError } = await supabase
            .from('chart_of_accounts')
            .insert(testAccount)
            .select()
            .single();

        if (insertError) {
            console.error('Insert failed:', insertError.message);
        } else {
            console.log('Insert successful:', insertData);
            // Clean up
            await supabase.from('chart_of_accounts').delete().eq('id', insertData.id);
            console.log('Cleaned up test record.');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
