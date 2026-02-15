-- Test Script for Treasury Logic
-- 1. Setup Test Data
DO $$
DECLARE
    v_bank_id UUID;
    v_expense_account_id UUID;
    v_payment_json JSONB;
    v_payment_id UUID;
    v_je_count INT;
    v_je_id UUID;
BEGIN
    -- Get a Bank Account (ensure one exists)
    SELECT id INTO v_bank_id FROM bank_accounts LIMIT 1;
    IF v_bank_id IS NULL THEN
        RAISE EXCEPTION 'No bank account found for testing';
    END IF;

    -- Get Expense Account
    SELECT id INTO v_expense_account_id FROM chart_of_accounts WHERE code = '5000' OR name = 'Operating Expenses' LIMIT 1;

    -- 2. Create a Payment
    -- Reference: 'TEST-REF-001'
    v_payment_json := create_treasury_transaction(
        'PAYMENT',
        '2026-10-10',
        v_bank_id,
        NULL, -- partner_id
        'TEST-REF-001',
        'Test Payment Description',
        100.00,
        jsonb_build_array(
            jsonb_build_object('account_id', v_expense_account_id, 'amount', 100.00, 'description', 'Expense Line')
        )
    );
    
    v_payment_id := (v_payment_json->>'payment_id')::UUID;
    RAISE NOTICE 'Created Payment ID: %', v_payment_id;

    -- 3. Verify Journal Entry Exists
    SELECT count(*), id INTO v_je_count, v_je_id 
    FROM journal_entries 
    WHERE reference = 'TEST-REF-001'
    GROUP BY id;
    
    RAISE NOTICE 'Journal Entries found with reference TEST-REF-001: %', v_je_count;
    
    IF v_je_count = 0 THEN
        RAISE EXCEPTION 'Journal Entry was not created for the payment';
    END IF;

    -- 4. Delete the Payment
    PERFORM delete_payment_rpc(v_payment_id);
    RAISE NOTICE 'Called delete_payment_rpc';

    -- 5. Verify Journal Entry is Deleted
    -- The BUG suspicion is that it won't be deleted because the RPC uses payment number vs reference
    SELECT count(*) INTO v_je_count 
    FROM journal_entries 
    WHERE id = v_je_id;

    IF v_je_count > 0 THEN
        RAISE NOTICE 'BUG CONFIRMED: Journal Entry (ID: %) still exists after payment deletion!', v_je_id;
    ELSE
        RAISE NOTICE 'SUCCESS: Journal Entry was correctly deleted.';
    END IF;

END $$;
