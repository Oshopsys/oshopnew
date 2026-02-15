-- Check distinct types in inventory_items
SELECT DISTINCT type FROM inventory_items;

-- Check Chart of Accounts for relevant accounts
SELECT * FROM chart_of_accounts WHERE code IN ('1200', '1300', '2200', '4000', '5000');
