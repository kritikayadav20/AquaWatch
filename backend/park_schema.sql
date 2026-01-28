-- Create table for Parks & Gardens
create table if not exists parks_gardens (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  city text not null,
  state text not null,
  ticket_price int not null,
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create table for Park Tickets
create table if not exists park_tickets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  park_id uuid references parks_gardens(id) not null,
  coupon_code_id uuid references coupon_codes(id) not null unique,
  ticket_status text default 'valid' check (ticket_status in ('valid', 'used', 'cancelled')),
  issued_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table parks_gardens enable row level security;
alter table park_tickets enable row level security;

-- Parks are public read
create policy "Parks are viewable by everyone." on parks_gardens for select using (true);
create policy "Admins can update parks." on parks_gardens for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Tickets are private to user
create policy "Users can view their own tickets." on park_tickets for select using (auth.uid() = user_id);
create policy "Users can create tickets." on park_tickets for insert with check (auth.uid() = user_id);
create policy "Admins can view all tickets." on park_tickets for select using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
