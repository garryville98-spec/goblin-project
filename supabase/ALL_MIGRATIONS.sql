-- ============================================================================
-- COMBINED MIGRATIONS — run this ENTIRE file ONCE in the Supabase SQL Editor
-- (Supabase dashboard -> SQL Editor -> New query -> paste -> Run).
--
-- This concatenates, in order, every file in supabase/migrations/.
-- All statements are idempotent (create or replace / if not exists / drop ... if exists),
-- so re-running is safe and will not error.
--
-- After running, the following tables/functions/policies exist:
--   tables : profiles, deposits, stakes, transactions, launchpad_allocations, balances
--   columns: profiles.role, profiles.tier, transactions.allocation_id
--   functions: handle_new_user, handle_new_balance, handle_updated_at, adjust_balance
--   policies: per-table RLS + admin profile access
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 20240101000000_initial_schema.sql
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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

create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null,
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

create index idx_deposits_user_id on public.deposits(user_id);
create index idx_stakes_user_id on public.stakes(user_id);
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_allocations_user_id on public.launchpad_allocations(user_id);

-- ----------------------------------------------------------------------------
-- 20240102000000_balances_and_triggers.sql
-- ----------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at on public.deposits;
create trigger set_updated_at
  before update on public.deposits
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at on public.stakes;
create trigger set_updated_at
  before update on public.stakes
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at on public.transactions;
create trigger set_updated_at
  before update on public.transactions
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at on public.launchpad_allocations;
create trigger set_updated_at
  before update on public.launchpad_allocations
  for each row execute procedure public.handle_updated_at();

create table public.balances (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  available_balance decimal(15,2) not null default 0,
  currency text not null default 'USD',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.balances enable row level security;

create policy "Users can view own balance"
  on public.balances for select
  using (auth.uid() = user_id);

create policy "Users can update own balance"
  on public.balances for update
  using (auth.uid() = user_id);

create or replace function public.handle_new_balance()
returns trigger as $$
begin
  insert into public.balances (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute procedure public.handle_new_balance();

create or replace function public.adjust_balance(p_user_id uuid, p_amount decimal)
returns public.balances as $$
declare
  v_balance public.balances;
begin
  select * into v_balance
  from public.balances
  where user_id = p_user_id
  for update;

  if v_balance is null then
    raise exception 'Balance record not found for user %', p_user_id;
  end if;

  if v_balance.available_balance + p_amount < 0 then
    raise exception 'Insufficient funds';
  end if;

  update public.balances
  set available_balance = available_balance + p_amount,
      updated_at = timezone('utc'::text, now())
  where user_id = p_user_id
  returning * into v_balance;

  return v_balance;
end;
$$ language plpgsql security definer;

create index idx_balances_user_id on public.balances(user_id);

-- ----------------------------------------------------------------------------
-- 20240103000000_admin_role.sql
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists role text not null default 'user';

-- ----------------------------------------------------------------------------
-- 20240104000000_withdrawal_allocation.sql
-- ----------------------------------------------------------------------------
alter table public.transactions
  add column if not exists allocation_id uuid references public.launchpad_allocations(id) on delete set null;

create index if not exists idx_transactions_allocation_id
  on public.transactions(allocation_id);

-- ----------------------------------------------------------------------------
-- 20240105000000_gold_tier.sql
-- ----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists tier text not null default 'black';

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, tier)
  values (new.id, new.raw_user_meta_data->>'name', new.email, 'black');
  return new;
end;
$$ language plpgsql security definer;

-- ----------------------------------------------------------------------------
-- 20240106000000_admin_user_access.sql
-- ----------------------------------------------------------------------------
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );
