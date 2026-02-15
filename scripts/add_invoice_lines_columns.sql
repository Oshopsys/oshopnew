-- Add Missing Columns to invoice_lines table
-- This script adds the discount column and verifies all required columns

-- 1. Add 'discount' column to invoice_lines table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoice_lines' 
        AND column_name = 'discount'
    ) THEN
        ALTER TABLE invoice_lines ADD COLUMN discount NUMERIC DEFAULT 0;
        RAISE NOTICE 'Added discount column to invoice_lines table';
    ELSE
        RAISE NOTICE 'discount column already exists in invoice_lines table';
    END IF;
END $$;

-- 2. Check all columns in invoice_lines table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'invoice_lines'
ORDER BY ordinal_position;
