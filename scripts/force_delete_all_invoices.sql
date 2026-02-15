-- ============================================================================
-- FORCE DELETE ALL INVOICES (Fixing Trigger Issue)
-- ============================================================================

BEGIN;

-- 1. Fix the buggy trigger function first
-- The original function checked for 'PAID' which is not in the entry_status enum
CREATE OR REPLACE FUNCTION public.prevent_posted_modification()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Removed check for 'PAID' as it is not a valid enum value
    IF OLD.status = 'POSTED' THEN
        IF TG_OP = 'DELETE' THEN
            RAISE EXCEPTION 'Cannot delete a posted record. You must create a reversing entry.';
        ELSIF TG_OP = 'UPDATE' THEN
            RAISE EXCEPTION 'Cannot modify a posted record. You must create a reversing entry.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 2. Disable triggers temporarily to allow deletion of POSTED records
ALTER TABLE invoices DISABLE TRIGGER ALL;
ALTER TABLE journal_entries DISABLE TRIGGER ALL;
ALTER TABLE invoice_lines DISABLE TRIGGER ALL;
ALTER TABLE journal_entry_lines DISABLE TRIGGER ALL;

-- 3. Perform Deletion (Cascading order)

-- Delete all journal entry lines related to invoices (via reference)
DELETE FROM journal_entry_lines
WHERE entry_id IN (
    SELECT id FROM journal_entries 
    WHERE reference LIKE 'INV-%' 
       OR reference LIKE 'PINV-%' 
       OR reference LIKE 'TEST-%'
       OR reference IN (SELECT invoice_number FROM invoices)
);

-- Delete all journal entries related to invoices
DELETE FROM journal_entries
WHERE reference LIKE 'INV-%' 
   OR reference LIKE 'PINV-%' 
   OR reference LIKE 'TEST-%'
   OR reference IN (SELECT invoice_number FROM invoices);

-- Delete all invoice lines
DELETE FROM invoice_lines;

-- Delete all invoices
DELETE FROM invoices;

-- 4. Re-enable triggers
ALTER TABLE invoices ENABLE TRIGGER ALL;
ALTER TABLE journal_entries ENABLE TRIGGER ALL;
ALTER TABLE invoice_lines ENABLE TRIGGER ALL;
ALTER TABLE journal_entry_lines ENABLE TRIGGER ALL;

-- 5. Verify emptiness
SELECT 
    (SELECT COUNT(*) FROM invoices) as remaining_invoices,
    (SELECT COUNT(*) FROM invoice_lines) as remaining_invoice_lines,
    (SELECT COUNT(*) FROM journal_entries WHERE reference LIKE 'INV-%') as remaining_journal_entries;

COMMIT;
