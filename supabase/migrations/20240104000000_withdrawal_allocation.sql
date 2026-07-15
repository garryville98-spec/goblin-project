-- Add allocation_id to transactions so withdrawals can be funded from a
-- launchpad allocation when the user's available balance is insufficient.
alter table public.transactions
  add column if not exists allocation_id uuid references public.launchpad_allocations(id) on delete set null;

create index if not exists idx_transactions_allocation_id
  on public.transactions(allocation_id);
