const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkInvoice() {
    console.log('--- Last 10 Invoices ---');
    const { data: latestInvoices, error: latestError } = await supabase
        .from('invoices')
        .select('*, lines:invoice_lines(*)')
        .order('created_at', { ascending: false })
        .limit(10);

    if (latestError) {
        console.error('Error fetching invoices:', latestError);
        return;
    }

    latestInvoices.forEach(inv => {
        console.log(`Invoice: ${inv.invoice_number}, Type: ${inv.type}`);
        // console.log(`Reference (Notes): ${inv.notes}`); // Check notes for reference
        console.log(`Notes: ${inv.notes}`);
        console.log(`Lines: ${inv.lines.length}`);
        inv.lines.forEach(line => {
            console.log(`  - Item: ${line.description}, Qty: ${line.quantity}, Price: ${line.unit_price}`);
        });
        console.log('-----------------------');
    });
}

checkInvoice();
