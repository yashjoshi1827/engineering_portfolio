# Cloud storage and Android installation — version 0.3.0

Existing website: https://engineeringportfolio-kappa.vercel.app/
Existing repository: https://github.com/yashjoshi1827/engineering_portfolio
Existing Windows project folder: C:\Users\yashj\Projects\YashPortfolio-20261014-001509

This package implements the connection. Your backend account must be provisioned before it can operate. No backend credentials are included and your live deployment has not been modified by this package.

## What this release adds

- Owner-only email/password sign-in and password change.
- Private cloud records for notes, guided logs, goals, announcements and file metadata.
- Private uploads; download attachments on another signed-in device.
- Device-first saving and queued syncing while the app is open and online.
- Revision checks, conflict review and export of both conflicting copies.
- Public text snapshots updated after explicit approval; draft edits remain private.
- Private recording uploads with a 45 MiB (47,185,920 byte) app limit. Recording uses a modest bitrate and stops around 43 MiB; actual encoding depends on the browser.
- An installable Android/Windows PWA with cached application assets.
- Import of old browser drafts without deleting the originals.

This is not an APK. There is no Play Store account, signing key or store fee involved. Installation uses Chrome/Edge's web-app installation support. Background upload while the app is closed is not guaranteed; interrupted uploads retry as whole files when you reopen and sync. Do not clear browser data while changes are pending.

## 1. Create a free Supabase project

1. Visit https://supabase.com/dashboard and sign in or create an account.
2. Create a new project in a Free organization. Choose a nearby region offered by the dashboard.
3. Give it a database password and keep that password in your password manager. It is separate from your website login. Never put it in frontend code, GitHub, or this chat.
4. Wait for the project to finish provisioning.

Use a NEW project for the provided SQL so existing application policies cannot accidentally grant broader access. Do not upgrade to Pro for this setup.

Budget: Supabase Free currently includes 1 GB file storage and a 500 MB database; platform limits and inactivity pausing apply. The platform permits files up to 50 MB on Free; this app uses 45 MiB. This allowance is only a starting point for a video journal. A rough 10-minute recording at 532 kbit/s is about 40 MB, so 1 GB holds only about two dozen such recordings. Actual sizes vary. Check Usage in your dashboard and keep originals outside the app. No paid storage is activated by the code.

Official references:
- https://supabase.com/pricing
- https://supabase.com/docs/guides/storage/uploads/file-limits

## 2. Install the database and private bucket

1. Extract this ZIP to a temporary folder so you can open its files.
2. In Supabase, open SQL Editor and create a new query.
3. Open `supabase/schema.sql` from the ZIP, copy its COMPLETE contents into the query and run it once.
4. Check that the query completed successfully.

This creates owner-restricted records, a public snapshot table, revision-aware save functions, and the private `portfolio-private` storage bucket. Do not change the bucket to public. Do not remove row-level security to resolve an error. The script is transactional: a failed run rolls back. A successful run is a one-time installation; running it again may report that policies already exist.

## 3. Create your owner login

1. In Supabase, open Authentication → Users.
2. Use Add user / Create user and enter the EMAIL and PASSWORD you want for this website. Use a strong password of at least 12 characters. Enable the dashboard's auto-confirm option for your own manually created account if offered.
3. Copy the new user's UUID from the Users page.
4. In SQL Editor, run the following after replacing the placeholder with that exact UUID:

```sql
insert into public.portfolio_owner (singleton, user_id)
values (true, 'PASTE-YOUR-AUTH-USER-UUID-HERE'::uuid);
```

5. In Authentication settings, keep email/password enabled and disable public sign-ups. Depending on the dashboard layout, this appears under Sign In / Providers or general authentication settings. Leave anonymous sign-in disabled.
6. Set Authentication → URL Configuration → Site URL to:

```text
https://engineeringportfolio-kappa.vercel.app
```

Only the UUID in `portfolio_owner` can access the workspace's cloud data. Knowing the public API key or creating another account does not grant owner access. There is no visitor registration form.

Password recovery is not built into this release. If needed, use Supabase's Auth administration; an email recovery flow requires its email settings and redirect handling to be configured before offering it in the app. You can change a known password in the app after signing in.

## 4. Add public connection settings in Vercel

In your Supabase project's Connect dialog / API settings, find:

- Project URL, such as `https://PROJECT-REF.supabase.co` (no trailing slash).
- Publishable key beginning `sb_publishable_`. A legacy `anon` key is also supported.

Do NOT use `sb_secret_`, `service_role`, a database password, or your personal access token. The build rejects secret keys. These two connection settings intentionally become public browser configuration; database policies enforce private access.

Open your EXISTING Vercel project → Settings → Environment Variables. Add:

| Name | Value | Environments |
| --- | --- | --- |
| PUBLIC_SUPABASE_URL | Your project URL | Production (Preview only if you intentionally want previews to use the same real data) |
| PUBLIC_SUPABASE_KEY | Your publishable key | Production |

Save both before pushing the update. Do not create another Vercel project. Existing build settings remain `npm run build`, repository root, output `dist`; `vercel.json` also supplies `npm ci --include=dev` as the install command.

## 5. Update the existing Windows project

Download this ZIP as `Yash_Engineering_Cloud_Update.zip` into Downloads. Commands below are for the existing project folder from your terminal output. Run ONE BLOCK AT A TIME. There are no if blocks.

First back up text drafts from the current website: Workspace → Setup & export → Export text records. Download important attachments separately. Device storage on localhost and on your Vercel domain are separate; use text export/import and re-add attachments if you move between origins.

Stop the local dev server with Ctrl+C if it is running.

```powershell
Set-Location 'C:\Users\yashj\Projects\YashPortfolio-20261014-001509'
```

```powershell
git status
```

If this lists your own uncommitted code changes, preserve them in a commit or a copy before replacing files. This update replaces the shipped app files and README. It does not contain a `.git` directory and will preserve the existing GitHub connection.

```powershell
git branch backup-before-cloud
```

Run that backup command once. If it says the branch already exists, keep the existing backup and continue.

```powershell
Expand-Archive -LiteralPath "$env:USERPROFILE\Downloads\Yash_Engineering_Cloud_Update.zip" -DestinationPath . -Force
```

```powershell
npm.cmd ci
```

```powershell
npm.cmd run build
```

```powershell
npm.cmd run check
```

Without local environment settings, the local build intentionally shows "Cloud setup required". Vercel's production build reads the settings you added in step 4.

```powershell
git add .
```

```powershell
git commit -m "Add owner login, private cloud sync and installable app"
```

```powershell
git push
```

Vercel deploys the new commit. Keep using your existing website URL. If Vercel previously had an overridden install command, set it to `npm ci --include=dev`.

## 6. Activate and check the app

1. Wait for the deployment to say Ready.
2. Close all existing tabs and installed windows for this website, then reopen it. On Windows, Ctrl+Shift+R can refresh the current page. Do not clear site data to update: that would remove unsynced drafts.
3. Open Workspace and sign in with the owner EMAIL/PASSWORD from step 3, not your GitHub or Supabase dashboard password.
4. Open Setup & export (Account settings) and select Sync now.
5. Select Import previous device workspace if you saved work in the original version on this same browser/domain. This keeps the originals and imports previously preview-published records as PRIVATE drafts.
6. Create one test note and wait for "Synced at...". Open the same site on a second device, sign in, and select Sync now to check that the note arrives.
7. Open a private/incognito browser window without signing in. The workspace must ask for login, and your private note must not appear on the public Notes page.
8. Approve a snapshot of a harmless test note, sync, and refresh the incognito Notes page. Edit the private draft and sync again: the public page should still show the approved snapshot. Unpublish, sync, refresh: it should disappear.
9. Test one small attachment before relying on recordings. Remote media loads only when requested, to avoid downloading every video whenever the file page opens.

Sync happens after local edits, reconnecting, returning to the app, and pressing Sync now. The app does not continuously stream remote changes; use Sync now on the second device to fetch work created elsewhere. Conflicts appear under Account settings with both copies available for download.

## 7. Install on Android

1. Open https://engineeringportfolio-kappa.vercel.app/ in Chrome.
2. Tap ⋮ → Add to Home screen → Install (or Install app).
3. Launch the new icon and sign in to your owner workspace.
4. Permit camera and microphone when you first record a project update.
5. Keep the app in the foreground until uploads complete. Offline notes and recordings queue locally; they cannot sync while there is no internet.

If you already installed the previous PWA, you do not need to uninstall it. Close and reopen it after deployment. Uninstalling or clearing browser storage may remove local drafts.

On Windows, open the same URL in Chrome/Edge and use the browser's install-app option. Both installations use the same cloud account after sign-in.

Official installation reference: https://support.google.com/chrome/answer/9658361

## Remaining scope and limits

Google Drive/Docs and Google Photos authorization/import, a public cloud gallery, revocable expiring document links, a larger video archive, APK distribution, push/email reminders, and automatic background/resumable multipart uploads are not implemented in this release. Files remain private, even if their old local version had a preview-public flag. Project/video associations are preserved in Files & gallery.

Server authorization and sync logic were tested using PostgreSQL in PGlite with simulated Supabase auth and storage schemas. Build, snapshot/export and conflict tests passed. Real Supabase connection, browser camera, Android installation and real cross-device behavior require the live checks above; they have not been claimed as verified here.

Offline drafts and tokens are kept in the browser profile, not in an encrypted vault. Use a device screen lock and sign out before lending a device. Signing out retains unsynced drafts for your next sign-in but locks them from the app's signed-out UI. Row-level security protects the cloud independently of that UI.

## Troubleshooting

- **Cloud setup required:** Add BOTH production environment variables and redeploy. Do not put them under a different Vercel project.
- **Owner access required / not the portfolio owner:** Compare the Auth user's UUID with `portfolio_owner.user_id`. Creating a user and registering it as the owner are separate steps.
- **Invalid login credentials:** Use the email/password of the Auth user, not the database or dashboard password.
- **Policy/function not found:** Check the complete SQL schema ran successfully in the same project named by the Vercel URL.
- **Failed to fetch:** Check connectivity, correct project URL and whether Supabase paused the free project. Resume the project if needed.
- **45 MB limit:** Download your original video, compress it or split your next recording into shorter updates, and add the smaller copy. The original remains on the device.
- **Storage quota reached:** Download backups, delete unneeded cloud files through the app and sync. Do not assume a paid upgrade fits the ₹500/month budget.
- **Conflict:** Open Account settings → Review conflict, download both versions if useful, then choose the one to keep. Sync again.
- **Changes stay queued:** Keep the app open, select Sync now and read the queue's per-record error. Do not clear browser data.
- **Old interface after deployment:** Close every open tab/app window for this domain, reopen and refresh. Service-worker updates wait for old clients to close.
- **Forgot password:** This release has no email recovery page. Use Supabase's authenticated project administration; do not disable owner access policies or add a shared password to source code.
