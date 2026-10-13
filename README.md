# Yash Engineering Portfolio — cloud edition 0.3.0

Read **CLOUD_SETUP.md** for the complete backend setup, existing-project PowerShell update, Vercel settings and Android installation.

The app preserves the vibrant technical portfolio and adds a Supabase-backed owner workspace. It requires your own Supabase project and owner user. Cloud configuration is intentionally empty until deployment settings are supplied.

## Development

Node.js 22 or later. Install using `npm ci`, build using `npm run build`, test using `npm run check`, then serve using `npm run dev`. Vercel serves `dist` after building. The build bundles the Supabase browser client locally and generates `dist/cloud-config.js` from `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_KEY`. Only a public publishable/anon key belongs there.

## Architecture

- `dist/app.js`: existing app, owner UI, IndexedDB persistence, queue and conflict review.
- `dist/cloud.js`: official Supabase SDK integration, email/password, private uploads, public snapshots.
- `dist/sync-core.js`: revision merging and in-flight edit preservation.
- `supabase/schema.sql`: owner RLS, private bucket policies, atomic revision save RPC, whitelisted public snapshots.
- `dist/sw.js`: application-shell cache; cloud requests and private files are not cached by the service worker. Offline drafts and downloaded files live in owner-scoped IndexedDB.
- `tests/database.test.mjs`: SQL access, snapshot, conflict and retry tests under PostgreSQL/PGlite with simulated Supabase schemas.

Public content uses approved cloud snapshots when configured. The older static publication command is retained for offline/static-only use; it is not the cloud publishing workflow. Account records, passwords, files and tokens must never be committed to GitHub.

Private Google imports, public cloud media, expiring sharing links, a scalable video archive and background notifications remain future work. This release is a directly installable PWA, not a native APK. Uploads require the app to stay open and can retry from the beginning after interruption.

Current Supabase Free storage is a limited starting point, not a permanent capacity plan for a multi-year video archive. See CLOUD_SETUP.md for limits and the live validation procedure.
