-- Расширяем задачи под отдельную вкладку "Задачи": нужен тип (Позвонить/
-- Написать/Отправить КП/Другое) и исполнитель, отдельный от того, кто
-- создал задачу (created_by). title становится необязательным описанием.

alter table public.tasks
  add column if not exists type text not null default 'call'
    check (type in ('call', 'message', 'proposal', 'other')),
  add column if not exists assignee_id uuid references public.profiles (id) on delete set null;

alter table public.tasks alter column title drop not null;
alter table public.tasks rename column title to description;

create index if not exists tasks_assignee_idx on public.tasks (assignee_id);
