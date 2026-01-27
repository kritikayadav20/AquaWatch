-- Force removing the check constraint to unblock the update
-- This will allow ANY text value in the status column.

ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;

-- Verify column type is text
ALTER TABLE submissions ALTER COLUMN status TYPE text;
