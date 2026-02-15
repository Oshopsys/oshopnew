-- Update Accounting Core Logic (Verified Final Version)
-- This script fixes COGS calculation and Account selection for Purchase/Sale approval.

-- 1. Helper Function to Get Account ID by Name
CREATE OR REPLACE FUNCTION get_account_id_by_name(p_name TEXT)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM chart_of_accounts WHERE name = p_name LIMIT 1;
    IF v_id IS NULL THEN
        RAISE EXCEPTION 'Account % not found', p_name;
    END IF;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Updated Approve Invoice RPC
CREATE OR REPLACE FUNCTION approve_invoice_rpc(p_invoice_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_invoice RECORD;
    v_line RECORD;
    v_journal_id UUID;
    v_ar_account UUID;
    v_ap_account UUID;
    v_sales_account UUID;
    v_inventory_account UUID;
    v_cogs_account UUID;
    v_expense_account UUID;
    v_total_amount DECIMAL(15, 2) := 0;
    v_total_cogs DECIMAL(15, 2) := 0;
    v_total_inventory_value DECIMAL(15, 2) := 0;
    v_total_expense_value DECIMAL(15, 2) := 0;
    v_item_cost DECIMAL(15, 2);
    v_invoice_type TEXT;
BEGIN
    -- Get Invoice Details
    SELECT * INTO v_invoice FROM invoices WHERE id = p_invoice_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invoice not found');
    END IF;

    IF v_invoice.status = 'POSTED' OR v_invoice.status = 'PAID' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invoice already approved');
    END IF;

    v_invoice_type := v_invoice.type;

    -- Standard Account Lookups
    v_ar_account := get_account_id_by_name('Accounts Receivable');
    v_ap_account := get_account_id_by_name('Accounts Payable');
    v_sales_account := get_account_id_by_name('Sales Revenue');
    v_inventory_account := get_account_id_by_name('Inventory Asset');
    v_cogs_account := get_account_id_by_name('Cost of Goods Sold');
    
    -- Use COGS as fallback if Operating Expenses is missing
    BEGIN
        v_expense_account := get_account_id_by_name('Operating Expenses');
    EXCEPTION WHEN OTHERS THEN
        v_expense_account := v_cogs_account;
    END;

    -- Create Journal Entry Header
    INSERT INTO journal_entries (
        transaction_date, 
        reference, 
        description, 
        status, 
        created_by
    ) VALUES (
        v_invoice.date, 
        v_invoice.invoice_number, 
        v_invoice.type || ' Invoice Approval: ' || v_invoice.invoice_number, 
        'POSTED',
        NULL -- created_by might be missing in RECORD if not selected, but standard SELECT * includes it. null is safe fallback.
    ) 
    RETURNING id INTO v_journal_id;

    -- Process Lines
    FOR v_line IN 
        SELECT il.*, ii.type as item_type, ii.cost_price as item_cost_price 
        FROM invoice_lines il 
        JOIN inventory_items ii ON il.item_id = ii.id 
        WHERE il.invoice_id = p_invoice_id 
    LOOP
        
        IF v_invoice_type = 'SALE' THEN
            -- Inventory Logic: Deduct from Inventory, Add to COGS (only for PRODUCT)
            IF v_line.item_type = 'PRODUCT' THEN
                v_item_cost := COALESCE(v_line.item_cost_price, 0);
                v_total_cogs := v_total_cogs + (v_item_cost * v_line.quantity);
                
                -- Update Inventory Quantity
                UPDATE inventory_items 
                SET quantity_on_hand = COALESCE(quantity_on_hand, 0) - v_line.quantity 
                WHERE id = v_line.item_id;
            END IF;
            -- Accumulate Total Sales Amount
            v_total_amount := v_total_amount + v_line.total;

        ELSIF v_invoice_type = 'PURCHASE' THEN
            -- Purchase Logic: Add to Inventory (PRODUCT) or Expense (SERVICE)
            IF v_line.item_type = 'PRODUCT' THEN
                v_total_inventory_value := v_total_inventory_value + v_line.total;
                
                -- Update Inventory Quantity and Cost
                UPDATE inventory_items 
                SET quantity_on_hand = COALESCE(quantity_on_hand, 0) + v_line.quantity,
                    cost_price = v_line.unit_price -- Updating cost to latest purchase price
                WHERE id = v_line.item_id;
            ELSE
                v_total_expense_value := v_total_expense_value + v_line.total;
            END IF;
            -- Accumulate Total Payable Amount
            v_total_amount := v_total_amount + v_line.total;
        END IF;
    END LOOP;

    -- Final Journal Posting
    IF v_invoice_type = 'SALE' THEN
        -- Debit AR (Total)
        INSERT INTO journal_entry_lines (entry_id, account_id, description, debit, credit)
        VALUES (v_journal_id, v_ar_account, 'Receivable for Invoice ' || v_invoice.invoice_number, v_total_amount, 0);
        
        -- Credit Sales Revenue (Total)
        INSERT INTO journal_entry_lines (entry_id, account_id, description, debit, credit)
        VALUES (v_journal_id, v_sales_account, 'Sales Revenue for Invoice ' || v_invoice.invoice_number, 0, v_total_amount);

        -- COGS Entry (if any)
        IF v_total_cogs > 0 THEN
            INSERT INTO journal_entry_lines (entry_id, account_id, description, debit, credit)
            VALUES (v_journal_id, v_cogs_account, 'COGS for Invoice ' || v_invoice.invoice_number, v_total_cogs, 0);
            
            INSERT INTO journal_entry_lines (entry_id, account_id, description, debit, credit)
            VALUES (v_journal_id, v_inventory_account, 'Inventory reduction for Invoice ' || v_invoice.invoice_number, 0, v_total_cogs);
        END IF;

    ELSIF v_invoice_type = 'PURCHASE' THEN
        -- Credit AP (Total)
        INSERT INTO journal_entry_lines (entry_id, account_id, description, debit, credit)
        VALUES (v_journal_id, v_ap_account, 'Payable for Invoice ' || v_invoice.invoice_number, 0, v_total_amount);

        -- Debit Inventory Asset (for Products)
        IF v_total_inventory_value > 0 THEN
            INSERT INTO journal_entry_lines (entry_id, account_id, description, debit, credit)
            VALUES (v_journal_id, v_inventory_account, 'Inventory Purchase for Invoice ' || v_invoice.invoice_number, v_total_inventory_value, 0);
        END IF;

        -- Debit Expense (for Services)
        IF v_total_expense_value > 0 THEN
            INSERT INTO journal_entry_lines (entry_id, account_id, description, debit, credit)
            VALUES (v_journal_id, v_expense_account, 'Expense for Invoice ' || v_invoice.invoice_number, v_total_expense_value, 0);
        END IF;
    END IF;

    -- Update Invoice Status
    UPDATE invoices SET status = 'POSTED' WHERE id = p_invoice_id;

    RETURN jsonb_build_object('success', true, 'journal_id', v_journal_id);

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error in approve_invoice_rpc: %', SQLERRM;
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;
