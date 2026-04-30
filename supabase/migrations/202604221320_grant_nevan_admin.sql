create or replace function public.apply_profile_defaults()
returns trigger
language plpgsql
as $$
declare
  normalized_email text;
begin
  normalized_email = lower(coalesce(new.email, ''));
  new.email = normalized_email;

  if normalized_email = 'nevan.miller23@sattler.edu' then
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
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text;
begin
  normalized_email = lower(coalesce(new.email, ''));

  insert into public.profiles (id, email, full_name, role, is_approved)
  values (
    new.id,
    normalized_email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when normalized_email = 'nevan.miller23@sattler.edu' then 'admin'
      else null
    end,
    case
      when normalized_email = 'nevan.miller23@sattler.edu' then true
      else false
    end
  )
  on conflict (id) do update
  set
    email = excluded.email,
    role = case
      when excluded.email = 'nevan.miller23@sattler.edu' then 'admin'
      else public.profiles.role
    end,
    is_approved = case
      when excluded.email = 'nevan.miller23@sattler.edu' then true
      else public.profiles.is_approved
    end;

  return new;
end;
$$;
insert into public.profiles (id, email, full_name, role, is_approved)
select
  id,
  lower(email),
  coalesce(raw_user_meta_data ->> 'full_name', ''),
  'admin',
  true
from auth.users
where lower(email) = 'nevan.miller23@sattler.edu'
on conflict (id) do update
set
  email = excluded.email,
  role = 'admin',
  is_approved = true;
