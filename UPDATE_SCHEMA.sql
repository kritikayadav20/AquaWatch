-- Create Notifications Table
create table if not exists notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Init RLS
alter table notifications enable row level security;

-- Policies for Notifications
create policy "Users can view own notifications" on notifications
  for select using (auth.uid() = user_id);

-- Explicitly allow authenticated users (including Admins) to insert notifications 
-- (Use with caution in prod, but fine for enabling Admin client-side logic here)
create policy "Authenticated users can insert notifications" on notifications
  for insert with check (auth.role() = 'authenticated');

-- Ensure Admin Update Policy is robust (Just in case the previous one was missed or flawed)
-- Drop old one if exists to avoid conflicts or just create new one
drop policy if exists "Admins can update any profile" on profiles;
create policy "Admins can update any profile" on profiles
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
