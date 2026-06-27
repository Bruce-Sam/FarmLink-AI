# Deploying FarmLink AI (Hackathon / Production)

This guide covers hosting the **Farmer PWA** and **Buyer dashboard** with **demo mode disabled** and a real backend API.

## Prerequisites

- A GitHub account with this repository pushed
- A deployed **FarmLink API** (or hackathon backend) reachable over HTTPS
- Node.js 20+ locally for testing builds

## 1. Turn off demo mode

In your hosting provider’s environment variables (and locally in `.env.local`):

```env
NEXT_PUBLIC_ENABLE_DEMO_MODE=false
NEXT_PUBLIC_API_URL=https://your-api.example.com/api/v1
```

Never set `NEXT_PUBLIC_ENABLE_DEMO_MODE=true` in production. When demo is off:

- No demo banner appears
- Login uses real `POST /auth/login` against your API
- All listings, offers, and transactions come from the backend

## 2. Verify production build locally

```bash
npm install
npm run typecheck
npm run lint
npm run test
npm run build
npm start
```

Open `http://localhost:3000/farmer/login` and confirm demo hints are **not** shown.

## 3. Recommended hosting: Vercel (easiest for Next.js)

### Step A — Push code to GitHub

1. Create a repository on GitHub (e.g. `farmlink-ai`).
2. Push this project:

```bash
git remote add origin https://github.com/YOUR_USERNAME/farmlink-ai.git
git push -u origin main
```

### Step B — Import on Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New → Project**.
3. Import your `farmlink-ai` repository.
4. Framework preset: **Next.js** (auto-detected).
5. Root directory: `.` (repository root).
6. Add **Environment Variables**:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.example.com/api/v1` |
| `NEXT_PUBLIC_ENABLE_DEMO_MODE` | `false` |

7. Click **Deploy**.

### Step C — After deploy

- Production URL will look like `https://farmlink-ai.vercel.app`
- Farmer app: `https://your-domain/farmer/login`
- Buyer app: `https://your-domain/buyer/login`
- PWA install works on HTTPS automatically
- Service worker is generated on production build (`public/sw.js`)

### Step D — Custom domain (optional)

1. Vercel project → **Settings → Domains**
2. Add your domain and follow DNS instructions

## 4. Alternative: Netlify

1. Connect GitHub repo at [https://app.netlify.com](https://app.netlify.com)
2. Build command: `npm run build`
3. Publish directory: `.next` is handled by Netlify Next plugin — use **Next.js runtime** or deploy via Netlify’s Next.js adapter
4. Set the same environment variables as above

## 5. Alternative: VPS (DigitalOcean, AWS EC2, etc.)

```bash
# On the server
git clone https://github.com/YOUR_USERNAME/farmlink-ai.git
cd farmlink-ai
npm install
npm run build

# Environment
export NEXT_PUBLIC_API_URL=https://your-api.example.com/api/v1
export NEXT_PUBLIC_ENABLE_DEMO_MODE=false

# Run with PM2
npm install -g pm2
pm2 start npm --name farmlink -- start
pm2 save
```

Put **Nginx** or **Caddy** in front with HTTPS (Let’s Encrypt).

## 6. Backend CORS

Ensure your API allows the frontend origin:

```
Access-Control-Allow-Origin: https://your-frontend.vercel.app
```

Or configure credentials/cookies if using HTTP-only auth.

## 7. Hackathon checklist

- [ ] Demo mode **off** in production env
- [ ] API URL points to live hackathon backend
- [ ] Farmer login works with real credentials
- [ ] List produce → extract → publish flow tested on phone
- [ ] PWA installs from HTTPS URL
- [ ] README and `INTEGRATION_GAPS.md` reviewed for judges

## 8. Troubleshooting

| Issue | Fix |
|-------|-----|
| Login always fails | Check `NEXT_PUBLIC_API_URL` and CORS |
| Demo banner still shows | Redeploy with `NEXT_PUBLIC_ENABLE_DEMO_MODE=false` |
| API 404 on offers | Align paths with `INTEGRATION_GAPS.md` |
| PWA not installing | Must be HTTPS; open `/farmer` not `/` |

## 9. Environment summary

| Environment | `NEXT_PUBLIC_ENABLE_DEMO_MODE` | `NEXT_PUBLIC_API_URL` |
|-------------|----------------------------------|------------------------|
| Local dev (no API) | `true` | `http://localhost:4000/api/v1` |
| Hackathon / production | `false` | Your deployed API URL |
