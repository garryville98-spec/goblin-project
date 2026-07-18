-- Add a role column to profiles to distinguish regular users from admins.
-- Defaults to 'user'. Promote an account to 'admin' via the Supabase dashboard
-- (set auth.users raw_user_meta_data -> role = 'admin' and profiles.role = 'admin'),
-- or in dev by setting the VITE_ADMIN_EMAIL env var (handled by the mock client).

alter table public.profiles
  add column if not exists role text not null default 'user';
