-- Add DELETE policies for tables that are missing them
-- Note: If policy already exists, drop it first or ignore the error

-- Enable DELETE for invoices table
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.invoices;
CREATE POLICY "Enable delete access for all users"
ON public.invoices
FOR DELETE
TO anon, authenticated
USING (true);

-- Enable DELETE for journal_entries table
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.journal_entries;
CREATE POLICY "Enable delete access for all users"
ON public.journal_entries
FOR DELETE
TO anon, authenticated
USING (true);

-- Enable DELETE for journal_entry_lines table
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.journal_entry_lines;
CREATE POLICY "Enable delete access for all users"
ON public.journal_entry_lines
FOR DELETE
TO anon, authenticated
USING (true);
