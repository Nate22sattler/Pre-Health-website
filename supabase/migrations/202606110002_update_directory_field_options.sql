update public.contacts
set field_of_work = case field_of_work
  when 'PT' then 'OT/PT'
  when 'OT' then 'OT/PT'
  when 'MD' then 'Clinical Medicine'
  when 'PA' then 'Clinical Medicine'
  when 'DDS' then 'Dentistry'
  when 'PH' then 'Public Health'
  when 'BSN' then 'Nursing'
  else field_of_work
end
where field_of_work in ('PT', 'OT', 'MD', 'PA', 'DDS', 'PH', 'BSN');

update public.alumni_submissions
set field_of_work = case field_of_work
  when 'PT' then 'OT/PT'
  when 'OT' then 'OT/PT'
  when 'MD' then 'Clinical Medicine'
  when 'PA' then 'Clinical Medicine'
  when 'DDS' then 'Dentistry'
  when 'PH' then 'Public Health'
  when 'BSN' then 'Nursing'
  else field_of_work
end
where field_of_work in ('PT', 'OT', 'MD', 'PA', 'DDS', 'PH', 'BSN');

alter table public.contacts
  drop constraint if exists contacts_field_of_work_check,
  add constraint contacts_field_of_work_check
    check (
      field_of_work is null
      or field_of_work in (
        'MD-PhD',
        'Clinical Medicine',
        'Research',
        'Nursing',
        'OT/PT',
        'Dentistry',
        'Public Health',
        'Psychology',
        'Other'
      )
    );

alter table public.alumni_submissions
  drop constraint if exists alumni_submissions_field_of_work_check,
  add constraint alumni_submissions_field_of_work_check
    check (
      field_of_work is null
      or field_of_work in (
        'MD-PhD',
        'Clinical Medicine',
        'Research',
        'Nursing',
        'OT/PT',
        'Dentistry',
        'Public Health',
        'Psychology',
        'Other'
      )
    );
