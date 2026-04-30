create extension if not exists pgcrypto;
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role text not null default 'submitter' check (role in ('student', 'submitter', 'editor', 'admin')),
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create or replace function public.apply_profile_defaults()
returns trigger
language plpgsql
as $$
declare
  normalized_email text;
begin
  normalized_email = lower(coalesce(new.email, ''));
  new.email = normalized_email;

  if coalesce(new.role, '') = '' then
    if normalized_email like '%@sattler.edu' then
      new.role = 'student';
    else
      new.role = 'submitter';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if new.role in ('editor', 'admin') then
      new.is_approved = true;
    elsif normalized_email like '%@sattler.edu' then
      new.is_approved = true;
    else
      new.is_approved = coalesce(new.is_approved, false);
    end if;
  end if;

  return new;
end;
$$;
drop trigger if exists apply_profile_defaults_before_write on public.profiles;
create trigger apply_profile_defaults_before_write
  before insert on public.profiles
  for each row
  execute function public.apply_profile_defaults();
create or replace function public.is_admin_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('editor', 'admin')
  );
$$;
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select role
      from public.profiles
      where id = auth.uid()
    ),
    'anonymous'
  );
$$;
create or replace function public.current_user_is_approved()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select is_approved
      from public.profiles
      where id = auth.uid()
    ),
    false
  );
$$;
create or replace function public.current_user_can_submit_directory()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_approved = true
      and role in ('submitter', 'editor', 'admin')
  );
$$;
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
as $$
begin
  if not public.is_admin_role() then
    new.email = old.email;
    new.role = old.role;
    new.is_approved = old.is_approved;
  end if;

  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists protect_profile_fields_before_update on public.profiles;
create trigger protect_profile_fields_before_update
  before update on public.profiles
  for each row
  execute function public.protect_profile_fields();
alter table public.contacts
  add column if not exists email text,
  add column if not exists organization text not null default '',
  add column if not exists topics text not null default '',
  add column if not exists preferred_contact text not null default '',
  add column if not exists mentoring_interest text not null default '',
  add column if not exists status text not null default 'approved' check (status in ('pending', 'approved', 'rejected', 'archived')),
  add column if not exists is_active boolean not null default true,
  add column if not exists archived_at timestamptz,
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_by uuid references auth.users(id);
update public.contacts
set
  organization = coalesce(organization, ''),
  topics = coalesce(topics, ''),
  preferred_contact = coalesce(preferred_contact, ''),
  mentoring_interest = coalesce(mentoring_interest, ''),
  status = 'approved',
  is_active = true
where true;
drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
  before update on public.contacts
  for each row
  execute function public.update_updated_at_column();
alter table public.internships
  add column if not exists status text not null default 'approved' check (status in ('pending', 'approved', 'rejected', 'archived')),
  add column if not exists is_active boolean not null default true,
  add column if not exists archived_at timestamptz,
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_by uuid references auth.users(id);
update public.internships
set
  status = 'approved',
  is_active = true
where true;
drop trigger if exists internships_set_updated_at on public.internships;
create trigger internships_set_updated_at
  before update on public.internships
  for each row
  execute function public.update_updated_at_column();
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  field text not null,
  role text not null,
  organization text not null default '',
  location text not null,
  connection_type text not null,
  topics text not null,
  notes text not null default '',
  preferred_contact text not null,
  mentoring_interest text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'archived')),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  approved_contact_id uuid references public.contacts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contact_submissions_status_idx
  on public.contact_submissions (status, created_at desc);
drop trigger if exists contact_submissions_set_updated_at on public.contact_submissions;
create trigger contact_submissions_set_updated_at
  before update on public.contact_submissions
  for each row
  execute function public.update_updated_at_column();
create or replace function public.protect_contact_submission_fields()
returns trigger
language plpgsql
as $$
begin
  if not public.is_admin_role() then
    new.submitted_by = auth.uid();
    new.status = 'pending';
    new.reviewed_at = null;
    new.reviewed_by = null;
    new.approved_contact_id = old.approved_contact_id;
  end if;

  return new;
end;
$$;
drop trigger if exists protect_contact_submission_fields_before_update on public.contact_submissions;
create trigger protect_contact_submission_fields_before_update
  before update on public.contact_submissions
  for each row
  execute function public.protect_contact_submission_fields();
create or replace function public.set_contact_submission_owner()
returns trigger
language plpgsql
as $$
begin
  if not public.is_admin_role() then
    new.submitted_by = auth.uid();
    new.status = 'pending';
    new.reviewed_at = null;
    new.reviewed_by = null;
    new.approved_contact_id = null;
  end if;

  return new;
end;
$$;
drop trigger if exists set_contact_submission_owner_before_insert on public.contact_submissions;
create trigger set_contact_submission_owner_before_insert
  before insert on public.contact_submissions
  for each row
  execute function public.set_contact_submission_owner();
alter table public.internship_experiences
  add column if not exists author_id uuid references auth.users(id) on delete set null;
alter table public.profiles enable row level security;
alter table public.contact_submissions enable row level security;
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id or public.is_admin_role());
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id or public.is_admin_role())
  with check (auth.uid() = id or public.is_admin_role());
drop policy if exists "Public read approved contacts" on public.contacts;
drop policy if exists "Public read access for contacts" on public.contacts;
create policy "Public read approved contacts"
  on public.contacts
  for select
  using (status = 'approved' and is_active = true and archived_at is null);
drop policy if exists "Admin manage contacts" on public.contacts;
create policy "Admin manage contacts"
  on public.contacts
  for all
  using (public.is_admin_role())
  with check (public.is_admin_role());
drop policy if exists "Public read approved internships" on public.internships;
drop policy if exists "Public read access for internships" on public.internships;
create policy "Public read approved internships"
  on public.internships
  for select
  using (status = 'approved' and is_active = true and archived_at is null);
drop policy if exists "Admin manage internships" on public.internships;
create policy "Admin manage internships"
  on public.internships
  for all
  using (public.is_admin_role())
  with check (public.is_admin_role());
drop policy if exists "Submitters create their own contact submissions" on public.contact_submissions;
create policy "Submitters create their own contact submissions"
  on public.contact_submissions
  for insert
  with check (
    auth.uid() = submitted_by
    and public.current_user_can_submit_directory()
  );
drop policy if exists "Submitters view their own contact submissions" on public.contact_submissions;
create policy "Submitters view their own contact submissions"
  on public.contact_submissions
  for select
  using (auth.uid() = submitted_by or public.is_admin_role());
drop policy if exists "Submitters update their own pending contact submissions" on public.contact_submissions;
create policy "Submitters update their own pending contact submissions"
  on public.contact_submissions
  for update
  using (
    public.is_admin_role()
    or (auth.uid() = submitted_by and status = 'pending')
  )
  with check (
    public.is_admin_role()
    or auth.uid() = submitted_by
  );
drop policy if exists "Admin manage contact submissions" on public.contact_submissions;
create policy "Admin manage contact submissions"
  on public.contact_submissions
  for delete
  using (public.is_admin_role());
drop policy if exists "Public read access for internship experiences" on public.internship_experiences;
create policy "Public read access for internship experiences"
  on public.internship_experiences
  for select
  using (true);
drop policy if exists "Public insert access for internship experiences" on public.internship_experiences;
drop policy if exists "Approved users insert internship experiences" on public.internship_experiences;
create policy "Approved users insert internship experiences"
  on public.internship_experiences
  for insert
  with check (
    auth.uid() = author_id
    and public.current_user_is_approved()
  );
drop policy if exists "Public delete access for internship experiences" on public.internship_experiences;
drop policy if exists "Admin delete internship experiences" on public.internship_experiences;
create policy "Admin delete internship experiences"
  on public.internship_experiences
  for delete
  using (public.is_admin_role());
