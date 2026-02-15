-- 1. Seed Accounts if not exist
INSERT INTO "public"."chart_of_accounts" (id, code, name, type)
VALUES 
('12000000-0000-0000-0000-000000001200', '1200', 'Accounts Receivable', 'ASSET'),
('22000000-0000-0000-0000-000000002200', '2200', 'Accounts Payable', 'LIABILITY'),
('40000000-0000-0000-0000-000000004000', '4000', 'Sales Revenue', 'REVENUE'),
('50000000-0000-0000-0000-000000005000', '5000', 'Cost of Goods Sold', 'EXPENSE'),
('13000000-0000-0000-0000-000000001300', '1300', 'Inventory Asset', 'ASSET')
ON CONFLICT (code) DO NOTHING;

-- 2. Create Approve Invoice Function
CREATE OR REPLACE FUNCTION approve_invoice(p_invoice_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invoice RECORD;
    v_entry_id UUID;
    v_ar_account UUID;
    v_sales_account UUID;
    v_ap_account UUID;
    v_expense_account UUID;
    v_inventory_account UUID;
BEGIN
    -- Get Invoice
    SELECT * INTO v_invoice FROM invoices WHERE id = p_invoice_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invoice not found';
    END IF;

    -- If status is already POSTED, we might still want to allow if no journal entry exists, but safer to block
    -- IF v_invoice.status = 'POSTED' OR v_invoice.status = 'PAID' THEN
    --    RAISE EXCEPTION 'Invoice is already approved/posted';
    -- END IF;

    -- Get Account IDs (using codes for stability)
    SELECT id INTO v_ar_account FROM chart_of_accounts WHERE code = '1200';
    SELECT id INTO v_sales_account FROM chart_of_accounts WHERE code = '4000';
    SELECT id INTO v_ap_account FROM chart_of_accounts WHERE code = '2200';
    SELECT id INTO v_expense_account FROM chart_of_accounts WHERE code = '5000'; -- Expenses or COGS
    SELECT id INTO v_inventory_account FROM chart_of_accounts WHERE code = '1300';

    -- Create Journal Entry Header
    INSERT INTO journal_entries (transaction_date, reference, description, status)
    VALUES (
        v_invoice.date, 
        v_invoice.invoice_number, 
        'Journal Entry for ' || v_invoice.type || ' Invoice #' || v_invoice.invoice_number, 
        'POSTED'
    )
    RETURNING id INTO v_entry_id;

    -- Create Journal Entry Lines
    IF v_invoice.type = 'SALE' THEN
        -- Debit AR (Asset increases)
        INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_ar_account, COALESCE(v_invoice.total, 0), 0, 'Receivable for Invoice ' || v_invoice.invoice_number);

        -- Credit Sales (Revenue increases)
         INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_sales_account, 0, COALESCE(v_invoice.total, 0), 'Sales Revenue for Invoice ' || v_invoice.invoice_number);

    ELSIF v_invoice.type = 'PURCHASE' THEN
        -- Debit Inventory/Expense (Asset/Expense increases)
        INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_expense_account, COALESCE(v_invoice.total, 0), 0, 'Purchase/Expense for Invoice ' || v_invoice.invoice_number);

        -- Credit AP (Liability increases)
        INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_ap_account, 0, COALESCE(v_invoice.total, 0), 'Payable for Invoice ' || v_invoice.invoice_number);
    END IF;

    -- Update Invoice Status
    UPDATE invoices
    SET status = 'POSTED'
    WHERE id = p_invoice_id;

    RETURN jsonb_build_object('success', true, 'entry_id', v_entry_id);
END;
$$;
