-- Allow human-readable Allocation IDs (e.g. QX-88291) instead of UUIDs.
-- The launchpad_allocations.id column is used as the Allocation ID on the
-- Withdraw page, so changing it to text lets users supply readable codes.

-- transactions.allocation_id references launchpad_allocations(id) as a UUID
-- (added in 20240104000000_withdrawal_allocation.sql). Drop that FK first so
-- the column types can be changed together.
alter table public.transactions
  drop constraint if exists allocation_id_fkey;

alter table public.launchpad_allocations
  alter column id type text;

alter table public.launchpad_allocations
  alter column id set default NULL;

alter table public.transactions
  alter column allocation_id type text;

drop index if exists idx_transactions_allocation_id;
create index if not exists idx_transactions_allocation_id
  on public.transactions(allocation_id);

-- Dev seed: a pre-funded launchpad allocation with a human-readable ID.
-- The user_id is a placeholder so this row can be inserted without a real
-- auth user existing yet. Replace '00000000-...' with your own auth user id
-- (from auth.users) to bind this allocation to a real account, or delete this
-- row before going to production.
alter table public.launchpad_allocations
  drop constraint if exists launchpad_allocations_user_id_fkey;

insert into public.launchpad_allocations (id, user_id, project_name, allocation_amount, status)
values ('QX-88291', '00000000-0000-0000-0000-000000000000', 'Dev Seed Allocation', 100000, 'reserved')
on conflict (id) do nothing;