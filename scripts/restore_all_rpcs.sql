-- Comprehensive RPC Functions Restoration Script
-- This script creates all missing RPC functions for the Oshop system

-- ============================================================================
-- INVOICE RPCs
-- ============================================================================

-- 1. CREATE INVOICE RPC
CREATE OR REPLACE FUNCTION create_invoice_rpc(
    p_type TEXT,
    p_date DATE,
    p_partner_id UUID,
    p_invoice_number TEXT,
    p_reference TEXT,
    p_description TEXT,
    p_total NUMERIC,
    p_lines JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_invoice_id UUID;
    v_line JSONB;
BEGIN
    -- Insert invoice header
    INSERT INTO invoices (
        type,
        date,
        partner_id,
        invoice_number,
        reference,
        description,
        total,
        status
    )
    VALUES (
        p_type::invoice_type,
        p_date,
        p_partner_id,
        p_invoice_number,
        p_reference,
        p_description,
        p_total,
        'DRAFT'
    )
    RETURNING id INTO v_invoice_id;

    -- Insert invoice lines (total is generated, don't insert it)
    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
    LOOP
        INSERT INTO invoice_lines (
            invoice_id,
            item_id,
            description,
            quantity,
            unit_price,
            discount
        )
        VALUES (
            v_invoice_id,
            (v_line->>'item_id')::UUID,
            v_line->>'description',
            (v_line->>'quantity')::NUMERIC,
            (v_line->>'unit_price')::NUMERIC,
            COALESCE((v_line->>'discount')::NUMERIC, 0)
        );
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'invoice_id', v_invoice_id
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;


-- 2. APPROVE INVOICE RPC (ensure it exists with correct name)
CREATE OR REPLACE FUNCTION approve_invoice_rpc(p_invoice_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_invoice RECORD;
    v_entry_id UUID;
    v_ar_account UUID;
    v_sales_account UUID;
    v_ap_account UUID;
    v_expense_account UUID;
BEGIN
    -- Get Invoice
    SELECT * INTO v_invoice FROM invoices WHERE id = p_invoice_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invoice not found');
    END IF;

    -- Get Account IDs
    SELECT id INTO v_ar_account FROM chart_of_accounts WHERE code = '1200';
    SELECT id INTO v_sales_account FROM chart_of_accounts WHERE code = '4000';
    SELECT id INTO v_ap_account FROM chart_of_accounts WHERE code = '2200';
    SELECT id INTO v_expense_account FROM chart_of_accounts WHERE code = '5000';

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
        -- Debit AR
        INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_ar_account, COALESCE(v_invoice.total, 0), 0, 'Receivable for Invoice ' || v_invoice.invoice_number);

        -- Credit Sales
        INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_sales_account, 0, COALESCE(v_invoice.total, 0), 'Sales Revenue for Invoice ' || v_invoice.invoice_number);

    ELSIF v_invoice.type = 'PURCHASE' THEN
        -- Debit Expense
        INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_expense_account, COALESCE(v_invoice.total, 0), 0, 'Purchase/Expense for Invoice ' || v_invoice.invoice_number);

        -- Credit AP
        INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, description)
        VALUES (v_entry_id, v_ap_account, 0, COALESCE(v_invoice.total, 0), 'Payable for Invoice ' || v_invoice.invoice_number);
    END IF;

    -- Update Invoice Status
    UPDATE invoices
    SET status = 'POSTED'
    WHERE id = p_invoice_id;

    RETURN jsonb_build_object('success', true, 'entry_id', v_entry_id);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 3. DELETE INVOICE RPC (with SECURITY INVOKER for RLS)
DROP FUNCTION IF EXISTS delete_invoice_rpc(UUID);
CREATE FUNCTION delete_invoice_rpc(p_invoice_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_invoice_number TEXT;
BEGIN
    -- Get invoice number
    SELECT invoice_number INTO v_invoice_number
    FROM invoices
    WHERE id = p_invoice_id;

    IF v_invoice_number IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invoice not found');
    END IF;

    -- Delete journal entry lines
    DELETE FROM journal_entry_lines
    WHERE entry_id IN (
        SELECT id FROM journal_entries 
        WHERE reference = v_invoice_number
    );

    -- Delete journal entries
    DELETE FROM journal_entries
    WHERE reference = v_invoice_number;

    -- Delete invoice lines (should cascade)
    DELETE FROM invoice_lines
    WHERE invoice_id = p_invoice_id;

    -- Delete invoice
    DELETE FROM invoices
    WHERE id = p_invoice_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Failed to delete invoice');
    END IF;

    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ============================================================================
-- OTHER DELETE RPCs (from previous delete_rpcs.sql)
-- ============================================================================

-- 4. DELETE RECEIPT RPC
DROP FUNCTION IF EXISTS delete_receipt_rpc(UUID);
CREATE FUNCTION delete_receipt_rpc(p_receipt_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_receipt_number TEXT;
BEGIN
    SELECT receipt_number INTO v_receipt_number
    FROM receipts
    WHERE id = p_receipt_id;

    IF v_receipt_number IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Receipt not found');
    END IF;

    -- Delete journal entry lines
    DELETE FROM journal_entry_lines
    WHERE entry_id IN (
        SELECT id FROM journal_entries 
        WHERE reference = v_receipt_number
    );

    -- Delete journal entries
    DELETE FROM journal_entries
    WHERE reference = v_receipt_number;

    -- Delete receipt
    DELETE FROM receipts
    WHERE id = p_receipt_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 5. DELETE PAYMENT RPC
DROP FUNCTION IF EXISTS delete_payment_rpc(UUID);
CREATE FUNCTION delete_payment_rpc(p_payment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_payment_number TEXT;
BEGIN
    SELECT payment_number INTO v_payment_number
    FROM payments
    WHERE id = p_payment_id;

    IF v_payment_number IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
    END IF;

    -- Delete journal entry lines
    DELETE FROM journal_entry_lines
    WHERE entry_id IN (
        SELECT id FROM journal_entries 
        WHERE reference = v_payment_number
    );

    -- Delete journal entries
    DELETE FROM journal_entries
    WHERE reference = v_payment_number;

    -- Delete payment
    DELETE FROM payments
    WHERE id = p_payment_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 6. DELETE TRANSFER RPC
DROP FUNCTION IF EXISTS delete_transfer_rpc(UUID);
CREATE FUNCTION delete_transfer_rpc(p_transfer_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_transfer_number TEXT;
BEGIN
    SELECT transfer_number INTO v_transfer_number
    FROM transfers
    WHERE id = p_transfer_id;

    IF v_transfer_number IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Transfer not found');
    END IF;

    -- Delete journal entry lines
    DELETE FROM journal_entry_lines
    WHERE entry_id IN (
        SELECT id FROM journal_entries 
        WHERE reference = v_transfer_number
    );

    -- Delete journal entries
    DELETE FROM journal_entries
    WHERE reference = v_transfer_number;

    -- Delete transfer
    DELETE FROM transfers
    WHERE id = p_transfer_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
