-- ============================================================================
-- Phase 1 migration: account balances + updated_at triggers
-- Depends on 20240101000000_initial_schema.sql
-- ============================================================================

-- Reusable updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Attach updated_at triggers to existing tables that have the column
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

-- ----------------------------------------------------------------------------
-- Balances table: tracks a user's spendable (available) cash.
-- Vault deposits and stakes are tracked in their own tables; this is the
-- liquid wallet used for funding and withdrawals.
-- ----------------------------------------------------------------------------
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

-- Auto-create a zero balance row when a profile is created
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

-- ----------------------------------------------------------------------------
-- Atomic balance adjustment with validation.
-- amount > 0 credits, amount < 0 debits. Debits fail if insufficient funds.
-- ----------------------------------------------------------------------------
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
