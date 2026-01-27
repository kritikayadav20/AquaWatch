-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create a table for public profiles (extends auth.users)
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  role text default 'citizen' check (role in ('citizen', 'admin')),
  wallet_balance int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table profiles enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for submissions
create table submissions (
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

-- Turn on RLS for submissions
alter table submissions enable row level security;

-- Policies for submissions
create policy "Users can view their own submissions." on submissions
  for select using (auth.uid() = user_id);

create policy "Admins can view all submissions." on submissions
  for select using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Users can create submissions." on submissions
  for insert with check (auth.uid() = user_id);

-- Function to handle new user creation automatically (optional but recommended)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'citizen');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
