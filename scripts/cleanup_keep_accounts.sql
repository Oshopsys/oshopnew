-- Comprehensive Data Cleanup - Keep Only Chart of Accounts
-- This script removes all transactional data while preserving the chart of accounts

-- Step 1: Delete all activity logs
TRUNCATE TABLE activity_logs CASCADE;

-- Step 2: Delete journal entries and lines
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;

-- Step 3: Delete inventory transactions and layers
DELETE FROM inventory_transactions;
DELETE FROM inventory_layers;

-- Step 4: Delete invoice lines and invoices
DELETE FROM invoice_lines;
DELETE FROM invoices;

-- Step 5: Delete receipt lines and receipts
DELETE FROM receipt_lines;
DELETE FROM receipts;

-- Step 6: Delete payment lines and payments
DELETE FROM payment_lines;
DELETE FROM payments;

-- Step 7: Delete transfers
DELETE FROM inter_account_transfers;

-- Step 8: Delete inventory items
DELETE FROM inventory_items;

-- Step 9: Delete partners (customers and suppliers)
DELETE FROM partners;

-- Step 10: Delete bank accounts
DELETE FROM bank_accounts;

-- Step 11: Delete employees
DELETE FROM employees;

-- Step 12: Keep ONLY the chart of accounts (accounts table remains untouched)

-- Verification queries
SELECT 'Invoices' as table_name, COUNT(*) as count FROM invoices
UNION ALL
SELECT 'Journal Entries', COUNT(*) FROM journal_entries
UNION ALL
SELECT 'Receipts', COUNT(*) FROM receipts
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments
UNION ALL
SELECT 'Transfers', COUNT(*) FROM inter_account_transfers
UNION ALL
SELECT 'Inventory Items', COUNT(*) FROM inventory_items
UNION ALL
SELECT 'Partners', COUNT(*) FROM partners
UNION ALL
SELECT 'Bank Accounts', COUNT(*) FROM bank_accounts
UNION ALL
SELECT 'Employees', COUNT(*) FROM employees
UNION ALL
SELECT 'Accounts (Chart)', COUNT(*) FROM accounts
ORDER BY table_name;
