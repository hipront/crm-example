-- Роль "viewer" задумана как полностью read-only (демо-доступ для показа
-- работодателю): видит весь функционал, но не должен иметь возможности
-- ничего изменить — ни через интерфейс (там уже задизейблены все кнопки),
-- ни в обход интерфейса напрямую через Supabase REST/JS-клиент.
--
-- До этой миграции у leads_update_scoped/tasks_*_scoped был branch
-- "assigned_manager_id is null", который пропускал ЛЮБОГО активного
-- пользователя независимо от роли (был задуман для менеджеров, "подхватывающих"
-- новые лиды) — включая viewer. Плюс leads_public_insert (для формы на
-- лендинге) была открыта вообще для всех запросов с check(true), в том числе
-- для авторизованного viewer из админки.
--
-- Используем "is distinct from" вместо "<>", потому что current_role() для
-- анонимного запроса (лендинг, auth.uid() is null) возвращает NULL, а
-- "NULL <> 'viewer'" в SQL даёт NULL (не true) — с обычным "<>" анонимные
-- запросы с лендинга неожиданно перестали бы проходить.

drop policy if exists "leads_update_scoped" on public.leads;
create policy "leads_update_scoped" on public.leads
  for update using (
    public.is_current_user_active()
    and public.current_role() is distinct from 'viewer'
    and (
      public.current_role() in ('rop', 'admin')
      or assigned_manager_id = auth.uid()
      or assigned_manager_id is null
    )
  );

drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert" on public.leads
  for insert with check (
    auth.uid() is null or public.current_role() is distinct from 'viewer'
  );

drop policy if exists "tasks_insert_scoped" on public.tasks;
create policy "tasks_insert_scoped" on public.tasks
  for insert with check (
    public.is_current_user_active()
    and public.current_role() is distinct from 'viewer'
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

drop policy if exists "tasks_update_scoped" on public.tasks;
create policy "tasks_update_scoped" on public.tasks
  for update using (
    public.is_current_user_active()
    and public.current_role() is distinct from 'viewer'
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

drop policy if exists "tasks_delete_scoped" on public.tasks;
create policy "tasks_delete_scoped" on public.tasks
  for delete using (
    public.is_current_user_active()
    and public.current_role() is distinct from 'viewer'
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
