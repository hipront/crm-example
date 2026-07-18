-- Дыра в безопасности: "profiles_update_own" разрешает пользователю обновлять
-- свою же строку без ограничения по колонкам, а значит любой залогиненный
-- пользователь (включая viewer/manager) мог сам себе выставить role='admin'
-- через обычный update-запрос. RLS не умеет ограничивать конкретные колонки,
-- поэтому закрываем триггером на уровне таблицы: смена role разрешена только
-- если её меняет уже существующий admin (через profiles_update_admin).

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
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_self_escalation on public.profiles;
create trigger trg_prevent_role_self_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_role_self_escalation();
