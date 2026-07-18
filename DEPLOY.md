# Deploying to Vercel (production)

This app is a Vite + React SPA backed by Supabase. The `localStorage` mock
client in `src/lib/mockSupabase.js` is **dev-only** — for production you must
connect a real Supabase project so users share persisted data.

## 1. Create a Supabase project
- Go to https://supabase.com/dashboard → **New project**.
- Note the database password.
- Once ready, open **SQL Editor → New query**, paste the **entire** contents of
  `supabase/ALL_MIGRATIONS.sql` (a combined, ordered, idempotent run of every
  file in `supabase/migrations/`) and click **Run**. This creates all tables
  (`profiles`, `deposits`, `stakes`, `transactions`, `launchpad_allocations`,
  `balances`), the `role`/`tier`/`allocation_id` columns, the RLS policies, and
  the `adjust_balance` function. Running the individual migration files one by
  one also works, but the combined file is the single source of truth.

## 2. Get your credentials
- **Project Settings → API**: copy **Project URL** and the **anon public** key.

## 3. Configure auth
- **Authentication → URL Configuration**:
  - Site URL: `https://your-app.vercel.app` (and `https://goblinstocks.com` once the domain is connected)
  - Redirect URLs: add both of the above.
- **Authentication → Providers → Email**:
  - To let users sign in instantly during testing, disable **Confirm email**.
  - For production, keep it enabled and confirm accounts via the emailed link
    (optionally configure SMTP under **Authentication → Providers → Email**).

## 4. Push the code to GitHub
- The repo already gitignores `.env`, so secrets are never committed.
- Push to a GitHub repo you own.

## 5. Deploy on Vercel
- Go to https://vercel.com → **Add New → Project**, import the GitHub repo.
- Vercel auto-detects Vite (build command `vite build`, output `dist`).
- **Important — set Environment Variables** (Project Settings → Environment Variables)
  for the Production environment:
  - `VITE_SUPABASE_URL` = your Project URL
  - `VITE_SUPABASE_ANON_KEY` = your anon public key
- Click **Deploy**. `vercel.json` rewrites all routes to `index.html` so deep
  links like `/dashboard` work (SPA routing).

> The production guard in `src/lib/supabase.js` throws at runtime if these env
> vars are missing, so a build without them fails loudly instead of shipping
> the dev-only mock.

## 6. (Optional) Custom domain `goblinstocks.com`
- Buy the domain from a registrar (Namecheap, Cloudflare Registrar, Squarespace
  Domains, etc., ~$10–15/yr).
- In Vercel: **Project → Settings → Domains**, add `goblinstocks.com`.
- Follow Vercel's DNS instructions (usually add an `A` record to `76.76.21.21`
  or a `CNAME` to `cname.vercel-dns.com`). Vercel provisions free SSL
  automatically.
- Add `https://goblinstocks.com` to Supabase's Site URL and Redirect URLs.

## Local development
- `npm install && npm run dev` → uses the `localStorage` mock automatically
  (no backend needed). Replace `.env` with real creds to use Supabase locally.
