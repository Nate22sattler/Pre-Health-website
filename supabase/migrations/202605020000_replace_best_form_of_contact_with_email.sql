alter table public.alumni_submissions
  add column if not exists email text;

alter table public.contacts
  add column if not exists email text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'alumni_submissions'
      and column_name = 'best_form_of_contact'
  ) then
    update public.alumni_submissions
    set email = best_form_of_contact
    where email is null
      and best_form_of_contact ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contacts'
      and column_name = 'best_form_of_contact'
  ) then
    update public.contacts
    set email = best_form_of_contact
    where email is null
      and best_form_of_contact ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$';
  end if;
end $$;

alter table public.alumni_submissions
  drop constraint if exists alumni_submissions_email_format_check,
  add constraint alumni_submissions_email_format_check
    check (
      email is null
      or email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    );

alter table public.contacts
  drop constraint if exists contacts_email_format_check,
  add constraint contacts_email_format_check
    check (
      email is null
      or email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    );

alter table public.alumni_submissions
  drop column if exists best_form_of_contact;

alter table public.contacts
  drop column if exists best_form_of_contact;
