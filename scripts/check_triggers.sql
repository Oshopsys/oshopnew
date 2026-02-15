-- List triggers on invoices table
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_orientation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'invoices';

-- We also want to see the function source for any triggers found.
-- Since the above only gives names, we'll need to join or look them up.
-- This query gets function names for triggers on invoices:
SELECT 
    tgname as trigger_name,
    proname as function_name,
    prosrc as function_source
FROM pg_trigger
JOIN pg_proc ON pg_trigger.tgfoid = pg_proc.oid
WHERE tgrelid = 'invoices'::regclass;
