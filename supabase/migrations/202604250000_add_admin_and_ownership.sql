-- admin_users table: membership is checked via is_admin() — never queried directly by the client
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users on delete cascade,
  created_at timestamptz not null default now()
);

revoke all on table public.admin_users from anon, authenticated;

-- is_admin(): stable, security-definer wrapper so the client never touches admin_users directly
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, supabase_auth_admin;

-- Add ownership column to internship_experiences
alter table public.internship_experiences
  add column if not exists user_id uuid references auth.users on delete set null;

-- Replace the existing insert policy to require the row's user_id matches the caller
drop policy if exists "Institutional insert access for internship experiences" on public.internship_experiences;
create policy "Institutional insert access for internship experiences"
  on public.internship_experiences
  for insert
  to authenticated
  with check (
    public.requesting_user_has_allowed_email()
    and user_id = auth.uid()
  );

-- Allow owners and admins to delete experience entries
drop policy if exists "Owner or admin delete access for internship experiences" on public.internship_experiences;
create policy "Owner or admin delete access for internship experiences"
  on public.internship_experiences
  for delete
  to authenticated
  using (
    auth.uid() = user_id
    or public.is_admin()
  );

-- Admin UPDATE and DELETE on contacts
drop policy if exists "Admin update access for contacts" on public.contacts;
create policy "Admin update access for contacts"
  on public.contacts
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin delete access for contacts" on public.contacts;
create policy "Admin delete access for contacts"
  on public.contacts
  for delete
  to authenticated
  using (public.is_admin());

-- Admin UPDATE and DELETE on internships
drop policy if exists "Admin update access for internships" on public.internships;
create policy "Admin update access for internships"
  on public.internships
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin delete access for internships" on public.internships;
create policy "Admin delete access for internships"
  on public.internships
  for delete
  to authenticated
  using (public.is_admin());
