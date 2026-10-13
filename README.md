# Yash Engineering Portfolio

A portable static website and installable browser app, version 0.2.0. See `DEPLOYMENT_GUIDE.md` for complete Windows PowerShell, GitHub, Vercel and Android instructions.

## Start

Install Node.js 22 or newer. No npm dependencies are needed.

```powershell
node --version
npm.cmd run build
npm.cmd run check
npm.cmd run dev
```

Open http://localhost:4173. Deploy `dist` using the supplied `vercel.json`.

## Included

- Responsive dark portfolio, complete displayed résumé, and eight project/learning pages.
- Interactive signal, parametric field and lattice visualisations; native Web Animations, Canvas and CSS motion.
- Reduced-motion support, pause control, touch-aware interactions and viewport-limited canvas animation.
- Guided project logs, visual/Markdown notes, snapshots, files, camera recording, private goals and announcement drafts.
- Calendar reminder export and text export/import.
- Public GitHub repository/commit reads on demand.
- PWA manifest, install assistance and offline app-shell cache.
- Script to extract only approved text snapshots for static publication through Git.

## What this edition does not provide

The local workspace is not an authenticated admin service. Anyone can open the application code and use a separate local workspace in their own browser; they cannot alter your deployed files without repository/deployment access. Local drafts/media are not sent to other browsers, but anyone with access to your unlocked browser may access its local records.

Independent email/password login, automatic cross-device sync, Google Drive/Photos connections, cloud media upload, protected expiring links and reliable background push/email reminders are not implemented in this edition. Deploying on Vercel or installing the PWA does not enable them. These require a configured backend and further integration work. Do not treat this edition as an authenticated private document vault.

The user can publish text snapshots by exporting, running `publish-content.mjs`, reviewing its output and pushing a Git commit. Media remains local unless added to the deployment source deliberately.

## Source layout

- `dist/data.js`: résumé, skills and project information.
- `dist/app.js`: portfolio/workspace interface and browser storage.
- `dist/style.css`, `dist/vibrant.css`: layout and visual design.
- `dist/motion.js`: interactive technical visuals and install controls.
- `dist/github.js`: token-free public GitHub reads.
- `dist/published-content.json`: approved deployed text snapshots.
- `dist/sw.js`, `manifest.webmanifest`, `icon-*`: PWA shell.
- `scripts/`: build checks, local server and publication export.
- `tests/`: content, escaping and publication isolation checks.

There is no `.git` history, hosting credential, account token or password in the distributable ZIP. An original résumé containing unconfirmed dates and placeholder contacts is not exposed as a downloadable public asset; the homepage has a print-to-PDF action.

## Content review

Year/date and public contact details still need confirmation. CGPA 7.97 and project dates are shown as supplied in the résumé. GitHub profile URL was provided by the owner; live API responses were not verified in this build environment.

## Verification

Build checks and tests passed. Browser visual QA was unavailable under the managed environment rules. Camera, IndexedDB, installation, offline operation and real API responses still require Windows/Android testing.

The visual system is original and inspired by technical, motion-rich interfaces. It does not bundle or require Anime.js.
