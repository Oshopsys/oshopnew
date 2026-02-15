const fs = require('fs');
const path = require('path');

const projectRef = 'mzkrcbbatnzzfcbrtjot';
const token = 'sbp_v0_04f8e627b739955c274bc9a449bf444c07a09be8';

async function runSql() {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../security_policies.sql');
    // Using absolute path just in case, or relative to script
    // But since I don't know where the file is relative to execution, I'll try to find it.
    // The previous prompt context says it's at /Users/zaki/.gemini/antigravity/brain/c37ef11b-dc37-4961-93b2-8ce2adb3bc73/security_policies.sql
    // But I should probably read from the brain artifact.
    // However, I can just hardcode the SQL content here for reliability since I know what it is.

    const sql = `
-- 1. Enable RLS on Core Accounting Tables
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;

-- 2. Add Basic Authenticated Access Policies (UPDATED for Idempotency)

-- Chart of Accounts
DROP POLICY IF EXISTS "Auth Read" ON chart_of_accounts;
CREATE POLICY "Auth Read" ON chart_of_accounts FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "Auth Write" ON chart_of_accounts;
CREATE POLICY "Auth Write" ON chart_of_accounts FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- Journal Entries
DROP POLICY IF EXISTS "Auth Read" ON journal_entries;
CREATE POLICY "Auth Read" ON journal_entries FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "Auth Write" ON journal_entries;
CREATE POLICY "Auth Write" ON journal_entries FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- Journal Entry Lines
DROP POLICY IF EXISTS "Auth Read" ON journal_entry_lines;
CREATE POLICY "Auth Read" ON journal_entry_lines FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "Auth Write" ON journal_entry_lines;
CREATE POLICY "Auth Write" ON journal_entry_lines FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
`;

    console.log('Applying SQL to project:', projectRef);

    try {
        const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query: sql })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Failed to apply SQL:', response.status, text);
            return;
        }

        const data = await response.json();
        console.log('SQL Applied Successfully!');
        console.log('Response:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error executing request:', error);
    }
}

runSql();
