-- Phase 3: Security & Technical Debt Fixes

-- 1. Helper: Ensure get_account_id_by_name is robust (Case Insensitive)
CREATE OR REPLACE FUNCTION public.get_account_id_by_name(p_name text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_id UUID;
BEGIN
    -- Case-insensitive search for resilience
    SELECT id INTO v_id FROM chart_of_accounts WHERE lower(name) = lower(p_name) LIMIT 1;
    IF v_id IS NULL THEN
        RAISE EXCEPTION 'Account % not found', p_name;
    END IF;
    RETURN v_id;
END;
$function$;

-- 2. Secure create_invoice_rpc (Server-Side Calculation)
-- Ignores p_total and calculates it from lines.
CREATE OR REPLACE FUNCTION public.create_invoice_rpc(p_type text, p_date date, p_partner_id uuid, p_invoice_number text, p_reference text, p_description text, p_total numeric, p_lines jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_invoice_id UUID;
    v_line JSONB;
    v_computed_total NUMERIC := 0;
    v_line_total NUMERIC;
BEGIN
    -- 1. Calculate Total from Lines
    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
    LOOP
        v_line_total := (v_line->>'quantity')::NUMERIC * (v_line->>'unit_price')::NUMERIC;
        -- Apply discount if present
        v_line_total := v_line_total - COALESCE((v_line->>'discount')::NUMERIC, 0);
        v_computed_total := v_computed_total + v_line_total;
    END LOOP;

    -- 2. Insert invoice header with COMPUTED total
    INSERT INTO invoices (
        type, date, partner_id, invoice_number, reference, description, total, status
    )
    VALUES (
        p_type::invoice_type,
        p_date,
        p_partner_id,
        p_invoice_number,
        p_reference,
        p_description,
        v_computed_total, -- USE COMPUTED TOTAL
        'DRAFT'
    )
    RETURNING id INTO v_invoice_id;

    -- 3. Insert invoice lines
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
        'invoice_id', v_invoice_id,
        'computed_total', v_computed_total
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$function$;

-- 3. Secure create_treasury_transaction (Validation)
CREATE OR REPLACE FUNCTION public.create_treasury_transaction(p_type character varying, p_date date, p_bank_account_id uuid, p_partner_id uuid, p_reference character varying, p_description text, p_amount numeric, p_lines jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_payment_id UUID;
    v_journal_id UUID;
    v_bank_gl_account_id UUID;
    v_line JSONB;
    v_number VARCHAR;
    v_lines_total NUMERIC := 0;
BEGIN
    -- 1. Validate Amount against Lines (if lines exist)
    IF jsonb_array_length(p_lines) > 0 THEN
        SELECT SUM((line->>'amount')::NUMERIC) INTO v_lines_total
        FROM jsonb_array_elements(p_lines) AS line;
        
        -- Allow small rounding difference (0.01)
        IF ABS(v_lines_total - p_amount) > 0.05 THEN
             RAISE EXCEPTION 'Transaction amount (%) does not match sum of lines (%)', p_amount, v_lines_total;
        END IF;
    END IF;

    -- 2. Get Bank GL Account
    SELECT gl_account_id INTO v_bank_gl_account_id FROM bank_accounts WHERE id = p_bank_account_id;
    IF v_bank_gl_account_id IS NULL THEN
        RAISE EXCEPTION 'This Bank Account is not linked to a Chart of Account ID';
    END IF;

    -- Generate Number
    v_number := CASE WHEN p_type = 'PAYMENT' THEN 'PAY-' ELSE 'REC-' END || floor(extract(epoch from now()));

    -- 3. Create Payment Record
    INSERT INTO payments (
        type, date, bank_account_id, partner_id, reference, description, amount, number, method
    ) VALUES (
        p_type, p_date, p_bank_account_id, p_partner_id, p_reference, p_description, p_amount, v_number, 'CASH'
    ) RETURNING id INTO v_payment_id;

    -- 4. Create Journal Entry Header
    INSERT INTO journal_entries (
        transaction_date, reference, description, status
    ) VALUES (
        p_date, p_reference, p_description, 'POSTED'
    ) RETURNING id INTO v_journal_id;

    -- 5. Post Bank Entry
    IF p_type = 'PAYMENT' THEN
        -- Credit Bank (Asset decreases)
        INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, description)
        VALUES (v_journal_id, v_bank_gl_account_id, 0, p_amount, 'Payment: ' || COALESCE(p_description, ''));
    ELSE
        -- Debit Bank (Asset increases)
        INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, description)
        VALUES (v_journal_id, v_bank_gl_account_id, p_amount, 0, 'Receipt: ' || COALESCE(p_description, ''));
    END IF;

    -- 6. Post Line Entries
    FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines) LOOP
        IF p_type = 'PAYMENT' THEN
            -- Debit Expenses/Payables (Contra to Bank Credit)
            INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, description)
            VALUES (
                v_journal_id, 
                (v_line->>'account_id')::UUID, 
                (v_line->>'amount')::DECIMAL, 
                0, 
                COALESCE(v_line->>'description', p_description)
            );
        ELSE
            -- Credit Revenues/Receivables (Contra to Bank Debit)
            INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, description)
            VALUES (
                v_journal_id, 
                (v_line->>'account_id')::UUID, 
                0, 
                (v_line->>'amount')::DECIMAL, 
                COALESCE(v_line->>'description', p_description)
            );
        END IF;
    END LOOP;

    -- 7. Link Journal to Payment
    UPDATE payments SET journal_entry_id = v_journal_id WHERE id = v_payment_id;

    RETURN jsonb_build_object('success', true, 'payment_id', v_payment_id);
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;
