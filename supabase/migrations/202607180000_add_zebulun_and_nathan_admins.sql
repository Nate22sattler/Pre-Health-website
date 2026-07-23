-- Keep the admin allowlist consistent for existing users and future signups.
create or replace function public.apply_profile_defaults()
returns trigger
language plpgsql
as $$
declare
  normalized_email text;
begin
  normalized_email = lower(coalesce(new.email, ''));
  new.email = normalized_email;

  if normalized_email in (
    'nevan.miller23@sattler.edu',
    'zebulun.snodgrass23@sattler.edu',
    'nathan.ferguson25@sattler.edu'
  ) then
    new.role = 'admin';
    new.is_approved = true;
    return new;
  end if;

  if coalesce(new.role, '') = '' then
    if normalized_email like '%@sattler.edu' then
      new.role = 'student';
    else
      new.role = 'submitter';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if new.role in ('editor', 'admin') or normalized_email like '%@sattler.edu' then
      new.is_approved = true;
    else
      new.is_approved = coalesce(new.is_approved, false);
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text;
  is_allowlisted_admin boolean;
begin
  normalized_email = lower(coalesce(new.email, ''));
  is_allowlisted_admin = normalized_email in (
    'nevan.miller23@sattler.edu',
    'zebulun.snodgrass23@sattler.edu',
    'nathan.ferguson25@sattler.edu'
  );

  insert into public.profiles (id, email, full_name, role, is_approved)
  values (
    new.id,
    normalized_email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when is_allowlisted_admin then 'admin' else null end,
    is_allowlisted_admin
  )
  on conflict (id) do update
  set
    email = excluded.email,
    role = case when is_allowlisted_admin then 'admin' else public.profiles.role end,
    is_approved = case when is_allowlisted_admin then true else public.profiles.is_approved end;

  if is_allowlisted_admin then
    insert into public.admin_users (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

-- Apply access immediately for allowlisted users who have already signed up.
insert into public.admin_users (user_id)
select id
from auth.users
where lower(email) in (
  'nevan.miller23@sattler.edu',
  'zebulun.snodgrass23@sattler.edu',
  'nathan.ferguson25@sattler.edu'
)
on conflict (user_id) do nothing;

update public.profiles
set
  role = 'admin',
  is_approved = true
where lower(email) in (
  'nevan.miller23@sattler.edu',
  'zebulun.snodgrass23@sattler.edu',
  'nathan.ferguson25@sattler.edu'
);
