-- First, get an invoice ID to test with
SELECT id, invoice_number, status 
FROM invoices 
WHERE status = 'DRAFT' 
LIMIT 1;

-- Copy the 'id' value from the result above, then test the delete function:
-- SELECT delete_invoice_rpc('PASTE_THE_ID_HERE');

-- Example (replace with actual ID from query above):
-- SELECT delete_invoice_rpc('a1b2c3d4-1234-5678-90ab-cdef12345678');
