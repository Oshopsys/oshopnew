-- Drop and recreate delete_invoice_rpc without inventory_transactions reference
DROP FUNCTION IF EXISTS delete_invoice_rpc(UUID);

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

    -- Delete journal entry lines associated with this invoice
    DELETE FROM journal_entry_lines
    WHERE entry_id IN (
        SELECT id FROM journal_entries 
        WHERE reference = v_invoice_number
    );

    -- Delete journal entries
    DELETE FROM journal_entries
    WHERE reference = v_invoice_number;

    -- Delete invoice lines (will cascade or fail if FK constraint exists)
    DELETE FROM invoice_lines
    WHERE invoice_id = p_invoice_id;

    -- Delete the invoice itself
    DELETE FROM invoices
    WHERE id = p_invoice_id;

    RETURN jsonb_build_object('success', true);
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
