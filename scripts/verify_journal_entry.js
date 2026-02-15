const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkInvoiceJournal(invoiceNumber) {
    if (!invoiceNumber) {
        console.log("Usage: node scripts/verify_journal_entry.js <INVOICE_NUMBER>");
        // Try to fetch the latest POSTED invoice if no number provided
        const { data: latest, error: lastError } = await supabase
            .from('invoices')
            .select('invoice_number, status')
            .eq('status', 'POSTED')
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

        if (latest) {
            console.log(`Checking latest POSTED invoice: ${latest.invoice_number}`);
            invoiceNumber = latest.invoice_number;
        } else {
            console.log("No posted invoices found to check.");
            return;
        }
    }

    console.log(`Searching for Journal Entry for Invoice: ${invoiceNumber}`);

    const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('*, lines:journal_entry_lines(*, account:chart_of_accounts(name, code))')
        .eq('reference', invoiceNumber);

    if (error) {
        console.error('Error fetching journal entries:', error);
        return;
    }

    if (entries && entries.length > 0) {
        console.log(`SUCCESS: Found ${entries.length} Journal Entry(s) for ${invoiceNumber}`);
        entries.forEach(entry => {
            console.log(`\nEntry ID: ${entry.id}`);
            console.log(`Date: ${entry.transaction_date}`);
            console.log(`Description: ${entry.description}`);
            console.log('Lines:');
            entry.lines.forEach(line => {
                console.log(`  - ${line.account.code} ${line.account.name}: Debit ${line.debit} | Credit ${line.credit}`);
            });
        });
    } else {
        console.log(`FAILURE: No Journal Entry found for ${invoiceNumber}`);
    }
}

const args = process.argv.slice(2);
checkInvoiceJournal(args[0]);
