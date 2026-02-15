-- Fix delete_invoice_rpc to use SECURITY INVOKER instead of DEFINER
-- This makes it run with the calling user's permissions (who has the RLS policies)

DROP FUNCTION IF EXISTS delete_invoice_rpc(UUID) CASCADE;

CREATE FUNCTION delete_invoice_rpc(p_invoice_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from DEFINER
AS $$
DECLARE
    v_invoice_number TEXT;
    v_journal_count INT;
    v_lines_count INT;
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
    GET DIAGNOSTICS v_lines_count = ROW_COUNT;

    -- Delete journal entries
    DELETE FROM journal_entries
    WHERE reference = v_invoice_number;
    GET DIAGNOSTICS v_journal_count = ROW_COUNT;

    -- Delete invoice lines
    DELETE FROM invoice_lines
    WHERE invoice_id = p_invoice_id;

    -- Delete invoice
    DELETE FROM invoices
    WHERE id = p_invoice_id;

    RETURN jsonb_build_object(
        'success', true, 
        'journal_entries_deleted', v_journal_count,
        'journal_lines_deleted', v_lines_count
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
