-- After applying this migration, enable the Supabase "Before User Created" hook
-- and point it to: pg-functions://postgres/public/hook_restrict_signup_by_email_domain

create table if not exists public.allowed_auth_email_domains (
  domain text primary key,
  created_at timestamptz not null default now()
);

insert into public.allowed_auth_email_domains (domain)
values ('sattler.edu')
on conflict (domain) do nothing;

create or replace function public.email_domain_is_allowed(target_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.allowed_auth_email_domains allowed_domain
    where lower(allowed_domain.domain) = lower(split_part(coalesce(target_email, ''), '@', 2))
  );
$$;

create or replace function public.requesting_user_has_allowed_email()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.role() = 'authenticated'
    and public.email_domain_is_allowed(auth.jwt() ->> 'email');
$$;

create or replace function public.hook_restrict_signup_by_email_domain(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  signup_email text;
begin
  signup_email := event->'user'->>'email';

  if signup_email is null or not public.email_domain_is_allowed(signup_email) then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Only @sattler.edu email addresses can access this site.'
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

revoke all on table public.allowed_auth_email_domains from anon, authenticated;

revoke execute on function public.email_domain_is_allowed(text) from public;
grant execute on function public.email_domain_is_allowed(text) to anon, authenticated, supabase_auth_admin;

revoke execute on function public.requesting_user_has_allowed_email() from public;
grant execute on function public.requesting_user_has_allowed_email() to anon, authenticated, supabase_auth_admin;

revoke execute on function public.hook_restrict_signup_by_email_domain(jsonb) from public, anon, authenticated;
grant execute on function public.hook_restrict_signup_by_email_domain(jsonb) to supabase_auth_admin;

drop policy if exists "Public read access for contacts" on public.contacts;
drop policy if exists "Institutional read access for contacts" on public.contacts;
create policy "Institutional read access for contacts"
  on public.contacts
  for select
  to authenticated
  using (public.requesting_user_has_allowed_email());

drop policy if exists "Public read access for internships" on public.internships;
drop policy if exists "Institutional read access for internships" on public.internships;
create policy "Institutional read access for internships"
  on public.internships
  for select
  to authenticated
  using (public.requesting_user_has_allowed_email());

drop policy if exists "Public read access for internship experiences" on public.internship_experiences;
drop policy if exists "Public insert access for internship experiences" on public.internship_experiences;
drop policy if exists "Public delete access for internship experiences" on public.internship_experiences;
drop policy if exists "Institutional read access for internship experiences" on public.internship_experiences;
drop policy if exists "Institutional insert access for internship experiences" on public.internship_experiences;
create policy "Institutional read access for internship experiences"
  on public.internship_experiences
  for select
  to authenticated
  using (public.requesting_user_has_allowed_email());

create policy "Institutional insert access for internship experiences"
  on public.internship_experiences
  for insert
  to authenticated
  with check (public.requesting_user_has_allowed_email());
