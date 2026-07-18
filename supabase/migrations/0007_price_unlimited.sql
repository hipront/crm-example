-- Убираем потолок цены: numeric(10,2) ограничивал максимум ~99 999 999,99.
-- Простой numeric без precision/scale хранит число произвольного размера.

alter table public.paintings alter column price type numeric;
