insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "public can read avatars" on storage.objects;
drop policy if exists "authenticated users can upload avatars" on storage.objects;
drop policy if exists "authenticated users can update own avatars" on storage.objects;
drop policy if exists "authenticated users can delete own avatars" on storage.objects;

create policy "public can read avatars"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

create policy "authenticated users can upload avatars"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'avatars');

create policy "authenticated users can update own avatars"
on storage.objects
for update
to authenticated
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "authenticated users can delete own avatars"
on storage.objects
for delete
to authenticated
using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
