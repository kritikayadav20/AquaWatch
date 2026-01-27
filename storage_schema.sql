-- Create a storage bucket for uploads
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- Allow public access to uploads
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'uploads' );

-- Allow authenticated users to upload
create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'uploads' and auth.role() = 'authenticated' );
