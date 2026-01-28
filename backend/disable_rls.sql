-- Disable RLS for all tables in the project for development ease
-- WARNING: This exposes all data to any authenticated (or sometimes unauthenticated) user. 
-- Do not use in production.

alter table profiles disable row level security;
alter table submissions disable row level security;
alter table coupon_codes disable row level security;
alter table parks_gardens disable row level security;
alter table park_tickets disable row level security;

-- Verify
-- select tablename, rowsecurity from pg_tables where schemaname = 'public';
