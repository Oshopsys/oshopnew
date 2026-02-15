-- Add Missing Columns to Database Tables
-- This script adds any missing columns that are required by the application

-- 1. Add 'reference' column to invoices table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' 
        AND column_name = 'reference'
    ) THEN
        ALTER TABLE invoices ADD COLUMN reference TEXT;
        RAISE NOTICE 'Added reference column to invoices table';
    ELSE
        RAISE NOTICE 'reference column already exists in invoices table';
    END IF;
END $$;

-- 2. Verify and add 'description' column to invoices if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE invoices ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to invoices table';
    ELSE
        RAISE NOTICE 'description column already exists in invoices table';
    END IF;
END $$;

-- 3. Check all columns in invoices table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'invoices'
ORDER BY ordinal_position;
