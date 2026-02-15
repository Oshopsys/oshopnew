-- Script to unpost a record manually
-- Use this in Supabase SQL Editor

-- 1. For Journal Entries:
UPDATE journal_entries 
SET status = 'DRAFT' 
WHERE id = 'YOUR_ENTRY_ID_HERE';

-- 2. For Invoices:
UPDATE invoices 
SET status = 'DRAFT' 
WHERE id = 'YOUR_INVOICE_ID_HERE';

-- 3. For Payments/Receipts:
UPDATE payments 
SET status = 'DRAFT' 
WHERE id = 'YOUR_PAYMENT_ID_HERE';

-- To find the ID of the record you want to unpost:
-- SELECT id, description, status FROM journal_entries ORDER BY created_at DESC LIMIT 10;
