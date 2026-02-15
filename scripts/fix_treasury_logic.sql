-- Fix Treasury Logic (Updated to handle FK constraints)
-- This script repairs the deletion logic for Payments, Receipts, and Transfers.
-- It ensures that the specific Journal Entry linked to the transaction is deleted, 
-- regardless of the user-provided reference string.

-- 1. Helper Function: Centralized Deletion Logic
CREATE OR REPLACE FUNCTION delete_treasury_transaction_logic(p_txn_id UUID)
RETURNS void AS $$
DECLARE
    v_journal_id UUID;
    v_exists BOOLEAN;
BEGIN
    -- Check if transaction exists
    SELECT EXISTS (SELECT 1 FROM payments WHERE id = p_txn_id) INTO v_exists;
    IF NOT v_exists THEN
        RAISE EXCEPTION 'Transaction with ID % not found', p_txn_id;
    END IF;

    -- Get Linked Journal ID
    SELECT journal_entry_id INTO v_journal_id FROM payments WHERE id = p_txn_id;

    -- BREAK LINK: Set journal_entry_id to NULL to avoid FK constraint violation when deleting JE
    UPDATE payments SET journal_entry_id = NULL WHERE id = p_txn_id;

    -- Delete Journal Entry (and lines)
    IF v_journal_id IS NOT NULL THEN
        DELETE FROM journal_entry_lines WHERE entry_id = v_journal_id;
        DELETE FROM journal_entries WHERE id = v_journal_id;
    END IF;

    -- Delete the Transaction Record
    DELETE FROM payments WHERE id = p_txn_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Update delete_payment_rpc
-- Previously failed because it tried to match by Reference string
CREATE OR REPLACE FUNCTION delete_payment_rpc(p_payment_id UUID)
RETURNS JSONB AS $$
BEGIN
    PERFORM delete_treasury_transaction_logic(p_payment_id);
    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- 3. Update delete_receipt_rpc
-- Previously failed because it tried to delete from non-existent 'receipts' table
CREATE OR REPLACE FUNCTION delete_receipt_rpc(p_receipt_id UUID)
RETURNS JSONB AS $$
BEGIN
    PERFORM delete_treasury_transaction_logic(p_receipt_id);
    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

-- 4. Update delete_transfer_rpc (Safety fix)
CREATE OR REPLACE FUNCTION delete_transfer_rpc(p_transfer_id UUID)
RETURNS JSONB AS $$
BEGIN
    PERFORM delete_treasury_transaction_logic(p_transfer_id);
    RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;
