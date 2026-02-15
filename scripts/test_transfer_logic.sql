-- Test Script for Transfer Logic
-- 1. Setup Test Data
DO $$
DECLARE
    v_bank_from_id UUID;
    v_bank_to_id UUID;
    v_transfer_json JSONB;
    v_transfer_id UUID;
    v_je_count INT;
    v_je_id UUID;
BEGIN
    -- Get two Bank Accounts
    SELECT id INTO v_bank_from_id FROM bank_accounts LIMIT 1;
    SELECT id INTO v_bank_to_id FROM bank_accounts WHERE id <> v_bank_from_id LIMIT 1;
    
    IF v_bank_from_id IS NULL OR v_bank_to_id IS NULL THEN
        RAISE NOTICE 'Skipping Transfer Test: Need at least 2 bank accounts.';
        RETURN;
    END IF;

    -- 2. Create a Transfer
    -- Reference: 'TEST-TRANSFER-001'
    v_transfer_json := create_transfer_transaction(
        '2026-10-15',
        v_bank_from_id,
        v_bank_to_id,
        'TEST-TRANSFER-001',
        'Test Transfer Description',
        500.00
    );
    
    v_transfer_id := (v_transfer_json->>'payment_id')::UUID; -- Transfers are stored in payments table currently? Or separate? 
    -- create_transfer_transaction likely returns { "id": ... } or { "payment_id": ... } depending on implementation.
    -- Let's assume it returns a JSON object. We will check the output structure if this fails.
    
    -- Actually, we don't know the exact return key. Let's try to query it back if needed.
    -- But assuming standardized RPCs, it probably returns "id" or "payment_id".
    -- Let's relax the strictness here.
    
    v_transfer_id := (v_transfer_json->>'id')::UUID;
    IF v_transfer_id IS NULL THEN
         v_transfer_id := (v_transfer_json->>'payment_id')::UUID;
    END IF;

    RAISE NOTICE 'Created Transfer ID: %', v_transfer_id;

    -- 3. Verify Journal Entry Exists
    SELECT count(*), id INTO v_je_count, v_je_id 
    FROM journal_entries 
    WHERE reference = 'TEST-TRANSFER-001'
    GROUP BY id;
    
    IF v_je_count = 0 THEN
        RAISE EXCEPTION 'Journal Entry was not created for the transfer';
    END IF;

    -- 4. Delete the Transfer
    PERFORM delete_transfer_rpc(v_transfer_id);
    RAISE NOTICE 'Called delete_transfer_rpc';

    -- 5. Verify Journal Entry is Deleted
    SELECT count(*) INTO v_je_count 
    FROM journal_entries 
    WHERE id = v_je_id;

    IF v_je_count > 0 THEN
        RAISE NOTICE 'BUG CONFIRMED: Journal Entry (ID: %) still exists after transfer deletion!', v_je_id;
    ELSE
        RAISE NOTICE 'SUCCESS: Journal Entry was correctly deleted.';
    END IF;

END $$;
