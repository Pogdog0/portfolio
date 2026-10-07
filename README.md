# PogDog Portfolio

A Roblox systems engineering portfolio built with Next.js 16, React 19, and Tailwind CSS 4.

## Run locally

Requirements: Node.js 22.13 or newer and npm.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open the local URL printed by Next.js, usually `http://localhost:3000`.

Useful routes:

- `/` — portfolio
- `/work/featured-project` — case study
- `/admin/login` — admin sign-in
- `/admin` — protected content dashboard

## Configure local admin access

Generate a password hash and signing secret:

```powershell
node scripts/generate-admin-secrets.mjs "use-a-unique-password"
```

Put the generated values in `.env.local` with an admin email:

```dotenv
ADMIN_EMAIL="you@example.com"
ADMIN_PASSWORD_HASH="generated-hash"
AUTH_SECRET="generated-secret"
DATABASE_URL="file:./portfolio.db"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Keep real values out of Git. `.env.local` is ignored; `.env.example` contains placeholders only.

## Project content

Use `/admin` for projects, case studies, images, metrics, services, skills, working principles, contact details, announcements, and SEO settings. Static presentation copy and layout remain in `components/Portfolio.tsx` and `app/work/[slug]/page.tsx`.

The current project names, metrics, and sample case study content are placeholders. Replace them with accurate, approved work before making the site public. Do not publish private client work, invented results, or testimonials without approval.

The admin dashboard is connected to the public portfolio. It supports project and case-study CRUD, draft/published visibility, featured-project selection, ordering, editable metrics/services/skills/principles/settings, image uploads, and an enquiry inbox. Content and enquiries are persisted in the SQLite file configured by `DATABASE_URL`.

Uploaded media is stored in `public/uploads` and indexed in the content database. Both the SQLite file and uploaded-media directory are ignored by Git; back them up with the rest of the site data.

## Configure contact delivery

1. Create a Resend account using the inbox that should receive enquiries.
2. Create an API key and add `RESEND_API_KEY` to the local `.env.local` and Vercel Production environment.
3. Set `CONTACT_TO_EMAIL` to the inbox that should receive submissions.
4. The default sender is `Pogdog Portfolio <onboarding@resend.dev>`, intended for testing to the account's own verified inbox. For general delivery, verify a domain in Resend and set `CONTACT_FROM_EMAIL` to an address on that domain.

The form always stores a valid submission in the admin inbox. When Resend is configured, it also emails the configured recipient; if delivery is unavailable, the saved enquiry remains available in the dashboard. Visitors can be contacted directly from the inbox.

## Deploy

1. Deploy to a Node.js host with a persistent writable volume for the SQLite database and `public/uploads`.
2. Add `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `AUTH_SECRET`, `DATABASE_URL`, and `NEXT_PUBLIC_SITE_URL` as production environment variables. Use a unique production password and a new secret.
3. Add `RESEND_API_KEY` and `CONTACT_TO_EMAIL`; add `CONTACT_FROM_EMAIL` after verifying a sender domain.
4. Back up the database and uploads volume, then check `/`, a published `/work/[slug]` page, `/admin/login`, and `/admin`.

Vercel can run the public site, but its serverless filesystem is not durable. On Vercel the site safely serves the bundled content and marks the dashboard read-only instead of attempting SQLite writes. Use an external database and object-storage adapter before enabling dashboard edits there.

## Checks

```powershell
npm test
npm run lint
```

`npm test` builds the app before checking the rendered routes.
