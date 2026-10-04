# Access Control Decision

USAR FileShare uses Supabase Auth as the identity source. Every `public.files` row records the authenticated user's UUID in `user_id`; database Row Level Security permits select, insert, update, and delete only when that value matches `auth.uid()`.

Uploaded objects live in the non-public `usar-private-files` Storage bucket at `files/{user_id}/{file_id}/{filename}`. Storage policies independently require the UUID in the owner-folder segment immediately after the static `files/` prefix to match the authenticated user for read, upload, update, and delete operations. Downloads use the authenticated Storage API rather than permanent public or share links.

The application also scopes metadata requests to the current user and verifies ownership before a download or deletion. These client checks improve feedback but are not the security boundary: Postgres RLS and Storage policies are the enforcement layer, so changing a client-side ID or request path does not grant access to another user's records or objects. The browser receives only the Supabase project URL and publishable/anon key; no service-role credential is required or included.

The selected Supabase project must have the migration in `supabase/migrations/20261001000000_usar_fileshare.sql` applied before authentication-backed file operations can work.
