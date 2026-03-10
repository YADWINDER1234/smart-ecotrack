# Smart EcoTrack – QR-Based Product Research & Recycling Monitoring

Smart EcoTrack links physical products to secure, signed QR payloads, computes a rule-based eco-score, and tracks recycling lifecycle events using an enforced workflow state machine and role-based access control (RBAC).

## Repository structure

```text
smart-ecotrack/
  client/          # React SPA (Vite + TS)
  server/          # Node.js + Express API (TS)
  docker-compose.yml
  .env.example
  README.md
```

## Tech stack

- **Frontend**: React + TypeScript + React Router + Axios + Recharts
- **Backend**: Node.js + Express + TypeScript + Zod validation
- **DB**: PostgreSQL + Knex (migrations)
- **Security**: JWT auth, bcrypt hashing, HMAC-SHA256 QR signatures, scan rate limiting

## Quick start (Docker)

From `smart-ecotrack/`:

```bash
docker compose up --build
```

This will:
- start Postgres
- run **server migrations** and **seed data**
- start the API on `http://localhost:4000`
- start the client on `http://localhost:3000`

## Local dev (no Docker)

### 1) Postgres

Create a database and set `DATABASE_URL` (see `.env.example`).

### 2) Server

```bash
cd server
npm install
npm run migrate
npm run seed
npm run dev
```

API base: `http://localhost:4000/api`

### 3) Client

```bash
cd client
npm install
npm run dev
```

Set `VITE_API_URL` (defaults to `http://localhost:4000/api`).

## Seeded credentials

After `npm run seed` (or Docker startup), the following exist:

- **ADMIN**
  - Email: `admin@smart-ecotrack.local`
  - Password: `AdminPass123!`

Other roles are also seeded (recyclers, manufacturers, consumers) using password:
- `UserPass123!`

## Architecture (layered)

Frontend → Express API → Services → Repositories → PostgreSQL

Backend folders:
- `server/src/routes`: HTTP route mounting
- `server/src/controllers`: request/response handling
- `server/src/services`: business rules (QR verification, eco-score, workflow transitions)
- `server/src/repos`: DB access (Knex)
- `server/src/middleware`: auth/RBAC/validation/rate limiting

## QR security model

Each QR encodes a URL-safe base64 JSON payload:

```json
{ "qr_id": "...", "expiry": 1700000000000, "signature": "..." }
```

Signature:
- `signature = HMAC_SHA256(QR_SECRET, qr_id + ":" + expiry)`

On scan (`POST /api/qr/scan`), the server:
- decodes payload
- checks signature
- checks expiry
- checks revocation status (`qr_codes.status`)
- logs the scan in `scan_logs`
- returns product + eco-score breakdown + workflow stage

## Eco-score engine

\[
Se = 0.25R + 0.25M + 0.20H + 0.15L + 0.15T
\]

- **R**: repairability (0–1)
- **M**: material recoverability (0–1)
- **H**: hazard safety (0–1)
- **L**: local facility compatibility (0–1)
- **T**: traceability completeness (0–1) derived from workflow stage:
  - SCAN → 0
  - INTENT_SUBMITTED → 0.25
  - RECEIVED → 0.5
  - SORTED → 0.75
  - FINAL_DISPOSITION → 1

The scan API returns `eco` containing:
- `ecoScore` (0–1)
- `components` {R,M,H,L,T}
- `weights`
- `label` (eligibility)
- `explanation`

## Workflow state machine

Allowed transitions:

```text
SCAN -> INTENT_SUBMITTED -> RECEIVED -> SORTED -> FINAL_DISPOSITION
```

Role enforcement:
- **CONSUMER**: SCAN → INTENT_SUBMITTED
- **RECYCLER**: INTENT_SUBMITTED → RECEIVED → SORTED → FINAL_DISPOSITION
- **ADMIN**: allowed for all transitions (administrative actions)

Invalid transitions return `409 INVALID_TRANSITION`.

## API endpoints (selected)

### Auth
- `POST /api/auth/register` (CONSUMER)
- `POST /api/auth/login`
- `GET /api/auth/me`

### Products (ADMIN)
- `POST /api/products/admin` create product
- `GET /api/products` list products (auth required)

### QR
- `POST /api/qr/scan` public scan (JWT optional)
- `POST /api/qr/admin/products/:id/qr` (ADMIN) generate signed QR token for product
- `POST /api/qr/admin/qr/:id/revoke` (ADMIN) revoke QR

### Recycling lifecycle
- `POST /api/recycling/intent` (CONSUMER)
- `POST /api/recycling/received` (RECYCLER)
- `POST /api/recycling/sorted` (RECYCLER)
- `POST /api/recycling/finalize` (RECYCLER)
- `GET /api/recycling/qr/:qrId/events` (auth required) view workflow events

### Dashboard analytics
- `GET /api/dashboard/admin` (ADMIN)
- `GET /api/dashboard/manufacturer` (MANUFACTURER)

## Deployment (Render / Railway)

### Server + Postgres
- Provision a Postgres instance and set `DATABASE_URL`.
- Set secrets: `JWT_SECRET`, `QR_SECRET`.
- Build command: `npm install && npm run build`
- Start command: `node dist/index.js`
- Run migrations as a one-off job or release command:
  - `node dist/db/runMigrations.js`

### Client
- Build command: `npm install && npm run build`
- Serve the `dist/` folder (or use the provided Dockerfile + nginx).
- Configure `VITE_API_URL` to point at your deployed API (e.g. `https://your-api/api`).

---

## Testing & Quality

The backend includes a Jest configuration and a sample unit test. To run
all server tests:

```bash
cd server
npm run test
```

Coverage reports are written to `server/coverage`.

Linting is performed by the TypeScript compiler; additional tools (ESLint,
Prettier) can be added as needed.

## Contribution & Roadmap

This repository is intended for demonstration and rapid experimentation. To
move toward a 9/10 product you'll want to focus on:

1. **Design polish** – responsive layouts, branding, accessibility checks.
2. **Automated testing** – expand Jest suite, add integration and e2e tests,
   run on every pull request.
3. **Documentation** – generate Swagger/OpenAPI, API reference, and developer
   guides.
4. **Performance & deployment** – bundle splitting, logging, metrics,
   container manifests.
5. **Security hardening** – CSP, input sanitization, secrets rotation,
   rate‑limiting, audit retention.

Feel free to fork or submit pull requests; the core code is in `server/src` and
`client/src`, arranged by feature area.
