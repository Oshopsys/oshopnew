SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('invoices', 'invoice_lines', 'journal_entries', 'journal_entry_lines', 'treasury_transactions')
ORDER BY tablename, policyname;
