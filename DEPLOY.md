# VenuePlus — Deploy in ~30 minutes

The codebase is now deploy-ready. You only need to do the account/click steps.

## 0. One-time prep
1. Create accounts (free): GitHub, Railway (railway.app), Vercel (vercel.com).
2. Install Git if you don't have it.

## 1. Push to GitHub
```bash
cd C:/Users/ejv12/Desktop/VenuPlus/venueplus-complete/venueplus
git init
git add .
git commit -m "Initial VenuePlus build"
# create empty repo on github.com first, then:
git remote add origin https://github.com/<you>/venueplus.git
git branch -M main
git push -u origin main
```

## 2. Deploy backend on Railway
1. Railway → **New Project → Deploy from GitHub repo** → pick `venueplus`.
2. After import: **Settings → Root Directory** = `backend`.
3. Add a Postgres plugin: **+ New → Database → Postgres**. Railway auto-injects `DATABASE_URL`.
4. **Variables** tab — add:
   - `SECRET_KEY` = (run `python -c "import secrets; print(secrets.token_urlsafe(48))"`)
   - `ALLOWED_ORIGINS` = `https://<your-vercel-domain>.vercel.app` (fill in after step 3, or use `*` temporarily)
5. Deploy. When green, copy the public URL (e.g. `https://venueplus-production.up.railway.app`).
6. **Seed the prod DB** — Railway → your service → **⋮ → Run command**:
   ```
   python seed.py
   ```
   (Or run locally with `DATABASE_URL=<railway postgres url> python seed.py`.)

## 3. Deploy frontend on Vercel
1. Vercel → **Add New → Project** → import `venueplus` repo.
2. **Root Directory** = `frontend`.
3. Framework preset: Next.js (auto).
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = the Railway URL from step 2.5
5. Deploy.
6. Copy your `*.vercel.app` URL → go back to Railway → update `ALLOWED_ORIGINS` to that URL → Railway redeploys automatically.

## 4. Smoke test
- Visit your Vercel URL.
- Log in with `alice@example.com` / `password123`.
- Browse venues — should see the 5 seeded venues.
- Try a booking flow.

## 5. Custom domain (optional)
- Vercel → Project → Settings → Domains → add `yourdomain.com`.
- Railway → Settings → Networking → Custom Domain → `api.yourdomain.com`.
- Update `NEXT_PUBLIC_API_URL` and `ALLOWED_ORIGINS` accordingly.

## Troubleshooting
- **CORS error in browser**: `ALLOWED_ORIGINS` on Railway must exactly match your Vercel URL (no trailing slash).
- **`react-leaflet` SSR crash**: Wrap map components with `dynamic(() => import('./Map'), { ssr: false })`.
- **Build fails on Vercel**: run `npm run build` locally in `frontend/` first; fix any TS errors.
- **DB tables missing**: the app calls `Base.metadata.create_all` on startup, but if it raced, hit `/health` once then run `python seed.py` against the prod DB.
