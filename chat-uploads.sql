create policy "upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'chat-uploads');
create policy "read own" on storage.objects for select to authenticated
  using (bucket_id = 'chat-uploads');
