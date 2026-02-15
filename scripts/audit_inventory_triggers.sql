-- Check triggers on invoice_lines and other tables
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_table IN ('invoice_lines', 'inventory_items', 'inventory_transactions');

-- Get the source code for any function called by these triggers
SELECT 
    p.proname as function_name,
    p.prosrc as function_source
FROM pg_proc p
JOIN pg_trigger t ON t.tgfoid = p.oid
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('invoice_lines', 'inventory_items', 'inventory_transactions');
