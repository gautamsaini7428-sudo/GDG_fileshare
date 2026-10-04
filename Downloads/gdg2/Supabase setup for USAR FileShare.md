# Supabase setup for USAR FileShare

The browser app needs the Supabase project URL and its **publishable/anon key**. Never use a `service_role` or secret key in this app.

For this project, the URL value is `https://hfvmrfkrdqyrxeelqdty.supabase.co` (without `/rest/v1/` ). The dashboard page ending in `/integrations/data_api/overview` and the `/rest/v1/` address are URLs/endpoints, not API-key values.

## Enter the settings for local Preview

At the project root (`/home/ubuntu/usarfiles`), create **`.env.local`** by copying [`.env.example`](.env.example). Enter your two browser-safe values in that file:

```
VITE_USAR_SUPABASE_URL=https://hfvmrfkrdqyrxeelqdty.supabase.co
VITE_USAR_SUPABASE_ANON_KEY=<your sb_publishable_... key>
```

Paste the project URL after the first `=` and the publishable/anon key after the second `=`. Do not add quotation marks. The `.env.local` file is ignored by Git; do not commit it. Vite exposes `VITE_*` settings to the browser bundle, which is why only the publishable key—not a service-role key—belongs there. Restart or reload the Preview after saving the file.

To locate the key, open [this project's Settings → API Keys page](https://supabase.com/dashboard/project/hfvmrfkrdqyrxeelqdty/settings/api-keys). Copy the **Publishable key** whose value starts with `sb_publishable_`. Do not copy a **Secret key** (`sb_secret_...`) or legacy `service_role` key. Supabase's [official API-key guide](https://supabase.com/docs/guides/getting-started/api-keys) documents these key types and their intended use.

This local file configures the current Preview/development process. For a separately published production deployment, use that runtime's protected environment settings rather than committing `.env.local`.

## Apply the database and storage migration

In the selected Supabase project, open **SQL Editor → New query**. Copy and run the complete contents of [`supabase/migrations/20261001000000_usar_fileshare.sql`](supabase/migrations/20261001000000_usar_fileshare.sql). This creates the `files` table and indexes, enables owner-only Row Level Security, and creates/configures the private `usar-private-files` bucket and per-user object policies. The object layout is `files/{user_id}/{file_id}/{filename}`.

## Enable and allowlist email authentication

In **Authentication → Providers**, ensure email/password sign-in is enabled. In **Authentication → URL Configuration**, add the app's public Preview URL (and later its production URL) to the allowed redirect URLs. Email confirmation remains governed by the Supabase project's settings; if enabled, users must confirm the message before signing in.

After configuration and migration, reload Preview and test registration, login, upload, list, search, download, delete, logout, and a second user's isolation. This project does not include fake users or sample file rows.
