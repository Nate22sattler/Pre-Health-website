drop policy if exists "Admin insert access for internships" on public.internships;

create policy "Admin insert access for internships"
  on public.internships
  for insert
  to authenticated
  with check (public.is_admin());
