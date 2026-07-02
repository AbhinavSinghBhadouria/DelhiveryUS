# API Documentation

Base URL: `http://localhost:5000/api` (local) or `https://your-api.onrender.com/api` (production)

All protected routes require:

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

Standard success response:

```json
{ "success": true, "message": "...", "data": { } }
```

Standard error response:

```json
{ "success": false, "message": "Error description" }
```

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | Public | API health check |

---

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | Public | Register customer or agent |
| POST | `/auth/login` | Public | Login and receive JWT |
| GET | `/auth/me` | Any | Current user profile |

**POST /auth/register**

```json
{
  "name": "Jane Customer",
  "email": "jane@example.com",
  "phone": "9876543210",
  "password": "Password@123",
  "role": "CUSTOMER"
}
```

Roles: `CUSTOMER`, `AGENT`

---

## Orders

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/orders/quote` | Customer, Admin | Calculate delivery charge |
| POST | `/orders` | Customer, Admin | Create order (admin may pass `customerId`) |
| GET | `/orders/my` | Customer, Agent | Own or assigned orders |
| GET | `/orders` | Admin | All orders with filters |
| GET | `/orders/:id` | Scoped | Order detail |
| GET | `/orders/:id/tracking` | Scoped | Immutable tracking timeline |
| POST | `/orders/:id/reschedule` | Customer | Reschedule failed delivery |
| PATCH | `/orders/:id/assign-agent` | Admin | Manual agent assignment |
| POST | `/orders/:id/auto-assign` | Admin | Auto-assign nearest agent |
| PATCH | `/orders/:id/status` | Admin, Agent | Update order status |

**POST /orders/quote**

```json
{
  "pickup": { "address": "12 Janpath", "area": "Connaught Place", "pincode": "110001" },
  "drop": { "address": "45 Temple Lane", "area": "Kalkaji", "pincode": "110019" },
  "package": { "length": 30, "breadth": 20, "height": 15, "actualWeight": 2 },
  "orderType": "B2C",
  "paymentType": "PREPAID"
}
```

**Query filters (admin orders):** `status`, `zoneId`, `agentId`

---

## Admin Configuration

| Method | Path | Description |
|--------|------|-------------|
| POST/GET/PATCH | `/admin/zones` | Zone management |
| POST/GET/PATCH | `/admin/zone-areas` | Area/pincode mapping (optional `latitude`, `longitude`) |
| POST/GET/PATCH | `/admin/rate-cards` | B2B/B2C rate cards |
| POST/GET | `/admin/cod-surcharges` | COD surcharge per order type |
| GET/POST | `/admin/customers` | List / create customers |
| GET/PATCH | `/admin/agents` | List / update agents |
| GET/POST | `/admin/orders` | List / create orders for customers |
| PATCH | `/admin/orders/:id/status` | Admin status override |
| PATCH | `/admin/orders/:id/assign-agent` | Manual assignment |
| POST | `/admin/orders/:id/auto-assign` | Distance + workload auto-assign |

---

## Agent

| Method | Path | Description |
|--------|------|-------------|
| GET | `/agent/profile` | Agent profile |
| GET | `/agent/zones` | Active zones list |
| PATCH | `/agent/availability` | Set `isAvailable` |
| PATCH | `/agent/location` | Update zone and GPS coordinates |
| GET | `/agent/orders` | Assigned orders |
| PATCH | `/agent/orders/:id/status` | Update delivery status |

Agent-allowed statuses: `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`

**PATCH /agent/availability**

```json
{ "isAvailable": true }
```

**PATCH /agent/location**

```json
{
  "currentZoneId": "zone_cuid",
  "currentLatitude": 28.6315,
  "currentLongitude": 77.2167
}
```

---

## Rate Calculation

```
volumetricWeight = length × breadth × height / 5000
billableWeight   = max(actualWeight, volumetricWeight)
baseCharge       = rateCard.baseCharge + billableWeight × rateCard.perKgCharge
codCharge        = COD ? codSurcharge[orderType] : 0
finalCharge      = baseCharge + codCharge
```

Zones are detected by matching **pincode + area name** against `zone_areas`.

---

## Notifications

On every status change, email and SMS notifications are dispatched via configurable providers (`mock`, `resend`, `twilio`) and logged in the `notifications` table.
