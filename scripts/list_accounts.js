const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function listAccounts() {
    const { data: accounts, error } = await supabase
        .from('chart_of_accounts')
        .select('id, name, code, type')
        .order('code');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Chart of Accounts:');
        accounts.forEach(acc => {
            console.log(`${acc.code} - ${acc.name} (${acc.type}) [${acc.id}]`);
        });
    }
}

listAccounts();
