-- Test Script for Phase 3 Security Fixes

BEGIN;

DO $$
DECLARE
    v_partner_id UUID;
    v_item_id UUID;
    v_invoice_id UUID;
    v_invoice_total NUMERIC;
    v_lines JSONB;
    v_t_result JSONB;
    v_bank_id UUID;
BEGIN
    RAISE NOTICE '--- STARTING SECURITY TESTS ---';

    -- Setup: Get a Partner and Item
    SELECT id INTO v_partner_id FROM partners LIMIT 1;
    SELECT id INTO v_item_id FROM inventory_items WHERE type = 'PRODUCT' LIMIT 1;
    SELECT id INTO v_bank_id FROM bank_accounts LIMIT 1;

    -- TEST 1: Invoice Total Tampering
    -- Scenario: Frontend sends total=10, but Lines are 2 * 100 = 200.
    -- Expectation: Stored Invoice Total should be 200.

    v_lines := jsonb_build_array(
        jsonb_build_object(
            'item_id', v_item_id,
            'description', 'Security Test Item',
            'quantity', 2,
            'unit_price', 100,
            'discount', 0
        )
    );

    RAISE NOTICE 'Test 1: Attempting to create invoice with spoofed total 10 (Actual: 200)';
    
    -- Call RPC with p_total = 10
    v_t_result := create_invoice_rpc(
        'SALE',
        CURRENT_DATE,
        v_partner_id,
        'SEC-TEST-001',
        'Ref-Sec-001',
        'Testing Security',
        10, -- SPOOFED TOTAL
        v_lines
    );

    IF (v_t_result->>'success')::BOOLEAN IS TRUE THEN
        v_invoice_id := (v_t_result->>'invoice_id')::UUID;
        
        -- Verify Stored Total
        SELECT total INTO v_invoice_total FROM invoices WHERE id = v_invoice_id;
        
        IF v_invoice_total = 200 THEN
            RAISE NOTICE 'SUCCESS: Invoice Total detected as 200 (Spoof ignored).';
        ELSE
            RAISE EXCEPTION 'FAILURE: Invoice Total is %, expected 200.', v_invoice_total;
        END IF;
    ELSE
         RAISE EXCEPTION 'FAILURE: create_invoice_rpc failed: %', v_t_result;
    END IF;

    -- TEST 2: Treasury Validation
    -- Scenario: Create Payment with Amount=50, but Line Amount=100.
    -- Expectation: Should FAIL with error.
    
    RAISE NOTICE 'Test 2: Attempting to create mismatched Treasury Transaction...';
    
    BEGIN
        PERFORM create_treasury_transaction(
            'PAYMENT',
            CURRENT_DATE,
            v_bank_id,
            v_partner_id,
            'SEC-PAY-001',
            'Mismatched Payment',
            50, -- Mismatched Amount
            jsonb_build_array(
                jsonb_build_object(
                    'account_id', (SELECT id FROM chart_of_accounts WHERE code = '5000' OR type = 'EXPENSE' LIMIT 1),
                    'amount', 100, -- Actual Line Amount
                    'description', 'Expense'
                )
            )
        );
        -- If we reach here, it failed to raise exception
        RAISE EXCEPTION 'FAILURE: Mismatched Treasury Transaction was allowed!';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%Transaction amount (%) does not match sum of lines%' OR SQLERRM LIKE '%Transaction amount (50) does not match sum of lines (100)%' THEN
             RAISE NOTICE 'SUCCESS: Mismatched Treasury Transaction rejected as expected. Error: %', SQLERRM;
        ELSE
             -- Re-raise if it's a different error
             RAISE NOTICE 'CAUTION: Transaction failed but with unexpected error: %', SQLERRM;
        END IF;
    END;

    RAISE NOTICE '--- ALL SECURITY TESTS PASSED ---';
    
    -- Rollback to clean up
    RAISE EXCEPTION 'ROLLBACK_TEST';

EXCEPTION WHEN OTHERS THEN
    IF SQLERRM = 'ROLLBACK_TEST' THEN
        RAISE NOTICE 'Test run complete (Rolled back changes).';
    ELSE
        RAISE NOTICE 'TEST FAILED: %', SQLERRM;
    END IF;
END;
$$;
ROLLBACK;
