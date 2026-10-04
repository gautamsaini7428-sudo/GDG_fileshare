-- USAR FileShare: user-owned file metadata and private file storage.
-- Apply only to the Supabase project selected for this app.

create table if not exists public.files (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  file_name text not null check (length(file_name) between 1 and 255),
  file_type text not null check (file_type in ('PDF','DOC','DOCX','PPT','PPTX','XLS','XLSX','PNG','JPG','JPEG','ZIP','TXT')),
  file_size bigint not null check (file_size > 0 and file_size <= 26214400),
  storage_path text not null unique,
  uploaded_at timestamptz not null default now()
);

create index if not exists files_user_uploaded_at_idx on public.files (user_id, uploaded_at desc);
create index if not exists files_user_name_idx on public.files (user_id, file_name);
alter table public.files enable row level security;
revoke all on table public.files from anon;
grant select, insert, update, delete on table public.files to authenticated;

drop policy if exists "usar files select own" on public.files;
create policy "usar files select own" on public.files for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "usar files insert own" on public.files;
create policy "usar files insert own" on public.files for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "usar files update own" on public.files;
create policy "usar files update own" on public.files for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "usar files delete own" on public.files;
create policy "usar files delete own" on public.files for delete to authenticated using ((select auth.uid()) = user_id);

-- This app owns the named bucket; keep it private and capped at 25 MiB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'usar-private-files', 'usar-private-files', false, 26214400,
  array[
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png', 'image/jpeg', 'application/zip', 'application/x-zip-compressed',
    'text/plain', 'application/octet-stream'
  ]::text[]
)
on conflict (id) do update set name = excluded.name, public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- The static `files/` prefix is followed by the owner's UUID, file UUID, and filename.
drop policy if exists "usar private objects select own" on storage.objects;
create policy "usar private objects select own" on storage.objects for select to authenticated
  using (bucket_id = 'usar-private-files' and (storage.foldername(name))[2] = (select auth.uid())::text and coalesce(array_length(storage.foldername(name), 1), 0) >= 3);
drop policy if exists "usar private objects insert own" on storage.objects;
create policy "usar private objects insert own" on storage.objects for insert to authenticated
  with check (bucket_id = 'usar-private-files' and (storage.foldername(name))[2] = (select auth.uid())::text and coalesce(array_length(storage.foldername(name), 1), 0) >= 3);
drop policy if exists "usar private objects update own" on storage.objects;
create policy "usar private objects update own" on storage.objects for update to authenticated
  using (bucket_id = 'usar-private-files' and (storage.foldername(name))[2] = (select auth.uid())::text and coalesce(array_length(storage.foldername(name), 1), 0) >= 3)
  with check (bucket_id = 'usar-private-files' and (storage.foldername(name))[2] = (select auth.uid())::text and coalesce(array_length(storage.foldername(name), 1), 0) >= 3);
drop policy if exists "usar private objects delete own" on storage.objects;
create policy "usar private objects delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'usar-private-files' and (storage.foldername(name))[2] = (select auth.uid())::text and coalesce(array_length(storage.foldername(name), 1), 0) >= 3);
