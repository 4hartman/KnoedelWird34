# Geschenk-Editor — Setup

The editor is a Vite + React + TypeScript app that talks to Firebase
(project `brave-reason-367609` / "The Perfect Gift").

## One-time Firebase console setup

These steps touch your live Firebase project and must be done once in the
[Firebase console](https://console.firebase.google.com/project/brave-reason-367609):

1. **Firestore** — Build → Firestore Database → *Create database*
   (production mode, region `europe-west`). Stores users' projects.
2. **Authentication** — Build → Authentication → *Get started* → Sign-in method →
   enable **Google** and **Email/Password**.
3. **Storage** — Build → Storage → *Get started* (needed in Phase 3 for image
   uploads).
4. **Authorized domains** — Authentication → Settings → Authorized domains: add
   `localhost` (usually present) and later your hosting domain.

## Deploy security rules

From the repo root (`KnoedelWird34/`):

```bash
firebase deploy --only firestore:rules,storage
```

Rules live in `firestore.rules`, `storage.rules`, and `database.rules.json`.
They enforce owner-only writes, public read of published gifts, and per-slug
voting sessions.

Before first deploy, also enable **Firebase Hosting** in the console (Build →
Hosting → Get started).

## Run the editor locally

```bash
cd editor
npm install
npm run dev      # http://localhost:5173
```

> Note: dependencies install from the InnoGames Artifactory registry configured
> in the global `~/.npmrc` (run `npm login` if you get a 401). This machine's
> `NODE_OPTIONS` also references a missing preload script — until that's removed
> from your shell profile, run npm/node commands with `env -u NODE_OPTIONS npm ...`.

## Build for production

```bash
cd editor
npm run build    # outputs to editor/dist
```

## Deploy (editor + published gifts)

From the repo root (`KnoedelWird34/`):

```bash
bash scripts/build-hosting.sh   # builds editor + assembles public/
firebase deploy                 # hosting + firestore + storage + database rules
```

`build-hosting.sh` produces a single `public/` directory:

- `public/` — the editor SPA (login, projects, editor) → served at the site root
- `public/g/` — the gift runtime → served at `/g/{slug}`

Hosting rewrites (`firebase.json`) send `/g/**` to the runtime and everything
else to the editor SPA. Static assets win over rewrites, so the runtime's
relative asset paths resolve correctly.

After deploy:

- Editor:        `https://brave-reason-367609.web.app/`
- Published gift: `https://brave-reason-367609.web.app/g/{slug}`

> The public origin is set in `editor/src/projects/publishApi.ts`
> (`PUBLIC_ORIGIN`). Update it if you add a custom domain. Subdomains
> (`{slug}.yourdomain.com`) are a future step requiring a domain + wildcard DNS.
