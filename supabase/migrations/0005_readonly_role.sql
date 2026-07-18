-- Роль viewer: демо-доступ для показа админки (например, работодателю).
-- Видит всё то же, что rop/admin (канбан, будущая аналитика), но не может
-- ничего менять — ни статус лида, ни каталог, ни пользователей.

alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('manager', 'rop', 'admin', 'viewer'));

-- profiles: viewer видит все профили (как rop/admin), нужно для отображения
-- имени менеджера на карточке лида
drop policy if exists "profiles_select_own_or_lead" on public.profiles;
create policy "profiles_select_own_or_lead" on public.profiles
  for select using (
    id = auth.uid() or public.current_role() in ('rop', 'admin', 'viewer')
  );

-- leads: viewer видит все лиды, как rop/admin, но НЕ входит в update-политику
-- ниже — то есть не может менять статус даже в обход интерфейса
drop policy if exists "leads_select_scoped" on public.leads;
create policy "leads_select_scoped" on public.leads
  for select using (
    public.current_role() in ('rop', 'admin', 'viewer')
    or assigned_manager_id = auth.uid()
    or assigned_manager_id is null
  );

-- leads_update_scoped и leads_delete_admin_only НЕ трогаем — viewer туда
-- не добавляется, значит не сможет менять статус/удалять на уровне БД.

-- status_history: то же самое зеркало leads_select_scoped
drop policy if exists "status_history_select_scoped" on public.status_history;
create policy "status_history_select_scoped" on public.status_history
  for select using (
    exists (
      select 1 from public.leads l
      where l.id = lead_id
        and (
          public.current_role() in ('rop', 'admin', 'viewer')
          or l.assigned_manager_id = auth.uid()
          or l.assigned_manager_id is null
        )
    )
  );
