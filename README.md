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
- `/admin` — protected admin preview

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
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Keep real values out of Git. `.env.local` is ignored; `.env.example` contains placeholders only.

## Project content

Edit the portfolio copy, projects, images, and links in `components/Portfolio.tsx`. The case study is in `app/work/[slug]/page.tsx`; site metadata is in `app/layout.tsx`.

The current project names, metrics, and sample case study content are placeholders. Replace them with accurate, approved work before making the site public. Do not publish private client work, invented results, or testimonials without approval.

The admin dashboard is a visual preview and does not save edits. Contact submissions are sent server-side through Resend and are not stored by this app.

## Configure contact delivery

1. Create a Resend account using the inbox that should receive enquiries.
2. Create an API key and add `RESEND_API_KEY` to the local `.env.local` and Vercel Production environment.
3. Set `CONTACT_TO_EMAIL` to the inbox that should receive submissions.
4. The default sender is `Pogdog Portfolio <onboarding@resend.dev>`, intended for testing to the account's own verified inbox. For general delivery, verify a domain in Resend and set `CONTACT_FROM_EMAIL` to an address on that domain.

The form uses a server route, so the Resend key stays private. Visitors can reply directly to the email address they entered in the form.

## Deploy on Vercel

1. Push this folder to a Git repository and import it as a new Vercel project.
2. Add `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and `AUTH_SECRET` as Vercel environment variables. Use a unique production password and a new secret.
3. Set `NEXT_PUBLIC_SITE_URL` to the deployed HTTPS domain.
4. Add `RESEND_API_KEY` and `CONTACT_TO_EMAIL` to Vercel Production; add `CONTACT_FROM_EMAIL` after verifying a sender domain.
5. Deploy, then check `/`, `/work/featured-project`, `/admin/login`, and `/admin`.

Vercel detects the Next.js framework and uses the `build` script in `package.json`.

## Checks

```powershell
npm test
npm run lint
```

`npm test` builds the app before checking the rendered routes.
