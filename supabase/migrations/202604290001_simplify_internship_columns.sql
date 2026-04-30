do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'internships'
      and column_name = 'title'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'internships'
      and column_name = 'name'
  ) then
    alter table public.internships rename column title to name;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'internships'
      and column_name = 'organization'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'internships'
      and column_name = 'institution'
  ) then
    alter table public.internships rename column organization to institution;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'internships'
      and column_name = 'description'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'internships'
      and column_name = 'summary'
  ) then
    alter table public.internships rename column description to summary;
  end if;
end $$;

update public.internships
set ideal_candidate = null
where ideal_candidate is not null
  and ideal_candidate not in ('pre-MD', 'pre-PhD', 'other');

update public.internships
set opportunity_type = null
where opportunity_type is not null
  and opportunity_type not in ('Clinical', 'Basic Science', 'Other');

alter table public.internships
  drop column if exists focus,
  drop column if exists term,
  drop column if exists format,
  drop column if exists application_window,
  drop column if exists fit,
  drop column if exists next_step;

alter table public.internships
  drop constraint if exists internships_ideal_candidate_check,
  drop constraint if exists internships_opportunity_type_check,
  add constraint internships_ideal_candidate_check
    check (ideal_candidate is null or ideal_candidate in ('pre-MD', 'pre-PhD', 'other')),
  add constraint internships_opportunity_type_check
    check (opportunity_type is null or opportunity_type in ('Clinical', 'Basic Science', 'Other'));
