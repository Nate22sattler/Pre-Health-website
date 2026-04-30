create table if not exists public.alumni_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  gender text,
  field_of_work text,
  highest_degree_and_date text,
  current_title text not null,
  current_employer text not null,
  previous_work text,
  willing_to_be_contacted boolean not null,
  best_form_of_contact text not null,
  location text not null,
  consent_to_share boolean not null default false,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users on delete set null,
  constraint alumni_submissions_status_check
    check (status in ('pending', 'approved', 'rejected')),
  constraint alumni_submissions_field_of_work_check
    check (field_of_work is null or field_of_work in ('PT', 'MD', 'DDS', 'OT', 'PH', 'BSN', 'PA', 'Research'))
);

alter table public.alumni_submissions enable row level security;

drop policy if exists "Public insert access for alumni submissions" on public.alumni_submissions;
create policy "Public insert access for alumni submissions"
  on public.alumni_submissions
  for insert
  to anon, authenticated
  with check (
    consent_to_share = true
    and status = 'pending'
    and reviewed_at is null
    and reviewed_by is null
  );

drop policy if exists "Admin read access for alumni submissions" on public.alumni_submissions;
create policy "Admin read access for alumni submissions"
  on public.alumni_submissions
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin update access for alumni submissions" on public.alumni_submissions;
create policy "Admin update access for alumni submissions"
  on public.alumni_submissions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin insert access for contacts" on public.contacts;
create policy "Admin insert access for contacts"
  on public.contacts
  for insert
  to authenticated
  with check (public.is_admin());
