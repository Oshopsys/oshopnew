-- ============================================================================
-- DELETE ALL INVOICES AND THEIR EFFECTS
-- ============================================================================
-- WARNING: This script will permanently delete ALL invoices (sales and purchase)
-- along with all related data (journal entries, invoice lines)
-- ============================================================================

BEGIN;

-- Step 1: Delete all journal entry lines related to invoices
DELETE FROM journal_entry_lines
WHERE entry_id IN (
    SELECT je.id 
    FROM journal_entries je
    INNER JOIN invoices i ON je.reference = i.invoice_number
);

-- Step 2: Delete all journal entries related to invoices
DELETE FROM journal_entries
WHERE reference IN (
    SELECT invoice_number FROM invoices
);

-- Step 3: Delete all invoice lines
DELETE FROM invoice_lines;

-- Step 4: Delete all invoices
DELETE FROM invoices;

-- Step 5: Verify deletions
SELECT 
    (SELECT COUNT(*) FROM invoices) as remaining_invoices,
    (SELECT COUNT(*) FROM invoice_lines) as remaining_invoice_lines,
    (SELECT COUNT(*) FROM journal_entries WHERE reference LIKE 'INV-%' OR reference LIKE 'PINV-%' OR reference LIKE 'TEST-%') as remaining_invoice_journal_entries;

COMMIT;

-- Note: If you want to rollback instead of commit, replace COMMIT with ROLLBACK
