-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, new.raw_user_meta_data->>'name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Deposits table
create table public.deposits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount decimal(15,2) not null,
  currency text not null default 'USD',
  vault_name text not null,
  apy decimal(5,2) not null,
  term_days integer not null,
  status text not null default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  matured_at timestamp with time zone
);

alter table public.deposits enable row level security;

create policy "Users can view own deposits"
  on public.deposits for select
  using (auth.uid() = user_id);

create policy "Users can create own deposits"
  on public.deposits for insert
  with check (auth.uid() = user_id);

-- Stakes table
create table public.stakes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  pool_name text not null,
  token text not null,
  amount decimal(15,2) not null,
  apy decimal(5,2) not null,
  lock_period text not null,
  status text not null default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unlocked_at timestamp with time zone
);

alter table public.stakes enable row level security;

create policy "Users can view own stakes"
  on public.stakes for select
  using (auth.uid() = user_id);

create policy "Users can create own stakes"
  on public.stakes for insert
  with check (auth.uid() = user_id);

-- Transactions table (for trades, deposits, withdrawals)
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null, -- 'deposit', 'withdrawal', 'trade_buy', 'trade_sell', 'stake', 'unstake'
  symbol text,
  amount decimal(15,2) not null,
  price decimal(15,2),
  total decimal(15,2) not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can create own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

-- Launchpad allocations table
create table public.launchpad_allocations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  project_name text not null,
  allocation_amount decimal(15,2) not null,
  token_amount decimal(15,2),
  status text not null default 'reserved',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.launchpad_allocations enable row level security;

create policy "Users can view own allocations"
  on public.launchpad_allocations for select
  using (auth.uid() = user_id);

create policy "Users can create own allocations"
  on public.launchpad_allocations for insert
  with check (auth.uid() = user_id);

-- Indexes for performance
create index idx_deposits_user_id on public.deposits(user_id);
create index idx_stakes_user_id on public.stakes(user_id);
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_allocations_user_id on public.launchpad_allocations(user_id);
