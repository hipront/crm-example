-- Расширяем историю лида: раньше status_history логировал только смену
-- канбан-этапа (status). Добавляем:
--   1) отдельный вид записи для смены pipeline_status (статус в "Лидах") —
--      это другое поле, отдельное от канбана, но менеджеру важно видеть
--      оба вида изменений в одной ленте;
--   2) системную запись "Лид создан" при появлении лида.
-- Различаем виды записи колонкой kind, старые данные (уже накопленные)
-- автоматически остаются kind='status' по умолчанию.

alter table public.status_history
  add column if not exists kind text not null default 'status'
    check (kind in ('status', 'pipeline_status', 'created'));

create or replace function public.log_lead_pipeline_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.pipeline_status is distinct from old.pipeline_status then
    insert into public.status_history (lead_id, old_status, new_status, changed_by, kind)
    values (new.id, old.pipeline_status, new.pipeline_status, auth.uid(), 'pipeline_status');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_lead_pipeline_status_change on public.leads;
create trigger trg_log_lead_pipeline_status_change
  before update on public.leads
  for each row
  execute function public.log_lead_pipeline_status_change();

create or replace function public.log_lead_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.status_history (lead_id, old_status, new_status, changed_by, kind)
  values (new.id, null, new.status, null, 'created');
  return new;
end;
$$;

drop trigger if exists trg_log_lead_created on public.leads;
create trigger trg_log_lead_created
  after insert on public.leads
  for each row
  execute function public.log_lead_created();
