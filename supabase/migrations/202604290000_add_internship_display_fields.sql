alter table public.internships
  add column if not exists ideal_candidate text,
  add column if not exists opportunity_type text,
  add column if not exists deadline text,
  add column if not exists website text;

