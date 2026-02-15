-- Migration: Add entry_number column to journal_entries table
-- Date: 2026-02-15
-- Purpose: Fix financial reports that depend on entry_number field

-- 1. Add entry_number column
ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS entry_number VARCHAR(50);

-- 2. Create sequence for generating entry numbers
CREATE SEQUENCE IF NOT EXISTS journal_entry_number_seq START 1000;

-- 3. Update existing records with sequential numbers
UPDATE journal_entries
SET entry_number = 'JE-' || LPAD(nextval('journal_entry_number_seq')::TEXT, 6, '0')
WHERE entry_number IS NULL;

-- 4. Create function to auto-generate entry numbers
CREATE OR REPLACE FUNCTION generate_entry_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.entry_number IS NULL THEN
        NEW.entry_number := 'JE-' || LPAD(nextval('journal_entry_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to auto-set entry_number on insert
DROP TRIGGER IF EXISTS set_entry_number ON journal_entries;
CREATE TRIGGER set_entry_number
    BEFORE INSERT ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION generate_entry_number();

-- 6. Add NOT NULL constraint after populating existing records
ALTER TABLE journal_entries
ALTER COLUMN entry_number SET NOT NULL;

-- 7. Add unique constraint
ALTER TABLE journal_entries
ADD CONSTRAINT unique_entry_number UNIQUE (entry_number);

-- Verify
COMMENT ON COLUMN journal_entries.entry_number IS 'Unique journal entry number, auto-generated in format JE-XXXXXX';
