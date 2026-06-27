# FarmLink AI — Backend API

Ghana-focused agricultural marketplace and produce-matching platform backend. Connects farmers with restaurants, hotels, schools, supermarkets, wholesalers and other bulk buyers through AI-assisted listing extraction, buyer matching, offers and transactions.

## Core features

- **Authentication** — JWT access tokens, role-based access (Farmer, Buyer, Admin)
- **Profiles** — Farmer farm profiles and buyer business profiles
- **Produce listings** — Draft, publish, cancel; natural-language AI extraction
- **Marketplace** — Filterable public listing search with distance sorting
- **Matching engine** — Weighted buyer recommendations with explanations
- **Offers & transactions** — Atomic offer acceptance with quantity reservation
- **Transport pooling** — Lightweight shared-transport suggestions
- **Notifications** — In-app notification inbox
- **Admin dashboard** — Platform metrics and management endpoints
- **OpenAPI docs** — Interactive Swagger UI at `/api/docs`

## Architecture

Modular monolith: Express + TypeScript + PostgreSQL + Prisma.

```mermaid
flowchart LR
    Farmer[Farmer Mobile PWA] --> API[FarmLink Backend API]
    Buyer[Buyer Web Dashboard] --> API
    Admin[Admin Dashboard] --> API
    API --> Auth[Authentication Module]
    API --> Listings[Produce Listings Module]
    API --> AI[AI Extraction Service]
    API --> Matching[Matching Engine]
    API --> Offers[Offer Service]
    API --> Notifications[Notification Service]
    Auth --> DB[(PostgreSQL)]
    Listings --> DB
    Matching --> DB
    Offers --> DB
    Notifications --> DB
```

## Technology stack

| Layer | Tools |
|-------|-------|
| Runtime | Node.js 20+, TypeScript |
| HTTP | Express 5, Helmet, CORS, express-rate-limit |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT, bcrypt |
| Validation | Zod |
| Logging | Pino, pino-http |
| Testing | Vitest, Supertest |
| Docs | Swagger / OpenAPI |

## Directory structure

```text
farmlink-backend/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── app.ts / server.ts
│   ├── config/          # env, database, logger, swagger
│   ├── constants/       # roles, produce, matching, pagination
│   ├── middlewares/     # auth, roles, errors, rate limit
│   ├── modules/         # auth, farmers, buyers, listings, offers, admin…
│   ├── services/        # AI extraction, matching engine, notifications
│   ├── routes/
│   ├── types/
│   └── utils/
├── tests/
│   ├── unit/
│   └── integration/
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (local, Docker, Supabase, Neon, etc.)
- npm

## Environment setup

```bash
cd farmlink-backend
cp .env.example .env
```

Required variables (see `.env.example`):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Min 16 characters |
| `CORS_ORIGINS` | Comma-separated frontend URLs |
| `AI_PROVIDER` | `local` (default, no API key needed) |

## Local PostgreSQL (Docker)

```bash
docker compose up -d postgres
```

Default connection: `postgresql://postgres:postgres@localhost:5432/farmlink`

## Database setup

```bash
npm install
npm run prisma:generate
npm run prisma:migrate    # creates/applies migrations
npm run prisma:seed       # demo data
```

## Development

```bash
npm run dev               # tsx watch on port 4000
```

Other commands:

```bash
npm run typecheck
npm run lint
npm run test
npm run test:watch
npm run build
npm start                 # production (after build)
npm run db:studio         # Prisma Studio
```

## Swagger documentation

With the server running: **http://localhost:4000/api/docs**

Bearer token: use the `accessToken` returned from login.

## Demo credentials (development only)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@farmlink.local` | `AdminPassword123!` |
| Farmer | `farmer@farmlink.local` | `FarmerPassword123!` |
| Buyer | `buyer@farmlink.local` | `BuyerPassword123!` |

Additional seeded users use password `DemoFarmer123!` or `DemoBuyer123!`.

## Main API routes

Base path: `/api/v1`

| Area | Routes |
|------|--------|
| Health | `GET /health`, `GET /api/v1/health` |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Categories | `GET /categories`, `GET /categories/:id` |
| Farmer | `POST/GET/PATCH /farmers/profile`, listing & offer routes |
| Buyer | `POST/GET/PATCH /buyers/profile`, demands, recommendations, offers |
| Listings | `POST /listings/extract`, CRUD, publish, cancel, matches |
| Marketplace | `GET /marketplace/listings` |
| Offers | `POST /offers` |
| Notifications | `GET /notifications`, unread count, mark read |
| Admin | `/admin/dashboard`, users, listings, offers, transactions, audit logs |

## AI extraction architecture

```
POST /api/v1/listings/extract
        │
        ▼
 AIExtractionService
        │
   ┌────┴────┐
   │         │
 local    external (optional, env-controlled)
 provider   provider
   │         │
   └────┬────┘
        ▼
 Zod validation (strict schema)
        ▼
 Farmer confirms → POST /listings → publish → matching
```

The **local provider** parses common Ghanaian farmer phrases (quantity, unit, produce, relative dates, towns) without any paid API. External providers are attempted when `AI_PROVIDER` and `AI_API_KEY` are set; failures fall back to local.

## Matching algorithm

Weighted score (0–100):

| Dimension | Weight |
|-----------|--------|
| Produce compatibility | 35% |
| Quantity compatibility | 20% |
| Distance (Haversine) | 20% |
| Date compatibility | 15% |
| Price compatibility | 10% |

Matches are generated automatically when a listing is published. Duplicate recommendations are prevented via a unique `[listingId, buyerId]` constraint with upsert on regeneration.

## Hackathon demo flow

1. Login as **farmer** → create/confirm profile
2. `POST /listings/extract` with voice-transcribed text
3. `POST /listings` with extracted fields → `POST /listings/:id/publish`
4. View generated matches → login as **buyer**
5. Browse marketplace / recommendations → send offer
6. Login as farmer → accept offer → transaction created
7. Login as **admin** → view dashboard metrics

## Connecting the frontend

Set in the Next.js `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_ENABLE_DEMO_MODE=false
```

The frontend login sends `{ email, password }`; the backend accepts both `identifier` and `email`.

## Known MVP limitations

- No real MoMo / bank payments or escrow
- No SMS, USSD or push notifications (in-app only)
- No full delivery tracking or rider management
- AI extraction uses deterministic local parsing (external LLM optional)
- Distance filtering computed in-memory (no PostGIS)
- Phone OTP authentication not yet implemented

## Planned improvements

- Phone OTP auth adapter
- External LLM provider plug-ins (OpenAI, Anthropic)
- SMS / push notification adapters
- Payment settlement integration
- PostGIS for scalable geo queries
- Background job queue for match regeneration at scale

## License

MIT
