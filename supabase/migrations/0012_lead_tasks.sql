-- Задачи/напоминания по лиду (позвонить, написать и т.д.), со сроком и
-- отметкой выполнения. Видимость — та же схема, что и у leads: менеджер видит
-- задачи по своим/неназначенным лидам, rop/admin — по всем. Заблокированный
-- (is_active = false) пользователь не должен видеть/трогать задачи —
-- is_current_user_active() уже определена в 0014_profiles_is_active.sql.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  title text not null,
  due_at timestamptz,
  done boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists tasks_lead_idx on public.tasks (lead_id);
create index if not exists tasks_due_idx on public.tasks (due_at) where not done;

alter table public.tasks enable row level security;

create policy "tasks_select_scoped" on public.tasks
  for select using (
    public.is_current_user_active()
    and exists (
      select 1 from public.leads l
      where l.id = lead_id
        and (
          public.current_role() in ('rop', 'admin')
          or l.assigned_manager_id = auth.uid()
          or l.assigned_manager_id is null
        )
    )
  );

create policy "tasks_insert_scoped" on public.tasks
  for insert with check (
    public.is_current_user_active()
    and exists (
      select 1 from public.leads l
      where l.id = lead_id
        and (
          public.current_role() in ('rop', 'admin')
          or l.assigned_manager_id = auth.uid()
          or l.assigned_manager_id is null
        )
    )
  );

create policy "tasks_update_scoped" on public.tasks
  for update using (
    public.is_current_user_active()
    and exists (
      select 1 from public.leads l
      where l.id = lead_id
        and (
          public.current_role() in ('rop', 'admin')
          or l.assigned_manager_id = auth.uid()
          or l.assigned_manager_id is null
        )
    )
  );

create policy "tasks_delete_scoped" on public.tasks
  for delete using (
    public.is_current_user_active()
    and exists (
      select 1 from public.leads l
      where l.id = lead_id
        and (
          public.current_role() in ('rop', 'admin')
          or l.assigned_manager_id = auth.uid()
          or l.assigned_manager_id is null
        )
    )
  );
