do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'name'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'full_name'
  ) then
    alter table public.contacts rename column name to full_name;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'field'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'field_of_work'
  ) then
    alter table public.contacts rename column field to field_of_work;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'role'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'current_title'
  ) then
    alter table public.contacts rename column role to current_title;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'organization'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'current_employer'
  ) then
    alter table public.contacts rename column organization to current_employer;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'preferred_contact'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'best_form_of_contact'
  ) then
    alter table public.contacts rename column preferred_contact to best_form_of_contact;
  end if;
end $$;

alter table public.contacts
  add column if not exists gender text,
  add column if not exists highest_degree_and_date text,
  add column if not exists previous_work text,
  add column if not exists willing_to_be_contacted boolean;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'topics'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'notes'
  ) then
    update public.contacts
    set previous_work = nullif(
        concat_ws(E'\n\n', nullif(previous_work, ''), nullif(topics, ''), nullif(notes, '')),
        ''
      )
    where previous_work is null or previous_work = '';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'topics'
  ) then
    update public.contacts
    set previous_work = nullif(concat_ws(E'\n\n', nullif(previous_work, ''), nullif(topics, '')), '')
    where previous_work is null or previous_work = '';
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'notes'
  ) then
    update public.contacts
    set previous_work = nullif(concat_ws(E'\n\n', nullif(previous_work, ''), nullif(notes, '')), '')
    where previous_work is null or previous_work = '';
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'mentoring_interest'
  ) then
    update public.contacts
    set willing_to_be_contacted = lower(coalesce(mentoring_interest, '')) in ('yes', 'y', 'true')
    where willing_to_be_contacted is null;
  end if;
end $$;

alter table public.contacts
  alter column field_of_work drop not null,
  alter column gender drop not null,
  alter column highest_degree_and_date drop not null,
  alter column previous_work drop not null,
  alter column willing_to_be_contacted drop not null;

update public.contacts
set field_of_work = null
where field_of_work is not null
  and field_of_work not in ('PT', 'MD', 'DDS', 'OT', 'PH', 'BSN', 'PA', 'Research');

alter table public.contacts
  drop column if exists connection_type,
  drop column if exists notes,
  drop column if exists topics,
  drop column if exists mentoring_interest;

alter table public.contacts
  drop constraint if exists contacts_field_of_work_check,
  add constraint contacts_field_of_work_check
    check (field_of_work is null or field_of_work in ('PT', 'MD', 'DDS', 'OT', 'PH', 'BSN', 'PA', 'Research'));
