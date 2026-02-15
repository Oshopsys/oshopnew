const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
    console.log('🚀 Starting Financial Cycle Test...');

    // 0. Authenticate
    console.log('--- Authenticating ---');
    const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: 'test_cycle_user@example.com',
        password: 'password123'
    });

    if (authError && authError.message !== 'User already registered') {
        // Try sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: 'test_cycle_user@example.com',
            password: 'password123'
        });
        if (signInError) throw new Error('Auth Failed: ' + signInError.message);
    } else if (authError) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: 'test_cycle_user@example.com',
            password: 'password123'
        });
        if (signInError) throw new Error('Auth Failed: ' + signInError.message);
    }
    console.log('✅ Authenticated');

    // 1. Setup Data
    console.log('\n--- Setting up Test Data ---');

    // Get or Create Bank Account
    let { data: bankAccount } = await supabase.from('bank_accounts').select('*').limit(1).single();
    if (!bankAccount) {
        console.log('Creating Bank Account...');
        // Need a GL account first? Assuming 111000 exists from seed.
        // Actually, let's just pick one or create.
    }
    console.log(`Using Bank Account: ${bankAccount?.name} (${bankAccount?.id})`);

    // Get or Create Customer
    let { data: customer } = await supabase.from('partners').select('*').eq('type', 'CUSTOMER').limit(1).single();
    if (!customer) {
        const { data: newCustomer } = await supabase.from('partners').insert({
            name: 'Test Cycle Customer',
            type: 'CUSTOMER',
            currency: 'LYD'
        }).select().single();
        customer = newCustomer;
    }
    console.log(`Using Customer: ${customer?.name} (${customer?.id})`);

    // Get or Create Supplier
    let { data: supplier } = await supabase.from('partners').select('*').eq('type', 'SUPPLIER').limit(1).single();
    if (!supplier) {
        const { data: newSupplier } = await supabase.from('partners').insert({
            name: 'Test Cycle Supplier',
            type: 'SUPPLIER',
            currency: 'LYD'
        }).select().single();
        supplier = newSupplier;
    }
    console.log(`Using Supplier: ${supplier?.name} (${supplier?.id})`);

    // Get Sales Account (Revenue) - Assuming 410000
    // Get Inventory Item
    let { data: item } = await supabase.from('inventory_items').select('*').limit(1).single();
    console.log(`Using Item: ${item?.name} (${item?.id})`);


    // constants
    const SALES_AMOUNT = 1000;
    const PURCHASE_AMOUNT = 500;

    // 2. Sales Cycle
    console.log('\n--- 2. Executing Sales Cycle ---');

    // 2.1 Create Draft Invoice
    const invoiceData = {
        date: new Date().toISOString(),
        due_date: new Date().toISOString(),
        partner_id: customer.id,
        type: 'SALE',
        status: 'DRAFT',
        currency: 'LYD',
        exchange_rate: 1,
        subtotal: SALES_AMOUNT,
        tax_total: 0,
        total: SALES_AMOUNT,
        notes: 'Test Cycle Invoice'
    };

    const { data: salesInvoice, error: invError } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

    if (invError) throw new Error('Create Sales Invoice Failed: ' + invError.message);
    console.log(`Created Sales Invoice: ${salesInvoice.id} (Draft)`);

    // Add Line
    const { error: lineError } = await supabase.from('invoice_lines').insert({
        invoice_id: salesInvoice.id,
        item_id: item.id,
        description: 'Test Service',
        quantity: 1,
        unit_price: SALES_AMOUNT,
        subtotal: SALES_AMOUNT,
        tax_total: 0,
        total: SALES_AMOUNT
    });
    if (lineError) throw new Error('Add Line Failed: ' + lineError.message);

    // 2.2 Approve Invoice
    console.log('Approving Sales Invoice...');
    const { error: approveError } = await supabase.rpc('approve_invoice', { p_invoice_id: salesInvoice.id });
    if (approveError) {
        console.error('Approve Failed:', approveError);
        // Continue if possible? No.
        throw new Error('Approve Invoice Failed');
    }
    console.log('✅ Sales Invoice Approved');

    // 2.3 Create Receipt
    console.log('Creating Receipt Voucher...');
    // We use the RPC create_treasury_transaction
    const receiptPayload = {
        p_type: 'RECEIPT',
        p_date: new Date().toISOString(),
        p_bank_account_id: bankAccount.id,
        p_partner_id: customer.id,
        p_reference: 'REC-' + salesInvoice.id.substring(0, 4),
        p_description: 'Payment for Invoice ' + salesInvoice.id,
        p_amount: SALES_AMOUNT,
        p_lines: [{
            // We need to credit AR. In this system's logic, we usually select the account in the UI.
            // For testing, let's query the AR account linked to the customer or just use a known AR account ID if we can find it.
            // OR, better, we check what account the invoice posted to?
            // The invoice approval posted to `receivable_account_id` of the partner or default.
            // Let's assume we pick the generic AR account manually for the receipt line.
            // Wait, the RPC expects `account_id` for the other side of the entry.
            // If this is a receipt for an invoice, we should credit AR.
            // Let's find an account of type 'ASSET' (Receivable).
            account_id: (await supabase.from('chart_of_accounts').select('id').eq('code', '120000').single()).data?.id,
            description: 'Payment for Invoice',
            amount: SALES_AMOUNT
        }]
    };

    // Fallback if 120000 not found, try any asset
    if (!receiptPayload.p_lines[0].account_id) {
        const { data: arAccount } = await supabase.from('chart_of_accounts').select('id').ilike('name', '%Customers%').limit(1).single();
        receiptPayload.p_lines[0].account_id = arAccount.id;
    }

    const { data: receipt, error: receiptError } = await supabase.rpc('create_treasury_transaction', receiptPayload);
    if (receiptError) throw new Error('Create Receipt Failed: ' + receiptError.message);
    console.log(`✅ Receipt Created: ${receipt}`);


    // 3. Purchase Cycle
    console.log('\n--- 3. Executing Purchase Cycle ---');
    // 3.1 Create Draft Invoice
    const purchaseData = {
        date: new Date().toISOString(),
        due_date: new Date().toISOString(),
        partner_id: supplier.id,
        type: 'PURCHASE',
        status: 'DRAFT',
        currency: 'LYD',
        exchange_rate: 1,
        subtotal: PURCHASE_AMOUNT,
        tax_total: 0,
        total: PURCHASE_AMOUNT,
        notes: 'Test Cycle Purchase'
    };

    const { data: purchaseInvoice, error: purError } = await supabase
        .from('invoices')
        .insert(purchaseData)
        .select()
        .single();

    if (purError) throw new Error('Create Purchase Invoice Failed: ' + purError.message);
    console.log(`Created Purchase Invoice: ${purchaseInvoice.id} (Draft)`);

    // Add Line
    await supabase.from('invoice_lines').insert({
        invoice_id: purchaseInvoice.id,
        item_id: item.id,
        description: 'Test Service Purchase',
        quantity: 1,
        unit_price: PURCHASE_AMOUNT,
        subtotal: PURCHASE_AMOUNT,
        tax_total: 0,
        total: PURCHASE_AMOUNT
    });

    // 3.2 Approve Invoice
    console.log('Approving Purchase Invoice...');
    const { error: purApproveError } = await supabase.rpc('approve_invoice', { p_invoice_id: purchaseInvoice.id });
    if (purApproveError) throw new Error('Approve Purchase Invoice Failed: ' + purApproveError.message);
    console.log('✅ Purchase Invoice Approved');

    // 3.3 Create Payment
    console.log('Creating Payment Voucher...');
    const paymentPayload = {
        p_type: 'PAYMENT',
        p_date: new Date().toISOString(),
        p_bank_account_id: bankAccount.id,
        p_partner_id: supplier.id,
        p_reference: 'PAY-' + purchaseInvoice.id.substring(0, 4),
        p_description: 'Payment for Purchase ' + purchaseInvoice.id,
        p_amount: PURCHASE_AMOUNT,
        p_lines: [{
            // Debit AP
            account_id: (await supabase.from('chart_of_accounts').select('id').eq('code', '210000').single()).data?.id,
            description: 'Payment for Purchase',
            amount: PURCHASE_AMOUNT
        }]
    };

    // Fallback AP
    if (!paymentPayload.p_lines[0].account_id) {
        const { data: apAccount } = await supabase.from('chart_of_accounts').select('id').ilike('name', '%Suppliers%').limit(1).single();
        paymentPayload.p_lines[0].account_id = apAccount.id;
    }

    const { data: payment, error: paymentError } = await supabase.rpc('create_treasury_transaction', paymentPayload);
    if (paymentError) throw new Error('Create Payment Failed: ' + paymentError.message);
    console.log(`✅ Payment Created: ${payment}`);

    // 4. Verification Check
    console.log('\n--- 4. Verification (GL Impact) ---');
    console.log('Fetching Journal Entries...');

    // Fetch last few entries
    const { data: entries } = await supabase
        .from('journal_entries')
        .select(`
            *,
            lines:journal_entry_lines(
                account:chart_of_accounts(name, code),
                debit,
                credit
            )
        `)
        .order('created_at', { ascending: false })
        .limit(4); // 2 invoices + 2 treasury

    // console.log(JSON.stringify(entries, null, 2));

    entries.forEach(entry => {
        console.log(`Entry: ${entry.entry_number || entry.id} (${entry.description})`);
        entry.lines.forEach(line => {
            console.log(`  - ${line.account.code} ${line.account.name}: Dr ${line.debit} | Cr ${line.credit}`);
        });
        console.log('-------------------');
    });

    console.log('\n✅ Test Completed Successfully.');
}

runTest().catch(err => console.error('Test Failed:', err));
