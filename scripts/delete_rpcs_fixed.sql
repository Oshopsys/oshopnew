-- Execute each function separately in Supabase SQL Editor
-- Copy and paste ONE function at a time

-- ===== FUNCTION 1: DELETE INVOICE =====
CREATE OR REPLACE FUNCTION delete_invoice_rpc(p_invoice_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invoice_number TEXT;
BEGIN
    SELECT invoice_number INTO v_invoice_number
    FROM invoices
    WHERE id = p_invoice_id;

    IF v_invoice_number IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invoice not found');
    END IF;

    DELETE FROM journal_entry_lines
    WHERE entry_id IN (
        SELECT id FROM journal_entries 
        WHERE reference = v_invoice_number
    );

    DELETE FROM journal_entries
    WHERE reference = v_invoice_number;

    DELETE FROM inventory_transactions
    WHERE invoice_id = p_invoice_id;

    DELETE FROM invoice_lines
    WHERE invoice_id = p_invoice_id;

    DELETE FROM invoices
    WHERE id = p_invoice_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ===== FUNCTION 2: DELETE RECEIPT =====
CREATE OR REPLACE FUNCTION delete_receipt_rpc(p_receipt_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_receipt_number TEXT;
BEGIN
    SELECT COALESCE(reference, number) INTO v_receipt_number
    FROM payments
    WHERE id = p_receipt_id AND type = 'RECEIPT';

    IF v_receipt_number IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Receipt not found');
    END IF;

    DELETE FROM journal_entry_lines
    WHERE entry_id IN (
        SELECT id FROM journal_entries 
        WHERE reference = v_receipt_number
    );

    DELETE FROM journal_entries
    WHERE reference = v_receipt_number;

    DELETE FROM payments
    WHERE id = p_receipt_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ===== FUNCTION 3: DELETE PAYMENT =====
CREATE OR REPLACE FUNCTION delete_payment_rpc(p_payment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_payment_number TEXT;
BEGIN
    SELECT COALESCE(reference, number) INTO v_payment_number
    FROM payments
    WHERE id = p_payment_id AND type = 'PAYMENT';

    IF v_payment_number IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
    END IF;

    DELETE FROM journal_entry_lines
    WHERE entry_id IN (
        SELECT id FROM journal_entries 
        WHERE reference = v_payment_number
    );

    DELETE FROM journal_entries
    WHERE reference = v_payment_number;

    DELETE FROM payments
    WHERE id = p_payment_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ===== FUNCTION 4: DELETE TRANSFER =====
CREATE OR REPLACE FUNCTION delete_transfer_rpc(p_transfer_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_transfer_reference TEXT;
BEGIN
    SELECT reference INTO v_transfer_reference
    FROM payments
    WHERE id = p_transfer_id AND type = 'TRANSFER';

    IF v_transfer_reference IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Transfer not found');
    END IF;

    DELETE FROM journal_entry_lines
    WHERE entry_id IN (
        SELECT id FROM journal_entries 
        WHERE reference = v_transfer_reference
    );

    DELETE FROM journal_entries
    WHERE reference = v_transfer_reference;

    DELETE FROM payments
    WHERE id = p_transfer_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
