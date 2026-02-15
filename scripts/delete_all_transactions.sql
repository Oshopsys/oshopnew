-- ============================================================================
-- FULL SYSTEM CLEANUP: Delete ALL Transactions (Invoices, Receipts, Payments, Journals)
-- ============================================================================

BEGIN;

-- 1. Set replication role to replica to bypass all triggers (including foreign keys checks if needed, but mostly for our custom triggers)
SET session_replication_role = 'replica';

-- 2. Delete from all financial and transaction tables
-- Order doesn't matter much with triggers disabled, but logical order is nice.

-- Journal Entries (The glue)
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;

-- Invoices (Sales & Purchase)
DELETE FROM invoice_lines;
DELETE FROM invoices;

-- Treasury (Receipts & Payments)
DELETE FROM receipts;
DELETE FROM payments;

-- Inventory Transactions (Optional but recommended for full clean)
-- We check if the table exists first to avoid errors if the module isn't active
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory_transactions') THEN 
        DELETE FROM inventory_transactions; 
    END IF; 
END $$;

-- 3. Reset replication role to origin (re-enable triggers)
SET session_replication_role = 'origin';

-- 4. Verify Emptiness
SELECT 
    (SELECT COUNT(*) FROM invoices) as invoices_count,
    (SELECT COUNT(*) FROM receipts) as receipts_count,
    (SELECT COUNT(*) FROM payments) as payments_count,
    (SELECT COUNT(*) FROM journal_entries) as journal_entries_count;

COMMIT;
