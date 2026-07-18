-- Add a `tier` column to profiles so a user's activated tier (e.g. 'black',
-- 'gold', 'tier-one') can be persisted. New profiles default to the base tier.
alter table public.profiles
  add column if not exists tier text not null default 'black';

-- Keep the auto-created profile in sync (handle_new_user runs on signup).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, tier)
  values (new.id, new.raw_user_meta_data->>'name', new.email, 'black');
  return new;
end;
$$ language plpgsql security definer;
