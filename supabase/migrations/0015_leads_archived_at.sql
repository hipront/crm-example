alter table public.leads
  add column if not exists archived_at timestamptz;
