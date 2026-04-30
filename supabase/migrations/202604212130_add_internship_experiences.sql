create table if not exists public.internship_experiences (
  id uuid primary key default gen_random_uuid(),
  internship_id uuid not null references public.internships(id) on delete cascade,
  author_name text not null,
  note text not null,
  created_at timestamptz not null default now()
);
create index if not exists internship_experiences_internship_created_at_idx
  on public.internship_experiences (internship_id, created_at desc);
alter table public.internship_experiences enable row level security;
drop policy if exists "Public read access for internship experiences" on public.internship_experiences;
create policy "Public read access for internship experiences"
  on public.internship_experiences
  for select
  using (true);
drop policy if exists "Public insert access for internship experiences" on public.internship_experiences;
create policy "Public insert access for internship experiences"
  on public.internship_experiences
  for insert
  with check (true);
drop policy if exists "Public delete access for internship experiences" on public.internship_experiences;
create policy "Public delete access for internship experiences"
  on public.internship_experiences
  for delete
  using (true);
