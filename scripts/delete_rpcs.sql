-- Delete Invoice RPC (Simplified - no reference_id)
-- This deletes an invoice and its related records
CREATE OR REPLACE FUNCTION delete_invoice_rpc(p_invoice_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invoice_number TEXT;
BEGIN
    -- Get invoice number for journal entry cleanup
    SELECT invoice_number INTO v_invoice_number
    FROM invoices
    WHERE id = p_invoice_id;

    IF v_invoice_number IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invoice not found');
    END IF;

    -- Delete journal entry lines associated with this invoice (via reference match)
    DELETE FROM journal_entry_lines
    WHERE entry_id IN (
        SELECT id FROM journal_entries 
        WHERE reference = v_invoice_number
    );

    -- Delete journal entries
    DELETE FROM journal_entries
    WHERE reference = v_invoice_number;

    -- Delete inventory transactions (should cascade or be handled by triggers)
    -- If no CASCADE is set up, we need manual deletion
    DELETE FROM inventory_transactions
    WHERE invoice_id = p_invoice_id;

    -- Delete invoice lines (should cascade from invoice deletion)
    DELETE FROM invoice_lines
    WHERE invoice_id = p_invoice_id;

    -- Delete the invoice itself
    DELETE FROM invoices
    WHERE id = p_invoice_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Delete Receipt RPC  
CREATE OR REPLACE FUNCTION delete_receipt_rpc(p_receipt_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_receipt_number TEXT;
BEGIN
    -- Get receipt number/reference for journal entry cleanup
    SELECT COALESCE(reference, number) INTO v_receipt_number
    FROM payments
    WHERE id = p_receipt_id AND type = 'RECEIPT';

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

    -- Delete the receipt
    DELETE FROM payments
    WHERE id = p_receipt_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Delete Payment RPC
CREATE OR REPLACE FUNCTION delete_payment_rpc(p_payment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_payment_number TEXT;
BEGIN
    -- Get payment number/reference for journal entry cleanup
    SELECT COALESCE(reference, number) INTO v_payment_number
    FROM payments
    WHERE id = p_payment_id AND type = 'PAYMENT';

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

    -- Delete the payment
    DELETE FROM payments
    WHERE id = p_payment_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Delete Transfer RPC
CREATE OR REPLACE FUNCTION delete_transfer_rpc(p_transfer_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_transfer_reference TEXT;
BEGIN
    -- Get transfer reference for journal entry cleanup
    SELECT reference INTO v_transfer_reference
    FROM payments
    WHERE id = p_transfer_id AND type = 'TRANSFER';

    IF v_transfer_reference IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Transfer not found');
    END IF;

    -- Delete journal entry lines
    DELETE FROM journal_entry_lines
    WHERE entry_id IN (
        SELECT id FROM journal_entries 
        WHERE reference = v_transfer_reference
    );

    -- Delete journal entries
    DELETE FROM journal_entries
    WHERE reference = v_transfer_reference;

    -- Delete the transfer
    DELETE FROM payments
    WHERE id = p_transfer_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;
