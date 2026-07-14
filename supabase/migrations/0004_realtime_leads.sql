-- Включаем Realtime для таблицы leads (канбан подписывается на изменения)
alter publication supabase_realtime add table public.leads;
