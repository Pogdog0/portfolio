# PogDog — Roblox Portfolio Template

This is PogDog's clean copy of the original portfolio: the same page structure, animations, project filters, case-study layout, contact form, and admin preview, with a blue theme and PogDog's profile picture.

The visible project names, metrics, specialties, testimonials, links, timezone, and case-study text are intentionally placeholders. Replace them with real information before publishing. Do not reuse another developer's projects, earnings, testimonials, contact links, or performance claims.

## 1. Requirements

- Node.js 22.13 or newer
- pnpm 10 or newer (recommended), or npm
- Git
- A Vercel, Cloudflare, or OpenAI Sites account only when you are ready to host

## 2. First local setup

Open a terminal in this folder and run:

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

If using npm:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open the local address printed by the development server, normally `http://localhost:3000`.

Important routes:

- `/` — public portfolio
- `/work/featured-project` — editable case-study template
- `/admin` — protected admin preview
- `/admin/login` — admin sign-in

## 3. Where to edit the portfolio

Most public content is in `components/Portfolio.tsx`:

- `projects` — cards, screenshots, tags, roles, dates, results, and optional video links
- `metrics` — experience and outcome numbers
- `skillBadges`, `bugs`, `services`, `skills`, and `workflow` — capability sections
- `testimonials` — only add real, approved testimonials
- `discordUrl` — PogDog's real Discord profile or contact URL
- hero, contact, footer, timezone, availability, and response-time copy

Other important files:

- `app/globals.css` — colors, spacing, effects, responsiveness, and animation
- `app/layout.tsx` — title, description, canonical URL, social metadata, and structured data
- `app/work/[slug]/page.tsx` — full featured case study
- `components/AdminDashboard.tsx` — seeded admin-preview content
- `public/images/projects/` — project screenshots
- `public/images/profile/pogdog.png` — current PogDog profile picture
- `public/favicon.svg` — browser icon
- `app/robots.ts` and `app/sitemap.ts` — search-engine URLs

The main theme tokens are at the top of `app/globals.css`. Change `--signal` and `--signal-soft` first when restyling; most accent elements inherit them.

## 4. Replace images safely

Keep image paths inside `public/`. For example:

```text
public/images/projects/my-game.webp
```

Then reference the image as:

```ts
image: "/images/projects/my-game.webp"
```

Use optimized `.webp`, `.jpg`, or `.png` files. Give every meaningful image honest context in the surrounding text. Do not upload private client assets without permission.

## 5. Private credentials and `.env.local`

Never put passwords, tokens, database credentials, API keys, or private URLs directly into source files. Never commit `.env.local`. This repository's `.gitignore` already ignores all `.env*` files; `.env.example` is the safe public template.

Create secure admin values with:

```powershell
node scripts/generate-admin-secrets.mjs "choose-a-strong-password"
```

Copy the two printed values into `.env.local`, then set the admin email:

```dotenv
ADMIN_EMAIL="pogdog@example.com"
ADMIN_PASSWORD_HASH="paste-the-generated-pbkdf2-value"
AUTH_SECRET="paste-the-generated-random-secret"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Rules:

- Keep `ADMIN_PASSWORD_HASH` and `AUTH_SECRET` server-only. Never prefix them with `NEXT_PUBLIC_`.
- Use a unique admin password that is not used anywhere else.
- Use different secrets for local, preview, and production environments.
- Rotate a secret immediately if it appears in Git history, a screenshot, chat, build log, or public deployment.
- Hosting dashboards should store the real values; Git should contain only placeholder names in `.env.example`.

The optional variables in `.env.example` are for future database, upload, and contact-form work. Do not add a real upload token until an upload provider is actually connected.

## 6. Admin and contact-form status

The admin login is server-protected when `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and `AUTH_SECRET` are configured. The dashboard editing controls are still a UI template; they do not yet save project changes to the database.

The public contact form is also a demo. It shows a success state in the browser but does not send email or permanently store an enquiry. Before production, connect it to a server route or form provider and add:

- server-side validation
- rate limiting
- honeypot checking
- CSRF protection where applicable
- safe database storage or an email provider
- a privacy notice if personal data is collected

Do not describe either feature as fully operational until it is wired and tested.

## 7. Database and media setup (optional)

The project includes a Drizzle/SQLite-compatible schema in `db/schema.ts`, plus D1 and R2 binding names in `.openai/hosting.json`.

If persistent admin editing is needed:

1. Create a separate development database.
2. Review `db/schema.ts` and remove tables you do not need.
3. Run `pnpm db:generate` to generate migrations.
4. Inspect every generated migration before applying it.
5. Connect server queries to the database binding.
6. Seed one admin user with the same email/hash configured in the host.
7. Test login, session expiry, CRUD permissions, and unauthorized access.
8. Back up production data before future schema migrations.

For media uploads, connect the `MEDIA` R2 binding or another provider. Validate file type and size on the server, generate unique object names, and keep write tokens server-side.

## 8. Quality checks before hosting

Run:

```powershell
pnpm run build
node --test tests/rendered-html.test.mjs
```

Before launch, also check:

- desktop and mobile layouts
- every navigation, project, Discord, Roblox, and video link
- the featured case-study route
- keyboard focus and reduced-motion behavior
- no placeholder text such as `ADD`, `Replace`, `00`, or `your_discord`
- no copied claims, testimonials, IDs, URLs, or private assets
- no secrets in tracked files: `git diff -- . ':!pnpm-lock.yaml' ':!package-lock.json'`

## 9. Git and GitHub setup

This clone intentionally has no copied `.git` history. From this folder:

```powershell
git init
git add .
git commit -m "Initial PogDog portfolio template"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

Create the GitHub repository first. Prefer a private repository while personal details, unfinished claims, or credentials are being configured.

## 10. Vercel hosting

1. Push the folder to its own GitHub repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Keep the detected framework/build settings unless Vercel reports a real compatibility problem.
4. Add production environment variables from `.env.example` in **Project Settings → Environment Variables**. Paste real secret values there, never into Git.
5. Set `NEXT_PUBLIC_SITE_URL` to the final `https://` domain.
6. Deploy and wait for the deployment to finish successfully.
7. Test `/`, `/work/featured-project`, `/admin/login`, and `/admin` on the deployed domain.
8. After changing the final domain, redeploy so metadata, sitemap, and structured data use the correct URL.

If using a custom domain, add it in Vercel first, then copy exactly the DNS records Vercel shows into the domain registrar. DNS changes can take time. Do not delete working records until the replacement is verified.

## 11. OpenAI Sites hosting

`.openai/hosting.json` contains only the logical D1 and R2 binding names. It deliberately has no copied `project_id`, so this clone cannot overwrite the original portfolio's Site.

When creating a separate Site for PogDog:

1. Register a new Site from this folder using the Sites publishing workflow.
2. Save the new `project_id` returned for PogDog into `.openai/hosting.json`.
3. Keep any source write credential outside the repository and environment files shown to the client.
4. Run the production build.
5. Save a new version, deploy that exact version, and verify the deployed URL.
6. Add production secrets through the Sites environment/secret controls.

Never paste the original portfolio's project ID or credentials into this clone.

## 12. Cloudflare hosting

This project uses a Vinext/Vite worker entrypoint and includes D1/R2-ready bindings. For a direct Cloudflare deployment:

1. Create a separate Cloudflare project for PogDog.
2. Create dedicated D1 and R2 resources only if the portfolio will actually use them.
3. Bind D1 as `DB` and R2 as `MEDIA`.
4. Add secrets with Cloudflare's secret/environment controls.
5. Build and deploy the generated Worker/static assets.
6. Test routes, assets, login cookies, and binding access on the production domain.

Do not reuse another site's D1 database, R2 bucket, account token, or project ID.

## 13. Custom domain and DNS checklist

- Decide the canonical domain, such as `pogdog.dev` or `portfolio.example.com`.
- Add the domain to the chosen host before changing DNS.
- Copy only the DNS records the host provides.
- Enable HTTPS and wait for the certificate to become active.
- Set `NEXT_PUBLIC_SITE_URL` to the exact canonical `https://` URL with no trailing path.
- Redirect alternate domains (`www` vs apex) to one canonical version.
- Confirm `/robots.txt` and `/sitemap.xml` contain the production domain.
- Update Discord/Roblox/social profiles only after the production URL is verified.

## 14. Final launch checklist

- [ ] PogDog approved the public name, profile picture, biography, links, and contact details.
- [ ] Every project includes accurate role, period, contribution, collaborators, and result.
- [ ] All placeholder metrics and testimonials were replaced or removed.
- [ ] Client/NDA material is cleared for public use.
- [ ] Contact form behavior is described honestly and tested.
- [ ] Admin credentials are unique and stored only in the host's secret manager.
- [ ] Production database/media resources are separate from all other portfolios.
- [ ] Build and rendered HTML tests pass.
- [ ] Mobile, desktop, keyboard, and reduced-motion checks pass.
- [ ] The final domain, metadata, sitemap, robots file, and structured data agree.
- [ ] A clean Git commit exists and no secret is present in tracked files or history.

Once these boxes are complete, PogDog can safely restyle the template without changing the hosting or security setup.
