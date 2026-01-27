-- 1. Create Notifications Table (if not exists)
create table if not exists notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. DISABLE Row Level Security for Development
-- This allows all CRUD operations for any user (Authenticated or Anon)
-- WARNING: Only use this for local development!

alter table profiles disable row level security;
alter table submissions disable row level security;
alter table notifications disable row level security;

-- NOTE: We are NOT disabling RLS on storage.objects as it often restricts permissions.
-- The default policies created in FINAL_SETUP.sql should handle uploads fine.
