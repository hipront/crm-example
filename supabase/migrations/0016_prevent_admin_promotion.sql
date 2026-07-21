-- Раньше любой admin мог назначить admin-роль кому угодно (сознательное
-- решение на старте проекта — "admin и так может почти всё"). Пересмотрено:
-- новый admin может появиться только напрямую через БД, не через приложение —
-- иначе один скомпрометированный/неаккуратный admin-аккаунт мог бы
-- бесконтрольно плодить себе равных.

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
  if new.role = 'admin' and old.role <> 'admin' then
    raise exception 'Promoting to admin is not allowed through the app';
  end if;
  if new.is_active is distinct from old.is_active and (
    auth.uid() = old.id or public.current_role() <> 'admin'
  ) then
    raise exception 'Only another admin can change is_active';
  end if;
  return new;
end;
$$;
