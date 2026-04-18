# Deploy ItineraryApp (beginner path)

This guide uses **Railway** (database + API) and **Vercel** (website). You only need a browser, a **GitHub** account, and your API keys. Follow the steps in order; do not skip around.

If you get stuck on a step, stop and fix that step before moving on.

---

## 0. Put your code on GitHub

1. Go to [github.com](https://github.com) and sign in.
2. Click **New repository**. Name it (e.g. `itineraryapp`). Create it **without** README (empty repo is fine).
3. On your Mac, open Terminal and run (replace `YOUR_USER` and `YOUR_REPO`):

```bash
cd /Users/aditya/itineraryapp/ItineraryApp
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

If `git` says the folder is already a repo, use `git remote -v` and `git push` instead of `git init`.

You need the repo to contain **`backend/`** and **`frontend/`** at the top level (as in this project).

---

## 1. Railway — Postgres database

1. Open [railway.app](https://railway.app) and sign up (you can use “Login with GitHub”).
2. **New project** → **Empty project**.
3. Click **Create** or **+ New** → **Database** → **PostgreSQL**.
4. Wait until Postgres shows as **Running**.
5. Click the **Postgres** service → **Variables** tab.
6. Find **`DATABASE_URL`** (Railway creates it). **Copy** the whole value (starts with `postgresql://`).

You do **not** need to edit this URL for this app: the backend automatically switches it to the async driver it expects.

---

## 2. Railway — API (Docker)

1. In the **same Railway project**, click **+ New** → **GitHub Repo** → choose the repo you pushed in step 0.
2. After the service is created, click it → **Settings**:
   - **Root Directory**: set to `backend` (exactly this folder name in your repo).
   - **Builder**: should detect **Dockerfile**; if there is a choice, pick Docker.
3. **Variables** tab on **this API service** (not Postgres). Click **+ New Variable** and add each row:

| Name | What to put |
|------|-------------|
| `DATABASE_URL` | **Reference** the Postgres variable: in Railway, use “Variable Reference” and pick `DATABASE_URL` from the Postgres service (so it stays in sync). If you prefer paste, paste the copied URL from step 1. |
| `JWT_SECRET` | Any long random string (e.g. open Terminal: `openssl rand -hex 32` and paste the output). |
| `GOOGLE_GEMINI_API_KEY` | Your Gemini key. |
| `DEMO_MODE` | `false` (unless you want demo data). |
| `CORS_ORIGINS` | Leave **empty** for your first deploy if you will use a **\*.vercel.app** URL. The API already allows `https://*.vercel.app` in code. If you use a **custom domain** (e.g. `https://trips.example.com`), set this to that full URL (no trailing slash). |

Optional keys (only if you use them):

| Name | Purpose |
|------|---------|
| `TICKETMASTER_API_KEY` | Live events |
| `MAPBOX_ACCESS_TOKEN` | Optional; routing falls back without it |
| `YELP_API_KEY` | Optional dining |
| `AMADEUS_CLIENT_ID` / `AMADEUS_CLIENT_SECRET` | Optional hotels |

4. **Settings** → **Networking** → **Generate domain** (or **Public URL**). Copy the HTTPS URL, e.g. `https://something.up.railway.app`. This is your **API base URL**.

5. Railway will **redeploy** when you save variables. Wait until the deploy log shows the server running (no crash loop).

6. **Sanity check**: open `https://YOUR-API-HOST/health` in a browser. You should see JSON like `{"status":"ok"}`.

If deploy fails, open **Deployments** → latest → **Logs**. Common issues: wrong **Root Directory** (`backend`), or **`DATABASE_URL`** missing.

---

## 3. Vercel — website (Next.js)

1. Open [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New…** → **Project** → **Import** your GitHub repo.
3. Before you click Deploy, open **Configure Project**:
   - **Root Directory**: set to `frontend` (click Edit).
   - **Framework Preset**: Next.js (default).
4. **Environment Variables** → add:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | Your Railway API URL from step 2, **no** trailing slash, e.g. `https://something.up.railway.app` |

5. Click **Deploy**. Wait for “Ready”.
6. Vercel will show a URL like `https://your-project.vercel.app`. Open it.

---

## 4. First test in production

1. On your Vercel URL, try **Sign up** / **Log in**.
2. Create a short trip from the dashboard.

If the page says it cannot reach the API:

- Confirm **`NEXT_PUBLIC_API_URL`** on Vercel is exactly the Railway HTTPS URL.
- On Vercel, **Redeploy** after changing env vars (they are baked in at build time for `NEXT_PUBLIC_*`).

If the browser console shows **CORS** errors and your site is **not** on `*.vercel.app`, set **`CORS_ORIGINS`** on Railway to your exact frontend origin (e.g. `https://trips.example.com`) and redeploy the API.

---

## 5. What we already did in code for you

- **Tables**: On each API container start, `create_tables.py` runs once, then **uvicorn** starts (see `backend/Dockerfile`).
- **Postgres URL**: Railway’s `postgresql://…` is converted to **`postgresql+asyncpg://…`** automatically (`backend/app/config.py`).
- **Vercel CORS**: **`https://*.vercel.app`** is allowed by regex so you usually do not need `CORS_ORIGINS` for the default Vercel hostname.

---

## 6. Custom domain (optional, later)

1. Add the domain in **Vercel** → Project → **Domains**.
2. In **Railway** API variables, set **`CORS_ORIGINS`** to `https://your-custom-domain` (no path, no trailing slash). Redeploy API.

---

## 7. Security reminders

- Never commit **`.env`** files with real keys.
- Rotate any key that was ever pasted into chat or a ticket.
- `JWT_SECRET` must be long and random in production.

---

## Who to ask next

If you paste **Railway deploy logs** (last 30 lines) or **Vercel build logs** (error section only, no secrets), someone can pinpoint the next click. Your keys and `DATABASE_URL` should stay private.
