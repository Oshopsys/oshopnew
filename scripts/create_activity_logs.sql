-- Activity Logs System - Database Migration
-- This creates the activity_logs table and trigger functions for audit trail

-- Step 1: Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL, -- 'inventory_item', 'bank_account', 'employee', 'partner'
    entity_id UUID NOT NULL,
    entity_name TEXT, -- Display name for the entity
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    old_values JSONB, -- Old values (for UPDATE and DELETE)
    new_values JSONB, -- New values (for CREATE and UPDATE)
    user_id UUID, -- Who performed the action (optional for now)
    user_name TEXT, -- User's display name
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- Step 3: Enable RLS (optional, can be configured later)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read logs
CREATE POLICY "Allow authenticated users to read logs" ON activity_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- Step 4: Create trigger function for inventory_items
CREATE OR REPLACE FUNCTION log_inventory_item_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO activity_logs (entity_type, entity_id, entity_name, action, new_values)
        VALUES ('inventory_item', NEW.id, NEW.name, 'CREATE', row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO activity_logs (entity_type, entity_id, entity_name, action, old_values, new_values)
        VALUES ('inventory_item', NEW.id, NEW.name, 'UPDATE', 
                row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO activity_logs (entity_type, entity_id, entity_name, action, old_values)
        VALUES ('inventory_item', OLD.id, OLD.name, 'DELETE', row_to_json(OLD)::jsonb);
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger function for bank_accounts
CREATE OR REPLACE FUNCTION log_bank_account_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO activity_logs (entity_type, entity_id, entity_name, action, new_values)
        VALUES ('bank_account', NEW.id, NEW.name, 'CREATE', row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO activity_logs (entity_type, entity_id, entity_name, action, old_values, new_values)
        VALUES ('bank_account', NEW.id, NEW.name, 'UPDATE', 
                row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO activity_logs (entity_type, entity_id, entity_name, action, old_values)
        VALUES ('bank_account', OLD.id, OLD.name, 'DELETE', row_to_json(OLD)::jsonb);
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger function for employees
CREATE OR REPLACE FUNCTION log_employee_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO activity_logs (entity_type, entity_id, entity_name, action, new_values)
        VALUES ('employee', NEW.id, NEW.name, 'CREATE', row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO activity_logs (entity_type, entity_id, entity_name, action, old_values, new_values)
        VALUES ('employee', NEW.id, NEW.name, 'UPDATE', 
                row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO activity_logs (entity_type, entity_id, entity_name, action, old_values)
        VALUES ('employee', OLD.id, OLD.name, 'DELETE', row_to_json(OLD)::jsonb);
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create trigger function for partners
CREATE OR REPLACE FUNCTION log_partner_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO activity_logs (entity_type, entity_id, entity_name, action, new_values)
        VALUES ('partner', NEW.id, NEW.name, 'CREATE', row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO activity_logs (entity_type, entity_id, entity_name, action, old_values, new_values)
        VALUES ('partner', NEW.id, NEW.name, 'UPDATE', 
                row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO activity_logs (entity_type, entity_id, entity_name, action, old_values)
        VALUES ('partner', OLD.id, OLD.name, 'DELETE', row_to_json(OLD)::jsonb);
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Attach triggers to tables
DROP TRIGGER IF EXISTS inventory_item_audit ON inventory_items;
CREATE TRIGGER inventory_item_audit
AFTER INSERT OR UPDATE OR DELETE ON inventory_items
FOR EACH ROW EXECUTE FUNCTION log_inventory_item_changes();

DROP TRIGGER IF EXISTS bank_account_audit ON bank_accounts;
CREATE TRIGGER bank_account_audit
AFTER INSERT OR UPDATE OR DELETE ON bank_accounts
FOR EACH ROW EXECUTE FUNCTION log_bank_account_changes();

DROP TRIGGER IF EXISTS employee_audit ON employees;
CREATE TRIGGER employee_audit
AFTER INSERT OR UPDATE OR DELETE ON employees
FOR EACH ROW EXECUTE FUNCTION log_employee_changes();

DROP TRIGGER IF EXISTS partner_audit ON partners;
CREATE TRIGGER partner_audit
AFTER INSERT OR UPDATE OR DELETE ON partners
FOR EACH ROW EXECUTE FUNCTION log_partner_changes();

-- Verification query (optional - run after migration)
-- SELECT COUNT(*) as activity_logs_count FROM activity_logs;
