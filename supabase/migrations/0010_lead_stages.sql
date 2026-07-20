-- Настраиваемые этапы воронки: раньше leads.status был жёстким enum (check-constraint).
-- Выносим этапы в отдельную таблицу, чтобы админ мог менять название/цвет и добавлять
-- свои этапы. Системные этапы (is_system) нельзя удалить — на их ключи завязана бизнес-логика
-- (например 'paid' снимает картину с продажи, 'closed'/'rejected' финализируют сделку).

create table if not exists public.lead_stages (
  key text primary key,
  title text not null,
  color text not null default '#94a3b8',
  position integer not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

insert into public.lead_stages (key, title, color, position, is_system) values
  ('new',         'Новый',            '#94a3b8', 1, true),
  ('in_progress', 'В работе',         '#22d3ee', 2, true),
  ('agreed',      'Договорились',     '#a855f7', 3, true),
  ('paid',        'Оплачен',          '#4ade80', 4, true),
  ('shipped',     'Отправлен/Выдан',  '#e879f9', 5, true),
  ('closed',      'Закрыт',           '#f5f3f7', 6, true),
  ('rejected',    'Отказ',            '#f87171', 7, true)
on conflict (key) do nothing;

alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads
  add constraint leads_status_fkey foreign key (status) references public.lead_stages (key);

alter table public.lead_stages enable row level security;

create policy "lead_stages_public_read" on public.lead_stages
  for select using (true);

create policy "lead_stages_admin_write" on public.lead_stages
  for all using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');
