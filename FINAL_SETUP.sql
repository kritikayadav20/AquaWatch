-- ==============================================================================
-- AquaWatch - Full Database Setup Script
-- Run this in your Supabase SQL Editor to setup all tables, policies, and storage.
-- ==============================================================================

-- 1. Enable Extensions
create extension if not exists "uuid-ossp";

-- 2. Create Tables & Policies (Profiles, Submissions)
--    Note: 'profiles' extends auth.users

-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  role text default 'citizen' check (role in ('citizen', 'admin')),
  wallet_balance int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Admin Policy for Profiles
create policy "Admins can update any profile" on profiles
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Create submissions table
create table if not exists submissions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  image_url text not null,
  latitude float,
  longitude float,
  coverage_percent float default 0,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'completed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table submissions enable row level security;

create policy "Users can view their own submissions." on submissions
  for select using (auth.uid() = user_id);

create policy "Admins can view all submissions." on submissions
  for select using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Users can create submissions." on submissions
  for insert with check (auth.uid() = user_id);

-- Admin Policy for Submissions
create policy "Admins can update any submission" on submissions
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 3. Triggers for User Signup

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'citizen');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Storage Setup
--    Bucket: 'uploads'

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'uploads' );

create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'uploads' and auth.role() = 'authenticated' );

-- ==============================================================================
-- Setup Complete
-- ==============================================================================
