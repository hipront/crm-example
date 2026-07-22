-- Viewer должен видеть ВСЕ лиды/задачи (полный read-only доступ), а не только
-- неназначенные. Баг: миграция 0014 переопределила leads_select_scoped (добавляя
-- проверку is_active) и случайно потеряла 'viewer' из списка ролей — в 0005 он
-- был. tasks_select_scoped его не имел вообще с самого начала.

drop policy if exists "leads_select_scoped" on public.leads;
create policy "leads_select_scoped" on public.leads
  for select using (
    public.is_current_user_active()
    and (
      public.current_role() in ('rop', 'admin', 'viewer')
      or assigned_manager_id = auth.uid()
      or assigned_manager_id is null
    )
  );

drop policy if exists "tasks_select_scoped" on public.tasks;
create policy "tasks_select_scoped" on public.tasks
  for select using (
    public.is_current_user_active()
    and exists (
      select 1 from public.leads l
      where l.id = lead_id
        and (
          public.current_role() in ('rop', 'admin', 'viewer')
          or l.assigned_manager_id = auth.uid()
          or l.assigned_manager_id is null
        )
    )
  );
