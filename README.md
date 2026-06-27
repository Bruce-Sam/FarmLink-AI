# FarmLink AI

FarmLink AI connects Ghanaian farmers with restaurants, hotels, schools, market traders, wholesalers and other bulk buyers **before** produce is harvested, expires or goes to waste.

This repository contains:

1. **Farmer Field Journal PWA** — mobile-first farmer app (`/farmer`)
2. **Buyer Harvest Exchange Dashboard** — web procurement workspace for institutional buyers (`/buyer`)
3. **Harvest Intelligence Command Centre** — admin marketplace monitoring dashboard (`/admin`)

## Buyer dashboard purpose

Business buyers can:

- Sign in and complete a business profile
- Create and manage produce demands
- Discover available farmer listings
- Receive AI-ranked supply recommendations with explanations
- Compare listings and send purchase offers
- Track offers, transactions, and pickup schedules
- Review procurement insights and notifications

## Technology stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- shadcn/ui + Radix UI, Lucide React
- React Hook Form + Zod
- TanStack Query, Axios
- Recharts, next-themes
- Dexie (IndexedDB — farmer offline drafts)
- Serwist (service worker / PWA)
- Sonner toasts
- Vitest, React Testing Library, Playwright

## Folder structure

```text
src/
├── app/
│   ├── (auth)/              # Farmer & buyer login
│   ├── (farmer-app)/        # Farmer PWA routes
│   ├── (farmer-onboarding)/
│   ├── (buyer-dashboard)/   # Buyer workspace routes
│   └── (buyer-onboarding)/
├── components/              # UI, brand, charts, commerce, navigation
├── features/                # Domain modules per portal
├── lib/                     # API client, auth, demo, formatting
├── providers/
├── constants/
└── types/
```

## Installation

```bash
cd farmlink-ai
cp .env.example .env.local
npm install
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL (default `http://localhost:4000/api/v1`) |
| `NEXT_PUBLIC_ENABLE_DEMO_MODE` | Set to `true` for demo data without a live backend |

## Development commands

```bash
npm run dev          # Start dev server
npm run typecheck    # TypeScript
npm run lint         # ESLint
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright (requires dev server)
npm run build        # Production build
```

## Authentication

### Farmer (`/farmer/login`)

1. `POST /auth/login` → `GET /auth/me`
2. Role must be `farmer`
3. Incomplete profile → `/farmer/onboarding`
4. Complete profile → `/farmer`

### Buyer (`/buyer/login`)

1. `POST /auth/login` → `GET /auth/me`
2. Role must be `buyer`
3. Incomplete profile → `/buyer/onboarding`
4. Complete profile → `/buyer`

## Demo mode

With `NEXT_PUBLIC_ENABLE_DEMO_MODE=true`, API calls route to local demo handlers. A **Demo mode** indicator is shown.

| Portal | Demo account | Password |
|--------|--------------|----------|
| Farmer | `kwame.mensah@example.com` or `0244123456` | Any 6+ characters |
| Buyer | `orders@goldenspoon.gh` or `0244555667` | Any 6+ characters |

Demo buyer: **Golden Spoon Restaurant**, Kumasi — tomato demand, Agogo listing, pending offer.

## Main buyer routes

| Route | Purpose |
|-------|---------|
| `/buyer` | Supply Desk overview |
| `/buyer/marketplace` | Discover produce |
| `/buyer/recommendations` | AI-ranked supply |
| `/buyer/demands` | Manage procurement demands |
| `/buyer/offers` | Sent offers |
| `/buyer/transactions` | Confirmed deals |
| `/buyer/pickups` | Pickup schedule |
| `/buyer/insights` | Procurement analytics |
| `/buyer/notifications` | Operational alerts |
| `/buyer/profile` | Business profile |
| `/buyer/settings` | Preferences |
| `/buyer/compare` | Listing comparison (client-side) |

## Design systems

- Farmer: **The Field Journal** — see farmer UI tokens in `globals.css`
- Buyer: **The Harvest Exchange** — see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- Admin: **Harvest Intelligence Command Centre** — forest green navigation, warm ivory surfaces, terracotta actions, contour field patterns

## Admin dashboard

Route: **`/admin`** (login at `/admin/login`)

### Features

- Platform metrics, marketplace funnel, supply/demand charts
- Farmer and buyer monitoring with verification and account-status actions
- Produce listings, AI matches, offers, and transactions
- Analytics, regional activity, notifications, audit logs
- Ctrl+K command search, operational status rail, mock-data indicator

### Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_USE_MOCK_DATA=false   # explicit admin mock mode
NEXT_PUBLIC_ENABLE_DEMO_MODE=true # also enables demo admin login in dev
```

### Demo credentials (development only)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@farmlink.local` | `AdminPassword123!` |

Start the backend (`cd farmlink-backend && npm run dev`) or enable mock/demo mode for hackathon demos without PostgreSQL.

### Admin routes

| Route | Purpose |
|-------|---------|
| `/admin` | Command centre overview |
| `/admin/farmers` | Farmer monitoring |
| `/admin/buyers` | Buyer monitoring |
| `/admin/listings` | Produce listings |
| `/admin/demands` | Buyer demands (mock until backend endpoint) |
| `/admin/matches` | AI match recommendations |
| `/admin/offers` | Offer monitoring |
| `/admin/transactions` | Transaction tracking |
| `/admin/analytics` | Platform analytics |
| `/admin/audit-logs` | Administrator audit trail |

Backend API: `farmlink-backend/` — see [farmlink-backend/README.md](./farmlink-backend/README.md)

## Tests

Unit tests cover auth schemas, buyer onboarding, demands, admin formatters, and match-score formatting without a production backend.

## Known limitations

See [INTEGRATION_GAPS.md](./INTEGRATION_GAPS.md). Payment settlement, push notifications, and several settings are not yet backed by API endpoints.

## Branches

- Farmer PWA: `feature/farmlink-farmer-pwa`
- Buyer dashboard: `feature/farmlink-buyer-dashboard`
- Admin dashboard: `feature/farmlink-admin-dashboard`
- Backend API: `feature/farmlink-backend-foundation`
