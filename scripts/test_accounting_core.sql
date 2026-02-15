-- Test Script for Accounting Core Repair
-- 1. Setup Test Data
DO $$
DECLARE
    v_partner_id UUID;
    v_service_item_id UUID;
    v_product_item_id UUID;
    v_purchase_invoice_id UUID;
    v_sales_invoice_id UUID;
    v_pi_lines JSONB;
    v_si_lines JSONB;
BEGIN
    -- Create or Get Test Partner
    INSERT INTO partners (name, type, is_active) 
    VALUES ('Test Partner', 'BOTH', true)
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO v_partner_id FROM partners WHERE name = 'Test Partner' LIMIT 1;

    -- Create Test Service Item
    INSERT INTO inventory_items (name, code, type, sales_price, cost_price, quantity_on_hand)
    VALUES ('Test Service', 'SVC-001', 'SERVICE', 100, 0, 0)
    RETURNING id INTO v_service_item_id;

    -- Create Test Product Item
    INSERT INTO inventory_items (name, code, type, sales_price, cost_price, quantity_on_hand)
    VALUES ('Test Product', 'PROD-001', 'PRODUCT', 200, 50, 0)
    RETURNING id INTO v_product_item_id;

    -- 2. Test Purchase Invoice (10 Products, 1 Service)
    -- Product Cost: 50 * 10 = 500 (Should Debit Inventory)
    -- Service Cost: 100 * 1 = 100 (Should Debit Expense)
    -- Total AP: 600
    
    v_pi_lines := jsonb_build_array(
        jsonb_build_object('item_id', v_product_item_id, 'quantity', 10, 'unit_price', 50, 'amount', 500, 'description', '10 Products'),
        jsonb_build_object('item_id', v_service_item_id, 'quantity', 1, 'unit_price', 100, 'amount', 100, 'description', '1 Service')
    );

    SELECT invoice_id INTO v_purchase_invoice_id FROM create_invoice_rpc(
        'PURCHASE', '2026-10-01', v_partner_id, 'PI-TEST-001', 'REF-PI', 'Test Purchase', 600, v_pi_lines
    ) AS x(success boolean, invoice_id uuid);

    -- Approve Purchase Invoice
    PERFORM approve_invoice_rpc(v_purchase_invoice_id);

    -- 3. Test Sales Invoice (5 Products)
    -- Sale Price: 200 * 5 = 1000 (Revenue)
    -- Cost Price: 50 * 5 = 250 (COGS)
    
    v_si_lines := jsonb_build_array(
        jsonb_build_object('item_id', v_product_item_id, 'quantity', 5, 'unit_price', 200, 'amount', 1000, 'description', '5 Products')
    );

    SELECT invoice_id INTO v_sales_invoice_id FROM create_invoice_rpc(
        'SALE', '2026-10-02', v_partner_id, 'SI-TEST-001', 'REF-SI', 'Test Sale', 1000, v_si_lines
    ) AS x(success boolean, invoice_id uuid);

    -- Approve Sales Invoice
    PERFORM approve_invoice_rpc(v_sales_invoice_id);

END $$;

-- 4. Verification Queries

-- Check Inventory Quantities
SELECT name, code, quantity_on_hand 
FROM inventory_items 
WHERE code IN ('PROD-001', 'SVC-001');

-- Check Journal Entries for Purchase
SELECT 
    je.reference,
    je.status,
    jel.description,
    c.name as account_name,
    jel.debit,
    jel.credit
FROM journal_entries je
JOIN journal_entry_lines jel ON je.id = jel.entry_id
JOIN chart_of_accounts c ON jel.account_id = c.id
WHERE je.reference = 'PI-TEST-001'
ORDER BY jel.debit DESC;

-- Check Journal Entries for Sale
SELECT 
    je.reference,
    je.status,
    jel.description,
    c.name as account_name,
    jel.debit,
    jel.credit
FROM journal_entries je
JOIN journal_entry_lines jel ON je.id = jel.entry_id
JOIN chart_of_accounts c ON jel.account_id = c.id
WHERE je.reference = 'SI-TEST-001'
ORDER BY jel.debit DESC;
