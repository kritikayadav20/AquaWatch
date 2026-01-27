-- Fix the check constraint on the submissions table
-- This ensures that 'accepted', 'rejected', and 'completed' are definitely allowed.

alter table submissions drop constraint if exists submissions_status_check;

alter table submissions 
  add constraint submissions_status_check 
  check (status in ('pending', 'accepted', 'rejected', 'completed'));

-- Just in case, let's make sure the status column is text
alter table submissions alter column status type text;
