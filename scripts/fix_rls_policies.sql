-- Enable RLS on journal_entry_lines to be safe
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;

-- Policy for DELETE on journal_entry_lines
DROP POLICY IF EXISTS "Enable delete access for all users" ON journal_entry_lines;
CREATE POLICY "Enable delete access for all users" ON journal_entry_lines
    FOR DELETE
    TO authenticated
    USING (true);

-- Policy for SELECT on journal_entry_lines
DROP POLICY IF EXISTS "Enable read access for all users" ON journal_entry_lines;
CREATE POLICY "Enable read access for all users" ON journal_entry_lines
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy for INSERT on journal_entry_lines
DROP POLICY IF EXISTS "Enable insert access for all users" ON journal_entry_lines;
CREATE POLICY "Enable insert access for all users" ON journal_entry_lines
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy for UPDATE on journal_entry_lines
DROP POLICY IF EXISTS "Enable update access for all users" ON journal_entry_lines;
CREATE POLICY "Enable update access for all users" ON journal_entry_lines
    FOR UPDATE
    TO authenticated
    USING (true);


-- Treasury Transactions (Just in case)
ALTER TABLE treasury_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable delete access for all users" ON treasury_transactions;
CREATE POLICY "Enable delete access for all users" ON treasury_transactions
    FOR DELETE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Enable update access for all users" ON treasury_transactions;
CREATE POLICY "Enable update access for all users" ON treasury_transactions
    FOR UPDATE
    TO authenticated
    USING (true);
