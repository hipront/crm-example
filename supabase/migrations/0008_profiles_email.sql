-- Добавляем email в profiles (нужен для страницы /admin/users),
-- бэкфиллим существующих пользователей из auth.users, обновляем триггер
-- регистрации, чтобы email сохранялся сразу для новых.

alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email, 'manager');
  return new;
end;
$$;

-- admin может менять роль/имя любого профиля (не только свой)
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');
