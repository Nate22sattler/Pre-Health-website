create extension if not exists pgcrypto;

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  field text not null,
  role text not null,
  location text not null,
  connection_type text not null,
  notes text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_name_role_key unique (name, role)
);

create table if not exists public.internships (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null,
  focus text not null,
  term text not null,
  location text not null,
  format text not null,
  application_window text not null,
  fit text not null,
  description text not null,
  next_step text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint internships_title_organization_key unique (title, organization)
);

create index if not exists contacts_field_idx on public.contacts (field);
create index if not exists internships_focus_idx on public.internships (focus);

alter table public.contacts enable row level security;
alter table public.internships enable row level security;

drop policy if exists "Public read access for contacts" on public.contacts;
create policy "Public read access for contacts"
  on public.contacts
  for select
  using (true);

drop policy if exists "Public read access for internships" on public.internships;
create policy "Public read access for internships"
  on public.internships
  for select
  using (true);

insert into public.contacts (name, field, role, location, connection_type, notes)
values
  (
    'Rachel Kim',
    'Medicine',
    'MS2, University of Rochester School of Medicine',
    'New York',
    'Medical school',
    'Happy to speak with pre-med students about gap years, applications, and interviews.'
  ),
  (
    'Daniel Owusu',
    'Physical Therapy',
    'Physical Therapist, Hartford HealthCare',
    'Connecticut',
    'Clinical career',
    'Can share what clinical rotations are like and how to compare PT programs.'
  ),
  (
    'Mia Hernandez',
    'Public Health',
    'Program Coordinator, Boston community health nonprofit',
    'Massachusetts',
    'Public health',
    'Interested in mentoring students exploring community health and policy work.'
  ),
  (
    'Nathan Brooks',
    'Dentistry',
    'D1, Tufts University School of Dental Medicine',
    'Massachusetts',
    'Dental school',
    'Can answer questions about shadowing, DAT prep, and choosing between schools.'
  )
on conflict (name, role) do update
set
  field = excluded.field,
  location = excluded.location,
  connection_type = excluded.connection_type,
  notes = excluded.notes,
  updated_at = now();

insert into public.internships (
  title,
  organization,
  focus,
  term,
  location,
  format,
  application_window,
  fit,
  description,
  next_step
)
values
  (
    'Hospital Volunteer Internship',
    'Boston Medical Center',
    'Clinical exposure',
    'Summer',
    'Boston, MA',
    'In person',
    'January-March',
    'Pre-med and pre-PA students',
    'A structured placement that helps students observe patient-facing environments, build professionalism, and reflect on clinical calling.',
    'Prepare a short resume, ask for one reference, and be ready to explain why direct service matters to you.'
  ),
  (
    'Public Health Research Internship',
    'Massachusetts Department of Public Health',
    'Community health and policy',
    'Summer or semester',
    'Hybrid',
    'Hybrid',
    'February-April',
    'Public health, biology, and psychology students',
    'Students support outreach, data organization, and program evaluation while learning how prevention work happens beyond the clinic.',
    'Look for application prompts about communication, service, and interest in health equity before submitting.'
  ),
  (
    'Dental Shadowing Fellowship',
    'Worcester Family Dental',
    'Dental practice exposure',
    'Rolling placements',
    'Worcester, MA',
    'In person',
    'Year-round',
    'Students exploring dentistry',
    'A lighter-commitment opportunity designed for students who want to understand the pace, teamwork, and patient education side of dentistry.',
    'Reach out with a concise email, a brief introduction, and a few available dates for observation.'
  )
on conflict (title, organization) do update
set
  focus = excluded.focus,
  term = excluded.term,
  location = excluded.location,
  format = excluded.format,
  application_window = excluded.application_window,
  fit = excluded.fit,
  description = excluded.description,
  next_step = excluded.next_step,
  updated_at = now();
