-- Test if the RPC was updated by checking its definition
-- Run this to see what the current delete_invoice_rpc looks like:
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'delete_invoice_rpc';

-- If the above shows inventory_transactions, the RPC wasn't updated
-- Try dropping and recreating with a completely new approach
DROP FUNCTION IF EXISTS delete_invoice_rpc(UUID) CASCADE;

CREATE FUNCTION delete_invoice_rpc(p_invoice_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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

    -- Delete invoice lines
    DELETE FROM invoice_lines
    WHERE invoice_id = p_invoice_id;

    -- Delete invoice
    DELETE FROM invoices
    WHERE id = p_invoice_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
