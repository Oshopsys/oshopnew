CREATE OR REPLACE FUNCTION prevent_posted_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        IF OLD.status::text = 'POSTED' OR OLD.status::text = 'PAID' THEN
            RAISE EXCEPTION 'Cannot delete a posted record. You must create a reversing entry.';
        END IF;
        RETURN OLD; -- Crucial fix: Must return OLD to allow deletion. Returning NULL (NEW) skips it.
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status::text = 'POSTED' OR OLD.status::text = 'PAID' THEN
            RAISE EXCEPTION 'Cannot modify a posted record. You must create a reversing entry.';
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NEW;
END;
$$;
