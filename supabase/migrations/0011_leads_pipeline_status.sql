-- Разделяем два независимых понятия статуса:
--  - leads.status        — стадия воронки CRM/канбана (позже станет ссылкой
--                           на настраиваемые этапы из lead_stages, см. 0010).
--  - leads.pipeline_status — укрупнённый статус для вкладки "Лиды"
--                           (Новый/В работе/Завершён/Отклонён), который
--                           менеджер выставляет сам и который никак не
--                           обязан совпадать с текущим этапом канбана.
-- Раньше это вычислялось на лету из status/assigned_manager_id, из-за чего
-- значение "отскакивало" обратно при попытке вручную его сменить.

alter table public.leads
  add column if not exists pipeline_status text not null default 'new'
    check (pipeline_status in ('new', 'in_progress', 'closed', 'rejected'));

-- Разовый бэкфилл существующих строк — дальше поля живут независимо.
update public.leads
set pipeline_status = case
  when status = 'closed' then 'closed'
  when status = 'rejected' then 'rejected'
  when assigned_manager_id is not null or status <> 'new' then 'in_progress'
  else 'new'
end
where true;
