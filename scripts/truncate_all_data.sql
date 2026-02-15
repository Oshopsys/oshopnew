-- Comprehensive cleanup script for all test data
-- Run this in Supabase SQL Editor

-- Step 1: Truncate all transaction tables (CASCADE will handle foreign keys)
TRUNCATE TABLE 
    journal_entry_lines,
    journal_entries,
    invoice_lines,
    invoices,
    receipt_lines,
    receipts,
    payment_lines,
    payments,
    inventory_transactions,
    inventory_layers
CASCADE;

-- Verification queries (optional - run after the above)
-- SELECT COUNT(*) as journal_entries_count FROM journal_entries;
-- SELECT COUNT(*) as invoices_count FROM invoices;
-- SELECT COUNT(*) as receipts_count FROM receipts;
-- SELECT COUNT(*) as payments_count FROM payments;
-- SELECT COUNT(*) as inventory_transactions_count FROM inventory_transactions;
