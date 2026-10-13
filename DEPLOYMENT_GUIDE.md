# Deploy your engineering portfolio from Windows to GitHub and Vercel

This guide matches the supplied Yash Engineering Website ZIP, version 0.2.0. It takes you from the downloaded ZIP to an HTTPS website and an Android home-screen app.

The package is the complete source of the current browser-local edition. Independent email/password authentication, automatic cross-device sync, Google integration, cloud video storage and expiring private sharing are not implemented. GitHub/Vercel deployment does not turn the local workspace into a secure backend. Private goals and recordings remain in the browser in which you save them. See the capability table near the end before using it for important data.

## 1. Install Git and Node.js

Open Windows PowerShell or Windows Terminal. These commands install Git for Windows and the current Node.js LTS release:

```powershell
winget install --id Git.Git -e --source winget
winget install --id OpenJS.NodeJS.LTS -e --source winget
```

Approve the installers if Windows requests permission. Close PowerShell and open a new window so it sees the updated PATH. Check:

```powershell
git --version
node --version
npm.cmd --version
```

Use Node.js 22 or newer. If these programs are already installed and current, skip installation. If Winget is unavailable, use the official installers at https://git-scm.com/download/win and https://nodejs.org/en/download. Keep Git Credential Manager enabled in the Git installer.

This guide uses `npm.cmd` rather than `npm`, so PowerShell does not need to run the `npm.ps1` wrapper. Do not change your system execution policy just to run these commands.

## 2. Extract the ZIP into a new folder

Save `Yash_Engineering_Website.zip` to your Downloads folder. Run:

```powershell
$zipPath = Join-Path $env:USERPROFILE 'Downloads\Yash_Engineering_Website.zip'
$projectPath = Join-Path $env:USERPROFILE 'Projects\YashEngineeringPortfolio'
if (Test-Path $projectPath) {
    throw 'That project folder already exists. Choose a new folder name to avoid overwriting work.'
}
New-Item -ItemType Directory -Path $projectPath | Out-Null
Expand-Archive -LiteralPath $zipPath -DestinationPath $projectPath
Set-Location $projectPath
Get-ChildItem
```

If your browser used another download name or location, edit `$zipPath` first. The extracted project root contains `package.json`, `vercel.json`, `dist`, `scripts`, `tests`, `README.md`, and this guide. There is no extra wrapper folder in the ZIP.

Do not double-click `index.html`; browser modules, storage and service workers need an HTTP(S) origin.

## 3. Check and preview the website

Run from the extracted project folder:

```powershell
npm.cmd run build
npm.cmd run check
npm.cmd run dev
```

No `npm install` is necessary for local use; the project has no npm dependencies. Open http://localhost:4173 in your browser. The terminal stays busy while the server runs. Press Ctrl+C when finished.

Try the Signal / Field / Lattice controls, a project page, a private draft, and a preview snapshot. Use the footer’s Pause motion button if you prefer a quieter interface. System reduced-motion settings are respected.

Local preview data is separate from data on the eventual Vercel domain. Export important text records and download recordings before moving to another origin or clearing browser data.

## 4. Review the public résumé before publishing

Open `dist/data.js` in VS Code or another plain-text editor. This is where name, institution, CGPA, skills and project entries are defined. The supplied résumé has unconfirmed academic year/graduation information and placeholder contacts, so those placeholders are not displayed as real contact details.

Keep the entry fields and JavaScript punctuation intact. After editing, repeat:

```powershell
npm.cmd run build
npm.cmd run check
```

The existing tests intentionally expect the original résumé values and eight entries. If you legitimately change those facts or add projects, update the corresponding assertions in `tests/check.mjs`. Do not change tests simply to hide an unrelated failure.

Anything in `dist` is a public deployment asset. Do not place marksheets, private exports, passwords, `.env` files, OAuth tokens or private videos there. The ZIP excludes the original downloadable résumé because it contains an enrollment number and unconfirmed details. Use the homepage Print résumé button to generate a PDF of the displayed content.

## 5. Create an empty repository on GitHub

1. Sign in to https://github.com as `yashjoshi1827`.
2. Open https://github.com/new.
3. Set the repository name to `yash-engineering-portfolio`.
4. Choose **Private** initially. A private source repository can still deploy a public Vercel website.
5. Leave **Add a README**, **Add .gitignore**, and **Choose a license** unselected. These instructions assume an empty remote repository.
6. Click **Create repository**.

If that name already exists, choose another new name and substitute it in the remote URL below. Do not overwrite or force-push an existing repository.

## 6. Upload the website using PowerShell

Open PowerShell in your extracted project folder. Set your Git commit identity for this repository. Replace the email placeholder with an email verified on GitHub or your exact GitHub-provided `noreply` address from https://github.com/settings/emails. This commit address does not automatically become your portfolio contact email.

```powershell
Set-Location (Join-Path $env:USERPROFILE 'Projects\YashEngineeringPortfolio')
git init -b main
git config user.name 'Yash Joshi'
git config user.email 'REPLACE_WITH_YOUR_GITHUB_COMMIT_EMAIL'
git add .
git status
git commit -m 'Add engineering portfolio and installable web app'
git remote add origin https://github.com/yashjoshi1827/yash-engineering-portfolio.git
git push -u origin main
```

Before committing, inspect `git status` to confirm only intended source files are staged. Git for Windows may open a browser sign-in through Git Credential Manager. Sign in and authorize your own account. GitHub does not accept your account password as a Git HTTPS password; use the browser flow. Do not put a token into the remote URL.

Refresh the GitHub repository page and confirm that `dist`, `scripts`, `package.json`, and `vercel.json` are present. If your remote name differs, use the exact URL from the new repository’s page.

## 7. Import the GitHub repository into Vercel

1. Open https://vercel.com and sign in with GitHub, or connect GitHub to your existing Vercel account.
2. Choose **Add New → Project** (the exact labels may vary).
3. Import `yashjoshi1827/yash-engineering-portfolio`. If it is missing, adjust the Vercel GitHub integration’s repository access to include this repository.
4. Use the following settings. `vercel.json` already specifies the build and output settings.

| Setting | Value |
|---|---|
| Framework preset | Other |
| Root directory | Repository root (`.`); not `dist` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | Leave the default; there are no package dependencies |
| Node.js | A supported version 22 or newer |
| Environment variables | None for this edition |

5. Click **Deploy**.
6. Open the production URL returned by Vercel. The actual hostname may differ from the repository name.
7. Check the overview, project pages, notes, animation controls and footer install action. Click **Refresh public activity** to test GitHub reads from your device.
8. Use the production URL, rather than a temporary preview deployment URL, as your permanent app origin.

This guide does not require purchasing a domain or enabling a paid integration. Check your Vercel account’s plan and usage conditions before choosing a paid feature. No billing or account configuration is performed by the ZIP.

The source repository’s privacy does not by itself protect the deployed website. Review Vercel’s deployment protection settings according to the audience you want.

## 8. Install it on your Android phone

1. Open the final HTTPS production URL in **Chrome on Android**. Use Chrome directly, not an embedded browser inside another app.
2. Wait for the page to load once while online.
3. Tap **Install app** in the website footer. When the browser offers an installation prompt, confirm it.
4. If no prompt appears, open Chrome’s **⋮** menu and choose **Install app** or **Add to Home screen**. Exact wording depends on the browser/device.
5. Launch **Yash Journal** from your home screen.
6. Allow camera and microphone access only when you choose to record.

This is a PWA, not an APK or Play Store application. Installation availability is browser-controlled. The supplied manifest, icons and service worker support installation, but the app needs to be visited on HTTPS and tested on your phone.

The installed app and the Chrome site usually share storage for the same origin/profile. Your phone and laptop have separate storage. Installation alone does not synchronize drafts, videos or reminders across devices.

For offline testing: open the app online once, create a small test note, close it, enable airplane mode, and reopen it. Check the note before relying on offline use. Camera capture and file quotas vary by device. Keep the screen open during recording; browser storage can be cleared or evicted, so download important recordings.

## 9. Update the deployed website later

After editing the source locally:

```powershell
Set-Location (Join-Path $env:USERPROFILE 'Projects\YashEngineeringPortfolio')
npm.cmd run build
npm.cmd run check
git status
git add .
git commit -m 'Update portfolio content and design'
git push
```

Vercel’s connected GitHub workflow normally creates a new deployment when you push to the configured production branch. Wait for it to finish in Vercel before checking the site. Refresh the browser; for an installed app, close and reopen it if a new service worker is waiting. Export data before using any browser option that clears site storage.

## 10. Publish approved notes and announcements for everyone

The workspace’s **Publish to preview** action changes only the local browser preview. To deploy approved text content to all visitors:

1. Save the draft, review it, and click **Publish to preview**. Do this only for entries you intend to publish.
2. Open **Setup & export → Export text records**. Save `yash-journal-text-export.json` outside the repository, such as Downloads. This export contains private drafts and goals as well as public snapshots.
3. From the project folder, run:

```powershell
$exportPath = Join-Path $env:USERPROFILE 'Downloads\yash-journal-text-export.json'
node scripts/publish-content.mjs $exportPath
git diff -- dist/published-content.json
npm.cmd run build
npm.cmd run check
git add dist/published-content.json
git commit -m 'Publish approved journal snapshots'
git push
```

The script extracts only the approved snapshots of logs, notes and announcements. It excludes private drafts, goals, file metadata and binary attachments. It uses the frozen snapshot even if you have since edited the draft. Review the generated JSON/diff before the commit.

The script replaces the complete published text set. Use a complete master export; do not run it from a partial or empty workspace if you intend to retain older publications. Keep exports backed up outside Git, and transfer/import the master export when moving to a new device. Unpublishing and rerunning this process removes an entry from the next deployed snapshot set; prior downloaded copies and Git history are not erased automatically.

Images, private reports and recorded videos are not published by this script. The production backend and controlled cloud media delivery are later work.

## 11. Current capability boundaries

| Capability | Included behaviour |
|---|---|
| Public portfolio | Deployed static résumé, projects and approved text snapshots |
| Vibrant animations | Native Canvas, CSS and Web Animations; no external animation runtime |
| Android app | Installable PWA shell, subject to browser/device support |
| Logs and notes | Saved locally; visual/Markdown editing and snapshot review |
| Goals | Private local records, in-app due status, calendar export |
| Announcements | Local drafts; deploy approved text snapshots through Git |
| Camera | Browser recording implementation; actual device testing required |
| GitHub | On-demand public repository and recent commit reads; rate limits apply |
| Admin login | Not implemented; local workspace is not an authenticated admin service |
| Cloud sync | Not implemented; Vercel serves files and does not save local workspace data |
| Google Drive/Photos | Not connected |
| Private sharing | Expiring/revocable protected links not implemented |
| Push/email reminders | Not implemented; calendar export is available |

Visitors cannot edit deployed portfolio files without access to your repository/deployment. They can open their own browser-local workspace; that is not your account or your stored data. Anyone using your unlocked browser may see its local workspace. For an authenticated multi-device personal vault, the independent login, authorization and database/storage backend still need to be implemented and configured.

## 12. Common problems

**`npm.ps1 cannot be loaded`:** use `npm.cmd` as shown. If your PowerShell profile itself errors, you can open a clean shell with `powershell.exe -NoProfile`; this does not require changing execution policy.

**Git/Node is not recognized:** close and reopen the terminal after installation. Check the official installer and PATH options if necessary.

**`remote origin already exists`:** inspect `git remote -v`. Only if it points to the wrong repository, run `git remote set-url origin https://github.com/yashjoshi1827/yash-engineering-portfolio.git` using your correct URL.

**Push rejected because the remote already has commits:** do not force-push. The safest route for this initial upload is a new empty repository. For an existing repository, clone it into a separate folder and copy the website source into that checkout after reviewing its current contents.

**Vercel 404 or empty deployment:** confirm the root is the repository root and output is `dist`. Review the build log. The app uses hash routes, so no catch-all SPA rewrite is required.

**GitHub activity cannot load:** check connectivity and the exact profile URL. Public unauthenticated API requests have rate limits. Failure does not imply there are no repositories. The website displays the returned error rather than inventing activity.

**Install option is missing:** use Chrome on Android, the HTTPS production URL, and its menu. Avoid incognito and embedded browsers. Installation UI timing is browser-controlled.

**Camera fails:** check site permissions and another camera application. Use Upload an existing video as a fallback. A desktop localhost preview can access camera APIs, but opening the site from a phone over a plain HTTP LAN address may not.

**Old design remains after deployment:** refresh while online, close all app tabs/windows, and reopen. Do not clear site data without exporting your local records and downloading attachments first.

## Official references checked 13 October 2026

- GitHub remotes: https://docs.github.com/en/get-started/git-basics/about-remote-repositories
- Vercel GitHub deployment: https://vercel.com/docs/git/vercel-for-github
- Vercel build settings: https://vercel.com/docs/builds/configure-a-build
- Vercel project configuration: https://vercel.com/docs/project-configuration
- PWA installation: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- Install prompt: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event

The code was checked without a browser in the build environment. Responsive layout, installation, camera capture and offline storage must still be verified on your Windows and Android devices.
