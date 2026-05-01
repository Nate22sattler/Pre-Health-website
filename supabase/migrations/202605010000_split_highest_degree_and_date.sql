alter table public.contacts
  add column if not exists highest_degree text,
  add column if not exists degree_obtained_date date;

alter table public.alumni_submissions
  add column if not exists highest_degree text,
  add column if not exists degree_obtained_date date;

alter table public.contacts
  drop constraint if exists contacts_highest_degree_check,
  add constraint contacts_highest_degree_check
    check (
      highest_degree is null
      or highest_degree in ('Associate', 'Bachelor''s', 'Master''s', 'Doctorate')
    );

alter table public.alumni_submissions
  drop constraint if exists alumni_submissions_highest_degree_check,
  add constraint alumni_submissions_highest_degree_check
    check (
      highest_degree is null
      or highest_degree in ('Associate', 'Bachelor''s', 'Master''s', 'Doctorate')
    );
