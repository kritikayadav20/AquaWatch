-- Create a table for coupon codes
create table if not exists coupon_codes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  code text not null unique,
  points_used int not null,
  value_rupees int not null,
  status text default 'active' check (status in ('active', 'redeemed', 'expired')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  redeemed_at timestamp with time zone
);

-- Turn on Row Level Security
alter table coupon_codes enable row level security;

-- Policies for coupon_codes
create policy "Users can view their own coupons." on coupon_codes
  for select using (auth.uid() = user_id);

create policy "Users can create coupons." on coupon_codes
  for insert with check (auth.uid() = user_id);

-- Admins can view/update all (if we implement admin role checks strictly)
create policy "Admins can view all coupons." on coupon_codes
  for select using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Admins can update coupons." on coupon_codes
  for update using (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));
