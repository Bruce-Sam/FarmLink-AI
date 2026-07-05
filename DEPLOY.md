# Afuo Market — Production deployment

Follow these steps in order. Steps marked **YOU** require your browser login or DNS access.

---

## Prerequisites

- GitHub repo: `https://github.com/Bruce-Sam/FarmLink-AI.git`
- Supabase project with migrations applied (Session pooler URL for `DATABASE_URL`)
- Render account: https://render.com
- Vercel account: https://vercel.com

---

## Step 1 — Push code to GitHub **YOU**

If the agent already committed, run:

```powershell
cd c:\Users\kingr\Documents\farmlink-ai
git push origin master
```

If push fails (auth), use GitHub Desktop or:

```powershell
gh auth login
git push origin master
```

---

## Step 2 — Deploy backend on Render **YOU**

1. Go to https://dashboard.render.com → **New +** → **Web Service**
2. Connect **GitHub** → select repo `FarmLink-AI`
3. Settings:

   | Field | Value |
   |-------|--------|
   | Name | `afuo-market-api` |
   | Root Directory | `farmlink-backend` |
   | Runtime | **Docker** |
   | Region | **Frankfurt** (near Supabase eu-west-1) |
   | Branch | `master` |
   | Health Check Path | `/health` |
   | Instance type | Free (or Starter $7/mo to avoid cold starts) |

4. **Environment variables** (Environment tab):

   | Key | Value |
   |-----|--------|
   | `NODE_ENV` | `production` |
   | `PORT` | `4000` |
   | `DATABASE_URL` | Supabase **Session pooler** URI (port 5432) |
   | `JWT_ACCESS_SECRET` | Generate: `openssl rand -base64 48` |
   | `JWT_ACCESS_EXPIRES_IN` | `7d` |
   | `CORS_ORIGINS` | `https://YOUR-APP.vercel.app` (update after Step 3) |
   | `LOG_LEVEL` | `info` |
   | `AI_PROVIDER` | `local` |

5. Click **Create Web Service** and wait for deploy (~5–10 min first time).

6. Verify: open `https://afuo-market-api.onrender.com/health`  
   Expect: `"database":"connected"`

---

## Step 3 — Deploy frontend on Vercel **YOU**

1. Go to https://vercel.com/new
2. Import `Bruce-Sam/FarmLink-AI` from GitHub
3. Root Directory: `.` (repo root), Framework: Next.js

4. **Environment variables** (Production):

   | Key | Value |
   |-----|--------|
   | `NEXT_PUBLIC_API_URL` | `https://afuo-market-api.onrender.com/api/v1` |
   | `NEXT_PUBLIC_ENABLE_DEMO_MODE` | `false` |
   | `NEXT_PUBLIC_USE_MOCK_DATA` | `false` |

5. Deploy. Note your Vercel URL.

6. **Update Render CORS** with your real Vercel URL → Save (redeploys API).

---

## Step 4 — Custom domain (optional) **YOU**

- **Vercel:** Settings → Domains → add your domain → DNS at registrar
- **Render:** Settings → Custom Domains → e.g. `api.yourdomain.com`
- Update `NEXT_PUBLIC_API_URL` and `CORS_ORIGINS` accordingly

---

## Step 5 — Security before going live **YOU**

- [ ] Reset Supabase database password; update Render `DATABASE_URL`
- [ ] Strong unique `JWT_ACCESS_SECRET` on Render
- [ ] Change seed admin/farmer/buyer passwords for production
- [ ] `CORS_ORIGINS` only lists your real frontend URLs
- [ ] Never commit `.env` or `.env.local`

---

## Test after deploy

1. Home page loads  
2. API `/health` → `"database":"connected"`  
3. Farmer / buyer / admin login work  
4. Marketplace shows listings from Supabase  
