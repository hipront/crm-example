-- Storage bucket для фото картин каталога: публичное чтение (лендинг),
-- запись/удаление только admin.

insert into storage.buckets (id, name, public)
values ('paintings', 'paintings', true)
on conflict (id) do nothing;

drop policy if exists "paintings_storage_admin_write" on storage.objects;
create policy "paintings_storage_admin_write" on storage.objects
  for all using (
    bucket_id = 'paintings' and public.current_role() = 'admin'
  )
  with check (
    bucket_id = 'paintings' and public.current_role() = 'admin'
  );
