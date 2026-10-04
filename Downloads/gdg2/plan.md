# USAR FileShare — Implementation Plan

## Goal and summary

Build a production-quality, responsive GGSIPU USAR student file-sharing portal with real email/password registration and login, durable per-user file storage, file management, searchable/filterable lists, and server-enforced access control. Use the user-selected existing **Supabase** project for Auth, PostgreSQL, Row Level Security, and private Storage. This is not a visual-only prototype and must not use hardcoded fake file data.

The new Manus Webdev scaffold already exists at `/home/ubuntu/usarfiles` (React/Express/tRPC/Drizzle starter; Manus server and database resources were enabled during initialization). Supabase was selected because its Auth, RLS, and Storage policies directly support the requested behavior. The scaffold's provisioned Manus MySQL database will not be used for application file records; no service-role key will be placed in browser code.

## Implementation approach

1. **Connect Supabase securely.** After this plan is approved, connect/authorize the existing Supabase project using the available connector or protected setup flow. Configure only the browser-safe project URL and anon/public key for the app. Do not request, store, or expose a Supabase service-role key. Confirm the target Supabase project before applying the app's additive schema and policies; preserve unrelated existing objects.
2. **Inspect and adapt the initialized project.** Reuse the existing React/TypeScript/Vite/Tailwind frontend and Express serving/build setup, rather than replacing the scaffold. Keep the server health route and production serving behavior needed by the Webdev template. Use Supabase Auth directly through its supported client and Supabase PostgreSQL/Storage for app data and file bytes.
3. **Create the Supabase schema and policies.** Add a `files` table with `id`, `user_id`, `file_name`, `file_type`, `file_size`, `storage_path`, and `uploaded_at`, suitable indexes, and ownership constraints. Enable RLS and policies so an authenticated user can select, insert, update only their own rows and delete only their own rows. Use a private storage bucket at `files/{user_id}/{file_id}/{filename}`; Storage policies must require the UUID in the owner-folder segment after the fixed `files/` prefix to match the authenticated user for upload, download, and deletion. Keep all file actions behind authenticated Supabase sessions and do not create public share links.
4. **Implement authentication and routing.** Build registration (full name, email, password, confirm password), login (email/password), logout, persisted Supabase Auth session handling, form validation, readable error states, and protected `/dashboard` and `/files` routes. Successful login goes to `/dashboard`; expired or missing sessions return users to login without showing private file content. Never store plaintext passwords or invent a development login.
5. **Build the portal interface and flows.** Implement a branded public landing page; authenticated dashboard and My Files views; responsive navigation/profile menu; drag-and-drop upload with type and size validation, progress/status, success/error notifications; file preview metadata, download and confirmed deletion; immediate filename search, file-type/date filters, and Newest/Oldest/Name A-Z/Name Z-A sorting. Keep file listing and operations bound to the current authenticated user and rely on RLS/storage rules in addition to UI checks.
6. **Add documentation and route declaration.** Create `DECISIONS.md` describing the per-user ownership model, private-bucket path policy, RLS enforcement, and why frontend checks are not relied upon. Keep `public/manus-routes.json` synchronized with all actual application page routes before starting the dev server.
7. **Deliver through the existing Webdev project.** Confirm configuration and required TypeScript diagnostics before the first code edits; run the project checks and development server using the existing port. Preserve existing user/project changes, checkpoint only the completed intended files, and report the Preview URL unless a successful publication is explicitly confirmed.

## Project structure

- `client/src/pages/` — Landing, Login, Register, Dashboard, and My Files page-level views.
- `client/src/components/` — Reusable navbar/sidebar, buttons, file cards/table, upload/dropzone and progress, search/filter controls, confirmation modal, toast, loading/skeleton/empty states, user menu, and statistics cards.
- `client/src/lib/supabase.ts` — Browser Supabase client using only the project URL and anon/public key.
- `client/src/hooks/` — Auth/session and file-query hooks, including protected-route state.
- `client/src/services/files.ts` — Typed, authenticated operations for file metadata and private Storage; no unscoped list/delete/download helpers.
- `client/src/types/` — File and UI/domain types.
- `supabase/migrations/` — Additive SQL migration for `files`, indexes, RLS policies, private bucket policies, and any necessary safe metadata constraints.
- `public/manus-routes.json` — Exact static route manifest required by Webdev.
- `public/assets/` — Authentic campus image if located and licensed/appropriate; otherwise a clearly labeled replaceable placeholder, never a generated fake campus or logo.
- `DECISIONS.md` — Security decision and ownership rationale.
- Existing `server/`, `Dockerfile`, `drizzle/`, and `package.json` — Preserve the provided server/static serving and health behavior; do not wire the unused Manus MySQL starter schema into file operations.

## Design direction

- **Design movement:** Contemporary university editorial design, informed by campus wayfinding and understated product-interface craft.
- **Core principles:** (1) Academic credibility without institutional impersonation; (2) clear ownership and privacy cues; (3) generous, calm workspace hierarchy; (4) restrained motion that confirms actions.
- **Color philosophy:** Warm white and soft stone establish a quiet study environment; deep pine green signals trust, security, and academic identity; restrained fresh-green highlights make primary actions unmistakable; dark ink maintains readable contrast. Use an ownable signature green such as `#176B4D`, not an asserted official GGSIPU brand color.
- **Layout paradigm:** Asymmetric editorial hero with copy on the left and an authentic campus-image frame on the right; authenticated pages use a compact persistent navigation rail on wide screens and a clean top/mobile menu, with content-first stacked sections rather than a generic file-manager grid.
- **Signature elements:** A restrained “campus folio” file-mark (geometric page outline with a small linked-node detail, not a university crest); fine green section rules/wayfinding labels; soft luminous green halo and low-motion particles confined to the landing hero.
- **Interaction philosophy:** Every state change is legible and reversible where possible: clear upload progress, visible ownership context, confirmation before delete, concise toasts, and no browser alerts.
- **Animation:** Use Framer Motion for 200–700 ms fades/slides, staggered feature entrance, subtle hover elevation, dropdown/modal transitions, file-row exit, and progress motion. Respect reduced-motion preferences; avoid continuous distracting motion.
- **Typography system:** Manrope for interface labels, controls, and data; Source Serif 4 for editorial landing headlines and selected display statements. Keep body and file metadata compact but comfortable, with clear size/weight/contrast hierarchy.
- **Brand essence:** “A private, practical file workspace built for the day-to-day academic work of the GGSIPU USAR community.” Personality: **trusted, focused, collegiate**.
- **Brand voice:** Direct, calm, and helpful; make privacy and progress explicit. Example lines: “Your course files, in one secure place.” and “Only you can access the files in your library.”
- **Wordmark & logo:** A custom typographic “USAR FileShare” lockup paired with the geometric campus-folio mark. It must not resemble or fabricate the official GGSIPU crest or university seal.
- **Signature brand color:** Deep USAR-inspired pine green `#176B4D`, presented as a design choice rather than an official color claim.

## Verification plan

- Inspect the final source, migration, and route manifest; ensure actual pages, not API/assets, are declared in `manus-routes.json` and the route file returns valid JSON.
- Run the repository's applicable type/lint/test/build checks and resolve actionable diagnostics and browser-console errors; verify desktop and mobile layouts, keyboard-accessible forms/menus/dialogs, and reduced-motion behavior.
- Exercise real Supabase registration, login, session persistence, logout, upload, list, search, filtering/sorting, download, delete, and login-again flows. Verify allowed extensions and size limits, plus user-facing network/auth/file error states. Do not fake successful authentication or file records if external Supabase configuration prevents a live test; report that blocker precisely.
- Verify isolation with two authenticated test accounts: each can list, download, and delete only files with its own `user_id` and own storage-folder path; direct attempts to query or access the other account's row/object are rejected by RLS/storage policy. Confirm deletion removes both the owned file record and stored object.

## Assumptions and open risks

- The user chose an **existing Supabase project**. Its connector is currently disabled; after plan approval, the connection and required browser-safe project values must be authorized/configured through the available secure flow. No secret should be sent in chat.
- Supabase email confirmation and outbound email depend on that project's Auth settings and mail configuration. Do not silently weaken authentication to make a demo flow pass; exercise the configured behavior and identify any delivery prerequisite.
- The attached material is a text specification; it contains no actual campus image. Search for an authentic/appropriate official campus image during implementation. If none is available, use the explicitly permitted clearly labeled placeholder.
- The new Webdev scaffold has already provisioned Manus server and database capabilities, which cannot be withdrawn through the one-way feature configuration. Supabase remains the sole source of application auth, file metadata, and file bytes; avoid redundant or misleading Manus-side data storage.
- A successful project Preview/checkpoint is not the same as public production publication. Report a published URL only if publication is confirmed.
