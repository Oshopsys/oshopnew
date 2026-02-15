-- Fix for validate_journal_entry_balance trigger
-- Problem: The trigger referenced 'TRASHED' status which doesn't exist in entry_status enum
-- Solution: Remove invalid check and allow status changes from POSTED to DRAFT

CREATE OR REPLACE FUNCTION validate_journal_entry_balance()
RETURNS TRIGGER AS $$
DECLARE
    total_debit DECIMAL;
    total_credit DECIMAL;
BEGIN
    -- Only check balance when status is becoming POSTED
    IF NEW.status = 'POSTED' AND (OLD.status IS NULL OR OLD.status != 'POSTED') THEN
        SELECT SUM(debit), SUM(credit)
        INTO total_debit, total_credit
        FROM journal_entry_lines
        WHERE entry_id = NEW.id;

        IF total_debit != total_credit THEN
            RAISE EXCEPTION 'Accounting Error: Journal Entry is not balanced.';
        END IF;
        
        -- Lock the entry by setting posted_at
        NEW.posted_at = NOW();
    END IF;
    
    -- Prevent editing if already POSTED (but allow changing status FROM posted TO draft)
    IF OLD.status = 'POSTED' AND NEW.status = OLD.status THEN 
         RAISE EXCEPTION 'Security Alert: Cannot modify a POSTED journal entry.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
