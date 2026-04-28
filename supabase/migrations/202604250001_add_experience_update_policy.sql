-- Allow owners and admins to update their own internship experience entries.
-- Without this policy, RLS blocks all UPDATE operations on this table (deny-by-default),
-- which causes the edit-note feature in the UI to silently fail.
drop policy if exists "Owner or admin update access for internship experiences" on public.internship_experiences;
create policy "Owner or admin update access for internship experiences"
  on public.internship_experiences
  for update
  to authenticated
  using (
    auth.uid() = user_id
    or public.is_admin()
  )
  with check (
    auth.uid() = user_id
    or public.is_admin()
  );
