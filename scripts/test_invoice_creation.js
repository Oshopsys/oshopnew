const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testInvoice() {
    console.log('Testing Invoice Creation...');

    // 1. Create Invoice Header
    const invoiceData = {
        date: new Date().toISOString(),
        invoice_number: `TEST-INV-${Date.now()}`,
        // partner_id: needs a valid partner. I'll search for one or create one.
        type: 'SALE',
        status: 'DRAFT',
        total: 1000
    };

    // Get a partner first
    const { data: partners } = await supabase.from('partners').select('id').limit(1);
    const partner_id = partners && partners.length > 0 ? partners[0].id : null;

    if (!partner_id) {
        console.error('No partners found to link invoice to.');
        return;
    }
    invoiceData.partner_id = partner_id;

    const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

    if (invoiceError) {
        console.error('Invoice Header Error:', invoiceError);
        return;
    }
    console.log('Invoice Header Created:', newInvoice.id);

    // 2. Create Lines
    // Try with minimal fields first
    const lineData = {
        invoice_id: newInvoice.id,
        description: 'Test Line Item Script',
        quantity: 1,
        unit_price: 1000
        // discount: 0, // removed because column doesn't exist
        // subtotal is generated
    };

    const { data: newLine, error: lineError } = await supabase
        .from('invoice_lines')
        .insert(lineData)
        .select();

    if (lineError) {
        console.error('Invoice Line Error:', JSON.stringify(lineError, null, 2));
    } else {
        console.log('Invoice Line Created Success!');
    }
}

testInvoice();
