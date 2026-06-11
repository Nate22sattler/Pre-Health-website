alter table public.contacts
  add column if not exists bio text,
  add column if not exists willing_to_advise_in text[] not null default '{}',
  add column if not exists other_advising_area text;

alter table public.alumni_submissions
  add column if not exists bio text,
  add column if not exists willing_to_advise_in text[] not null default '{}',
  add column if not exists other_advising_area text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'previous_work'
  ) then
    update public.contacts
    set bio = previous_work
    where bio is null
      and previous_work is not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'alumni_submissions'
      and column_name = 'previous_work'
  ) then
    update public.alumni_submissions
    set bio = previous_work
    where bio is null
      and previous_work is not null;
  end if;
end $$;

alter table public.contacts
  drop constraint if exists contacts_willing_to_advise_in_check,
  add constraint contacts_willing_to_advise_in_check
    check (
      willing_to_advise_in <@ array[
        'MCAT/GRE Prep',
        'Graduate or professional school applications',
        'Research',
        'General career questions',
        'Other'
      ]::text[]
    );

alter table public.alumni_submissions
  drop constraint if exists alumni_submissions_willing_to_advise_in_check,
  add constraint alumni_submissions_willing_to_advise_in_check
    check (
      willing_to_advise_in <@ array[
        'MCAT/GRE Prep',
        'Graduate or professional school applications',
        'Research',
        'General career questions',
        'Other'
      ]::text[]
    );
