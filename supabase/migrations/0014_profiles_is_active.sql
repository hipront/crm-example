-- "Заблокировать" пользователя вместо удаления профиля: строка остаётся
-- (не рвём FK/историю), но человек полностью теряет доступ. Закрываем
-- дыру, а не только прячем кнопку в UI:
--   1) current_role() перестаёт видеть роль заблокированного — все policy,
--      завязанные на current_role() (каталог, пользователи, lead_stages),
--      автоматически перестают пускать.
--   2) leads-политики отдельно тоже завязаны на "assigned_manager_id =
--      auth.uid()", это current_role() не покрывает — добавляем
--      is_current_user_active() и туда.
--   3) менять is_active самому себе нельзя — только admin другому.

alter table public.profiles add column if not exists is_active boolean not null default true;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and is_active;
$$;

create or replace function public.is_current_user_active()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_active from public.profiles where id = auth.uid()), false);
$$;

drop policy if exists "leads_select_scoped" on public.leads;
create policy "leads_select_scoped" on public.leads
  for select using (
    public.is_current_user_active()
    and (
      public.current_role() in ('rop', 'admin')
      or assigned_manager_id = auth.uid()
      or assigned_manager_id is null
    )
  );

drop policy if exists "leads_update_scoped" on public.leads;
create policy "leads_update_scoped" on public.leads
  for update using (
    public.is_current_user_active()
    and (
      public.current_role() in ('rop', 'admin')
      or assigned_manager_id = auth.uid()
      or assigned_manager_id is null
    )
  );

create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and public.current_role() <> 'admin' then
    raise exception 'Only admin can change role';
  end if;
  if new.is_active is distinct from old.is_active and (
    auth.uid() = old.id or public.current_role() <> 'admin'
  ) then
    raise exception 'Only another admin can change is_active';
  end if;
  return new;
end;
$$;
