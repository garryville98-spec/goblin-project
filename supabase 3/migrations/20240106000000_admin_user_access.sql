-- Allow admins to read all profiles so the admin panel can list
-- newly registered users. Regular users keep the existing "view own
-- profile" policy (auth.uid() = id) from the initial schema.

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );
