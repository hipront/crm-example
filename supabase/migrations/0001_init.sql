-- Начальная схема: profiles, paintings, leads, status_history + RLS

-- profiles: расширяет auth.users, хранит роль
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'manager' check (role in ('manager', 'rop', 'admin')),
  created_at timestamptz not null default now()
);

-- paintings: каталог картин
create table if not exists public.paintings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric(10, 2) not null,
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- leads: заявки с лендинга и их обработка
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  painting_id uuid references public.paintings (id) on delete set null,
  message text,
  status text not null default 'new' check (
    status in ('new', 'in_progress', 'agreed', 'paid', 'shipped', 'closed', 'rejected')
  ),
  assigned_manager_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- status_history: журнал смен статуса лида
create table if not exists public.status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references public.profiles (id),
  changed_at timestamptz not null default now()
);

create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_assigned_manager_idx on public.leads (assigned_manager_id);
create index if not exists status_history_lead_idx on public.status_history (lead_id);

-- Триггер: при изменении leads.status пишем запись в status_history
create or replace function public.log_lead_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.status_history (lead_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_log_lead_status_change on public.leads;
create trigger trg_log_lead_status_change
  before update on public.leads
  for each row
  execute function public.log_lead_status_change();

-- Хелпер: роль текущего пользователя
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.paintings enable row level security;
alter table public.leads enable row level security;
alter table public.status_history enable row level security;

-- profiles: пользователь читает свою запись, rop/admin читают все
create policy "profiles_select_own_or_lead" on public.profiles
  for select using (
    id = auth.uid() or public.current_role() in ('rop', 'admin')
  );

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- paintings: публичное чтение (лендинг), запись только admin
create policy "paintings_public_read" on public.paintings
  for select using (true);

create policy "paintings_admin_write" on public.paintings
  for all using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- leads: анонимная вставка с лендинга разрешена
create policy "leads_public_insert" on public.leads
  for insert with check (true);

-- leads: менеджер видит новые (без назначения) и свои назначенные; rop/admin видят все
create policy "leads_select_scoped" on public.leads
  for select using (
    public.current_role() in ('rop', 'admin')
    or assigned_manager_id = auth.uid()
    or assigned_manager_id is null
  );

create policy "leads_update_scoped" on public.leads
  for update using (
    public.current_role() in ('rop', 'admin')
    or assigned_manager_id = auth.uid()
    or assigned_manager_id is null
  );

create policy "leads_delete_admin_only" on public.leads
  for delete using (public.current_role() = 'admin');

-- status_history: видно вместе со связанным лидом
create policy "status_history_select_scoped" on public.status_history
  for select using (
    exists (
      select 1 from public.leads l
      where l.id = lead_id
        and (
          public.current_role() in ('rop', 'admin')
          or l.assigned_manager_id = auth.uid()
          or l.assigned_manager_id is null
        )
    )
  );
