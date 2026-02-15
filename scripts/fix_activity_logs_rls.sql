-- Fix RLS policy for activity_logs to allow all reads
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- Or, if you want to keep RLS but allow all authenticated users to read
DROP POLICY IF EXISTS "Allow authenticated users to read logs" ON activity_logs;
CREATE POLICY "Allow all reads" ON activity_logs
    FOR SELECT USING (true);
