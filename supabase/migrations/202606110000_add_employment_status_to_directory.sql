alter table public.contacts
  add column if not exists employment_status text,
  add column if not exists current_program_graduation_date date;

alter table public.alumni_submissions
  add column if not exists employment_status text,
  add column if not exists current_program_graduation_date date;

alter table public.contacts
  drop constraint if exists contacts_employment_status_check,
  add constraint contacts_employment_status_check
    check (
      employment_status is null
      or employment_status in ('Employed', 'Student')
    ),
  drop constraint if exists contacts_student_graduation_date_check,
  add constraint contacts_student_graduation_date_check
    check (
      employment_status = 'Student'
      or current_program_graduation_date is null
    );

alter table public.alumni_submissions
  drop constraint if exists alumni_submissions_employment_status_check,
  add constraint alumni_submissions_employment_status_check
    check (
      employment_status is null
      or employment_status in ('Employed', 'Student')
    ),
  drop constraint if exists alumni_submissions_student_graduation_date_check,
  add constraint alumni_submissions_student_graduation_date_check
    check (
      employment_status = 'Student'
      or current_program_graduation_date is null
    );
