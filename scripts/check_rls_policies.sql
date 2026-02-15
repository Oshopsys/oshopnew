-- Check if RLS is blocking deletes
-- First, try deleting without RPC (as authenticated user)
-- This will help us understand if RLS is the problem

-- Check RLS policies on invoices table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('invoices', 'invoice_lines', 'journal_entries', 'journal_entry_lines');

-- Try to manually delete the invoice to see what error we get
-- DELETE FROM invoices WHERE id = 'f03bbd7b-3a70-490e-b8fc-3e1ede6d0f1c';
