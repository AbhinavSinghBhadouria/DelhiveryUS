# Last-Mile Delivery Tracker

Full-stack delivery management platform: customers place orders with live quotes, admins configure zones and pricing, agents update delivery status, and every status change is recorded in an immutable tracking timeline.

**Hosted app:** Deploy frontend to [Vercel](https://vercel.com) and backend to [Render](https://render.com) — see [Deployment](#deployment). Replace this line with your live URL after deploying.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + role-based access (Customer, Admin, Agent) |
| Notifications | Mock email/SMS (logged to DB; Resend/Twilio ready via env) |

## Quick Start

### 1. Clone and configure

```bash
git clone <your-repo-url>
cd DelhiveryUS
cp .env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Start PostgreSQL (Docker)

```bash
docker compose up -d
```

This starts PostgreSQL on port **55432** with database `delhiveryus_lastmile`.

### 3. Backend

```bash
cd backend
npm install
npx prisma migrate deploy
npm run seed
npm run dev
```

Backend runs at `http://localhost:5000`.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 5. Run tests

```bash
cd backend
npm test
```

Manual QA checklist: [docs/manual-test-checklist.md](docs/manual-test-checklist.md)

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Password@123 |
| Customer | customer@example.com | Password@123 |
| Agent | agent@example.com | Password@123 |

**Seed addresses for orders:**
- Pickup: Connaught Place, pincode `110001` (North Zone)
- Drop: Kalkaji, pincode `110019` (South Zone)

## Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `DATABASE_URL` | backend/.env | PostgreSQL connection string |
| `JWT_SECRET` | backend/.env | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | backend/.env | Token expiry (default `7d`) |
| `PORT` | backend/.env | API port (default `5000`) |
| `FRONTEND_URL` | backend/.env | CORS origin for frontend |
| `VITE_API_BASE_URL` | frontend/.env | Backend API base URL |
| `EMAIL_PROVIDER` | backend/.env | `mock` or `resend` |
| `SMS_PROVIDER` | backend/.env | `mock` or `twilio` |

See [.env.example](.env.example) for all placeholders.

## API Documentation

See [docs/api.md](docs/api.md) for the complete endpoint reference.

Base URL: `http://localhost:5000/api`

All protected routes require header: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register customer or agent |
| POST | `/auth/login` | Public | Login and receive JWT |
| GET | `/auth/me` | Any | Current user profile |

**Register request:**
```json
{
  "name": "Jane Customer",
  "email": "jane@example.com",
  "phone": "9876543210",
  "password": "Password@123",
  "role": "CUSTOMER"
}
```

**Login response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "clx...",
      "name": "Sample Customer",
      "email": "customer@example.com",
      "role": "CUSTOMER"
    }
  }
}
```

### Orders (Customer / Admin)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/orders/quote` | Customer, Admin | Calculate delivery charge |
| POST | `/orders` | Customer, Admin | Create order after quote |
| GET | `/orders/my` | Customer, Agent | List own or assigned orders |
| GET | `/orders/:id` | Any (scoped) | Order detail |
| GET | `/orders/:id/tracking` | Any (scoped) | Tracking timeline |
| POST | `/orders/:id/reschedule` | Customer | Reschedule failed delivery |

**Quote request:**
```json
{
  "pickup": { "address": "12 Janpath", "area": "Connaught Place", "pincode": "110001" },
  "drop": { "address": "45 Temple Lane", "area": "Kalkaji", "pincode": "110019" },
  "package": { "length": 30, "breadth": 20, "height": 15, "actualWeight": 2 },
  "orderType": "B2C",
  "paymentType": "PREPAID"
}
```

**Quote response (excerpt):**
```json
{
  "success": true,
  "data": {
    "quote": {
      "pickupZone": { "name": "North Zone" },
      "dropZone": { "name": "South Zone" },
      "package": { "billableWeight": 2, "volumetricWeight": 1.8 },
      "pricing": { "baseCharge": 84, "codCharge": 0, "finalCharge": 84, "rateType": "INTER_ZONE" }
    }
  }
}
```

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST/GET/PATCH | `/admin/zones` | Zone CRUD |
| POST/GET/PATCH | `/admin/zone-areas` | Pincode/area mapping |
| POST/GET/PATCH | `/admin/rate-cards` | B2B/B2C rate cards |
| POST/GET | `/admin/cod-surcharges` | COD surcharge config |
| GET/POST | `/admin/customers` | List / create customers |
| GET/PATCH | `/admin/agents` | List / update agents |
| GET/POST | `/admin/orders` | List / create orders |
| PATCH | `/admin/orders/:id/status` | Status override |
| PATCH | `/admin/orders/:id/assign-agent` | Manual assignment |
| POST | `/admin/orders/:id/auto-assign` | Auto-assign by zone/workload |

### Agent

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/agent/profile` | Agent profile |
| GET | `/agent/zones` | Active zones for agent profile |
| PATCH | `/agent/availability` | Agent sets availability |
| PATCH | `/agent/location` | Agent sets zone & GPS |
| GET | `/agent/orders` | Assigned orders |
| PATCH | `/agent/orders/:id/status` | Update delivery status |

Agent-allowed statuses: `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`

### Health

```bash
curl http://localhost:5000/api/health
```

## Database Schema

See [docs/database-schema.md](docs/database-schema.md) for table definitions and relationships.

Full Prisma schema: [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

## Rate Calculation Logic

```
volumetricWeight = length × breadth × height / 5000
billableWeight   = max(actualWeight, volumetricWeight)
baseCharge       = rateCard.baseCharge + billableWeight × rateCard.perKgCharge
codCharge        = COD ? configured surcharge for order type : 0
finalCharge      = baseCharge + codCharge
```

- Zones detected by matching **pincode + area name** against `zone_areas`
- Intra-zone vs inter-zone rate selected automatically
- No hardcoded pricing — all values from admin-configured rate cards

## System Design

See [docs/system-design.md](docs/system-design.md) (under 800 words).

## Deployment

### Database (Neon / Railway / Render)

1. Create a PostgreSQL database
2. Copy the connection string to `DATABASE_URL` on your backend host

### Backend (Render)

1. Connect GitHub repo, set root directory to `backend`
2. Build: `npm install && npx prisma generate && npx prisma migrate deploy`
3. Start: `npm start`
4. Set env vars: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `PORT`
5. Run seed once: `npm run seed` (via Render shell)

Or use included [render.yaml](render.yaml) blueprint.

### Frontend (Vercel)

1. Import repo, set root directory to `frontend`
2. Set `VITE_API_BASE_URL` to your Render API URL + `/api`
3. Deploy — [vercel.json](frontend/vercel.json) handles SPA routing

### Post-deploy

- Update `FRONTEND_URL` on backend to your Vercel URL
- Add hosted URL to this README

## Project Structure

```
├── backend/          # Express API + Prisma
├── frontend/         # React + Vite UI
├── docs/             # api.md, database-schema.md, system-design, QA checklist
├── docker-compose.yml
├── render.yaml       # Render deployment blueprint
└── PROJECT_PLAN.md   # Full assignment specification
```

## Notifications

Email and SMS use a provider adapter pattern in `backend/src/services/notification/`:

- **Default:** `EMAIL_PROVIDER=mock` and `SMS_PROVIDER=mock` — notifications are persisted in the `notifications` table.
- **Real email:** Set `EMAIL_PROVIDER=resend`, `EMAIL_API_KEY`, and `EMAIL_FROM` (Resend free tier).
- **Real SMS:** Set `SMS_PROVIDER=twilio` with Twilio credentials.

On every order status change, both email and SMS channels are attempted and logged.

## Submission Checklist

### Code & documentation (complete)

- [x] Complete source (backend + frontend)
- [x] README with setup, API docs, schema, rate logic
- [x] [docs/api.md](docs/api.md) and [docs/database-schema.md](docs/database-schema.md)
- [x] `.env.example` with placeholders only
- [x] [docs/system-design.md](docs/system-design.md) under 800 words
- [x] `.gitignore` excludes `.env`, `node_modules`, build artifacts
- [x] Backend tests (`npm test` — unit + integration)
- [x] Manual QA checklist in [docs/manual-test-checklist.md](docs/manual-test-checklist.md)
- [x] Demo seed data and credentials documented

### Deployment & submission (you complete these)

- [ ] Public GitHub repo pushed to `main`
- [ ] Hosted application URL in README header
- [ ] Zip archive (if your submission portal requires it)

## License

MIT — assignment submission project.
