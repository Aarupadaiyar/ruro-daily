# Deploying to Vercel (free Hobby plan)

## 1. Push this project to GitHub
Vercel deploys from a Git repo — it doesn't take a raw zip upload.

```bash
cd ruro-daily
git init
git add .
git commit -m "Initial commit"
```

Create a new empty repo on GitHub (github.com/new — don't initialize it with a README), then:

```bash
git remote add origin https://github.com/<your-username>/ruro-daily.git
git branch -M main
git push -u origin main
```

## 2. Import the project in Vercel

1. Go to https://vercel.com → sign up free with your GitHub account (no card needed)
2. **Add New** → **Project** → select the `ruro-daily` repo → **Import**
3. Framework preset should auto-detect as **Next.js** — leave build settings as default

Don't click Deploy yet — add the environment variables first (next step), otherwise the first build will fail with missing `DATABASE_URL` etc.

## 3. Add environment variables

In the import screen (or later under **Project → Settings → Environment Variables**), add every variable from your `.env`, with two changes for production:

```
NEXTAUTH_URL=https://<your-project-name>.vercel.app
NEXT_PUBLIC_SITE_URL=https://<your-project-name>.vercel.app
```

(You'll know the exact `.vercel.app` URL after the first deploy — it's fine to deploy once, then come back and correct these two, then redeploy.)

Everything else (`DATABASE_URL`, `RESEND_API_KEY`, `ADMIN_EMAILS`, `CRON_SECRET`, `GITHUB_TOKEN`, `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `NEXTAUTH_SECRET`) — paste in exactly what you have locally.

## 4. Push the database schema to your live Postgres

Do this from your local machine, pointed at the same `DATABASE_URL` you gave Vercel — Vercel doesn't run migrations for you automatically.

```bash
npm run db:push
SEED_OWNER_EMAIL=aarupadaiyarjeyapal@gmail.com npm run db:seed
```

## 5. Deploy

Click **Deploy** in Vercel (or just `git push` again if you already deployed once). Once it's live:

- Public site: `https://<your-project-name>.vercel.app/intelligence`
- Admin: `https://<your-project-name>.vercel.app/admin/login`

## 6. Cron job — already free-tier safe

`vercel.json` defines one daily cron:
```json
{ "crons": [{ "path": "/api/cron/scrape", "schedule": "0 7 * * *" }] }
```
This is fully within Hobby's limits (1 run/day). It scrapes all sources **and** sends the admin digest in the same request — see the note in `src/app/api/cron/scrape/route.ts` for why they're chained instead of run as two separate crons.

Vercel adds the `Authorization: Bearer <CRON_SECRET>` header automatically when it calls this route — you don't need to configure that part.

## 7. Test it manually before waiting for 7 AM

Once deployed, trigger a run yourself from a terminal (replace both placeholders):

```bash
curl -H "Authorization: Bearer <your CRON_SECRET>" https://<your-project-name>.vercel.app/api/cron/scrape
```

You should get back a JSON summary, and — if `ADMIN_EMAILS` and `RESEND_API_KEY` are set — a digest email shortly after.

## Notes on the free Hobby plan

- Non-commercial use only, per Vercel's Hobby terms — fine for a personal/portfolio project, but if this becomes a real commercial product you'd need Pro ($20/mo).
- 1M function invocations, 100GB bandwidth, 4 hours of active CPU/month — all generous enough for a small site like this.
- Function timeout on Hobby caps at 60s (`maxDuration` is already set to 60 in the scrape route) — if you add many more sources later and a run starts timing out, split `runFullScrape()` into batches rather than upgrading for this alone.
