alter table public.profiles
  add column if not exists department text,
  add column if not exists year integer,
  add column if not exists portfolio_url text,
  add column if not exists academic_focus text;