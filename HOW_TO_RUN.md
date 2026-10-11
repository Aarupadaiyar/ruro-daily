# 🚀 How to Run Ruro Daily — Local Development Guide

> **Last updated:** 2026-07-04
> **Stack:** Next.js 15 · React 19 · TypeScript · Prisma · PostgreSQL · NextAuth v5 · Tailwind CSS

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone the Repository](#2-clone-the-repository)
3. [Install Dependencies](#3-install-dependencies)
4. [Set Up Environment Variables](#4-set-up-environment-variables)
5. [Set Up the Database](#5-set-up-the-database)
6. [Run the Development Server](#6-run-the-development-server)
7. [Optional: Seed the Database](#7-optional-seed-the-database)
8. [Optional: Run the Scraper Manually](#8-optional-run-the-scraper-manually)
9. [Optional: Open Prisma Studio](#9-optional-open-prisma-studio)
10. [All Available Scripts](#10-all-available-scripts)
11. [Environment Variables Reference](#11-environment-variables-reference)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites

Make sure the following are installed on your machine **before** proceeding:

| Tool | Minimum Version | Download |
|------|----------------|---------|
| **Node.js** | v18+ (v20 LTS recommended) | https://nodejs.org |
| **npm** | v9+ (ships with Node.js) | — |
| **PostgreSQL** | v14+ | https://www.postgresql.org/download/ |
| **Git** | Any recent version | https://git-scm.com |

> **Tip:** You can use [Neon](https://neon.tech) (free tier) as a cloud PostgreSQL database instead of running Postgres locally — just swap in the Neon connection string as your `DATABASE_URL`.

---

## 2. Clone the Repository

```bash
git clone https://github.com/Aarupadaiyar/ruro-daily.git
cd ruro-daily
```

---

## 3. Install Dependencies

```bash
npm install
```

This installs all packages listed in `package.json` into a local `node_modules/` folder.

---

## 4. Set Up Environment Variables

Copy the example file and fill in your real values:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Now open `.env` and fill in every value. See the full reference in [Section 11](#11-environment-variables-reference) below.

### Minimum required values to get the app running locally:

```env
# Your local or cloud PostgreSQL connection string
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/trafy_intelligence"

# Must match the URL you run the app on
NEXTAUTH_URL="http://localhost:3000"

# Generate a random secret:  openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"

# Your email address — this grants you access to /admin
ADMIN_EMAILS="you@example.com"

# Public site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Generating `NEXTAUTH_SECRET`

Run this in your terminal:

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Max 256) }))
```

Paste the output as the value of `NEXTAUTH_SECRET` in your `.env`.

---

## 5. Set Up the Database

### Option A — Local PostgreSQL

1. Make sure PostgreSQL is running locally.
2. Create the database:

```sql
-- Run in psql or any SQL client
CREATE DATABASE trafy_intelligence;
```

3. Push the Prisma schema to your database:

```bash
npm run db:push
```

This creates all the tables defined in `prisma/schema.prisma`.

### Option B — Neon (Cloud, Recommended for Quick Start)

1. Sign up at https://neon.tech (free tier available).
2. Create a new project and copy the **connection string**.
3. Paste it as `DATABASE_URL` in your `.env`.
4. Run:

```bash
npm run db:push
```

### Generate the Prisma Client

After pushing the schema, generate the typed Prisma client:

```bash
npm run db:generate
```

> **Note:** `db:push` typically auto-triggers `db:generate`, but run it manually if you see Prisma import errors.

---

## 6. Run the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

The admin panel is at **http://localhost:3000/admin** — only emails listed in `ADMIN_EMAILS` can log in.

---

## 7. Optional: Seed the Database

To populate the database with initial data (categories, sources, etc.):

```bash
npm run db:seed
```

This runs `prisma/seed.ts`.

---

## 8. Optional: Run the Scraper Manually

To manually trigger the content scraper (fetches articles from configured sources):

```bash
npm run scrape:manual
```

> **Note:** Some sources require API keys (`GITHUB_TOKEN`, `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`). The scraper will skip sources whose keys are missing.

---

## 9. Optional: Open Prisma Studio

Prisma Studio is a visual database browser — great for inspecting and editing your data:

```bash
npm run db:studio
```

This opens a browser tab at **http://localhost:5555**

---

## 10. All Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the local development server at http://localhost:3000 |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server (requires `build` first) |
| `npm run lint` | Run ESLint across the project |
| `npm run db:generate` | Regenerate the Prisma Client from schema |
| `npm run db:push` | Push schema changes directly to the database (no migration files) |
| `npm run db:migrate` | Create a new migration file and apply it (use in production) |
| `npm run db:studio` | Open Prisma Studio at http://localhost:5555 |
| `npm run db:seed` | Seed the database with initial data |
| `npm run scrape:manual` | Manually run the content scraper |

---

## 11. Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `NEXTAUTH_URL` | ✅ Yes | Full URL of the app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | ✅ Yes | Random secret for signing auth tokens |
| `ADMIN_EMAILS` | ✅ Yes | Comma-separated list of admin email addresses |
| `NEXT_PUBLIC_SITE_URL` | ✅ Yes | Public site URL (used in links, OG tags, etc.) |
| `RESEND_API_KEY` | ⚠️ For email | API key from [Resend](https://resend.com) for sending digest emails |
| `DIGEST_FROM_EMAIL` | ⚠️ For email | Sender address for newsletter emails |
| `CRON_SECRET` | ⚠️ For cron | Secret sent in `Authorization: Bearer` header by Vercel Cron |
| `ARXIV_API_BASE` | Optional | ArXiv API base URL (default: `http://export.arxiv.org/api/query`) |
| `GITHUB_TOKEN` | Optional | GitHub personal access token for scraping GitHub sources |
| `REDDIT_CLIENT_ID` | Optional | Reddit API client ID |
| `REDDIT_CLIENT_SECRET` | Optional | Reddit API client secret |

---

## 12. Troubleshooting

### ❌ `Cannot find module '@prisma/client'`
Run `npm run db:generate` to regenerate the Prisma Client.

### ❌ `Database connection failed`
- Check that PostgreSQL is running.
- Verify `DATABASE_URL` in your `.env` is correct (host, port, user, password, db name).
- If using Neon, ensure `?sslmode=require` is appended to the URL.

### ❌ `NEXTAUTH_SECRET` error on login
Make sure `NEXTAUTH_SECRET` is set in `.env` and is at least 32 characters long.

### ❌ Admin panel says "Access Denied"
Your logged-in email is not in the `ADMIN_EMAILS` list in `.env`. Add it and restart the dev server.

### ❌ `Port 3000 already in use`
Either stop the other process or run on a different port:
```bash
# Windows PowerShell
$env:PORT=3001; npm run dev

# macOS / Linux
PORT=3001 npm run dev
```

### ❌ 36,000+ files showing in git status
The `.gitignore` is now configured to exclude `node_modules/`, `.next/`, `.env`, and other generated files. If files were already tracked, run:
```bash
git rm -r --cached node_modules
git rm -r --cached .next
git add .
git commit -m "fix: remove tracked build artifacts"
```
