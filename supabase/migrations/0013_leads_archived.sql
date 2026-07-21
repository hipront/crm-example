-- Архивация карточки на канбане — отдельный, независимый флаг. Не связан ни
-- с status (этап канбана), ни с pipeline_status (статус в Лидах): просто
-- "скрыть карточку с рабочей доски", обратимо, вручную. Аналитика и Лиды
-- продолжают видеть все лиды как есть — архивация влияет только на
-- отображение на доске CRM.

alter table public.leads
  add column if not exists archived boolean not null default false;

create index if not exists leads_archived_idx on public.leads (archived);
