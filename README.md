# EcoTrack

A personal carbon footprint tracker. Log daily transport, diet, and electricity
activities; EcoTrack computes CO2e emissions using region-specific emission
factors and shows trends and category breakdowns over time.

## Tech stack

- **Framework:** Next.js 14 (App Router), TypeScript — a single app, frontend
  pages and the `/api/v1/*` backend both live here as Route Handlers (no
  separate Express server)
- **Database:** MongoDB via Prisma
- **Auth:** JWT access + refresh tokens as httpOnly cookies, bcrypt password
  hashing, refresh tokens stored server-side (hashed) so they can be rotated
  and revoked
- **Styling:** Tailwind CSS, a small custom design system (sustainability
  teal/moss palette, consistent spacing/type scale)
- **Charts:** Recharts, with a colorblind-safe validated categorical palette
- **Validation:** Zod schemas shared between client and server (`src/lib/validation`)
- **Icons:** lucide-react
- **Motion:** Framer Motion for micro-interactions

## Getting started

### 1. Prerequisites

You need a MongoDB instance running **as a replica set** — Prisma requires
this for MongoDB even for local single-node development, since it uses
transactions internally. Two easy ways to get one:

```bash
# Option A: Docker, single-node replica set
docker run -d --name ecotrack-mongo -p 27017:27017 mongo:7 --replSet rs0
docker exec ecotrack-mongo mongosh --eval "rs.initiate()"

# Option B: MongoDB Atlas (a free-tier cluster is already a replica set)
# — just use its connection string as DATABASE_URL below.
```

### 2. Install and configure

```bash
npm install
cp .env.example .env
# edit .env: set DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
```

### 3. Push the schema and seed emission factors

```bash
npm run db:push    # creates collections/indexes from prisma/schema.prisma
npm run db:seed    # seeds the EmissionFactor reference table
```

### 4. Run it

```bash
npm run dev
# http://localhost:3000
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run start` | Production build / start |
| `npm run lint` | Next.js lint |
| `npm run db:push` | Sync `prisma/schema.prisma` to the database |
| `npm run db:seed` | Seed emission factors (`prisma/seed.ts`) |
| `npm run db:studio` | Prisma Studio (browse the database) |

## Data model

- **User** — email/password (bcrypt), name, `countryCode`
- **EmissionFactor** — seeded reference table: `category` (TRANSPORT / DIET /
  ELECTRICITY), `subtype`, `countryCode` (nullable — a null row is the GLOBAL
  fallback used when no country-specific factor exists), `factorValue`,
  `unit`, `source`
- **ActivityLog** — a user's logged activity; `emissionsKg` is computed and
  stored **at write time** by `calculateEmissions()`
  (`src/lib/emissions/calculate-emissions.ts`), so historical reports don't
  shift if emission factors are edited later
- **RefreshToken** — hashed refresh tokens for rotation/revocation

Seed data currently covers 6 transport modes, 4 diet categories, and grid
electricity for the US, UK, India, Australia, and Bangladesh, plus a GLOBAL
electricity fallback (16 rows total, `prisma/seed.ts`).

## API

RESTful, versioned under `/api/v1` (implemented as Next.js Route Handlers):

- `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`
- `GET /activities?from=&to=&category=&page=&pageSize=`, `POST /activities`
- `PATCH /activities/:id`, `DELETE /activities/:id`
- `GET /dashboard/summary?period=week|month`
- `GET /reports?period=week|month&format=json|csv`
- `GET /emission-factors`

## Future (not built in v1)

Deliberately out of scope for now, per the original project brief:

- Gamification, streaks, or reminders
- PDF report export (CSV only for now)
- Admin UI for editing emission factors (currently seed-only)
