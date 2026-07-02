# Database Schema

PostgreSQL database managed with Prisma. Full schema: [backend/prisma/schema.prisma](../backend/prisma/schema.prisma)

## Entity Relationship Overview

```
users ──┬── customerOrders (orders as customer)
        ├── createdOrders (orders created by user)
        ├── agentProfile (agents)
        ├── trackingEvents
        ├── rescheduleRequests
        └── notifications

zones ──┬── areas (zone_areas)
        ├── agents (currentZone)
        ├── pickupOrders / dropOrders
        └── rateCards (from/to)

orders ──┬── trackingEvents (append-only)
         ├── rescheduleRequests
         ├── notifications
         └── assignedAgent
```

## Tables

### users

| Column | Type | Notes |
|--------|------|-------|
| id | cuid | Primary key |
| name | string | |
| email | string | Unique |
| phone | string? | |
| passwordHash | string | bcrypt |
| role | enum | CUSTOMER, ADMIN, AGENT |
| createdAt, updatedAt | datetime | |

### zones

| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| name | string | Unique |
| description | string? | |
| isActive | boolean | Default true |

### zone_areas

| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| zoneId | string | FK → zones |
| areaName | string | |
| pincode | string | Unique with areaName |
| city, state | string | |
| latitude, longitude | decimal? | Used for distance-based auto-assign |

### agents

| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| userId | string | FK → users (unique) |
| currentZoneId | string? | FK → zones |
| currentLatitude, currentLongitude | decimal? | Agent GPS |
| isAvailable | boolean | |
| activeOrderCount | int | Workload for assignment |

### rate_cards

| Column | Type | Notes |
|--------|------|-------|
| id | cuid | PK |
| orderType | B2B / B2C | |
| fromZoneId, toZoneId | string | FK → zones |
| rateType | INTRA_ZONE / INTER_ZONE | Auto-derived |
| minWeight, maxWeight | decimal | Weight slab |
| baseCharge, perKgCharge | decimal | Pricing |
| isActive | boolean | |

Unique: `(orderType, fromZoneId, toZoneId, minWeight, maxWeight)`

### cod_surcharges

| Column | Type | Notes |
|--------|------|-------|
| orderType | B2B / B2C | Unique |
| surchargeAmount | decimal | |
| isActive | boolean | |

### orders

Stores full shipment, pricing snapshot, and current status.

Key fields: `customerId`, `pickupZoneId`, `dropZoneId`, `billableWeight`, `baseCharge`, `codCharge`, `finalCharge`, `status`, `assignedAgentId`, `scheduledDeliveryDate`

Statuses: `CREATED`, `CONFIRMED`, `ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`, `RESCHEDULED`, `CANCELLED`

### order_tracking_events

Append-only audit log. Never updated or deleted.

| Column | Type |
|--------|------|
| orderId | FK |
| oldStatus | enum? |
| newStatus | enum |
| actorUserId | FK → users |
| actorRole | enum |
| note | string? |
| createdAt | datetime |

### reschedule_requests

| Column | Type |
|--------|------|
| orderId | FK |
| requestedByUserId | FK |
| oldDeliveryDate, newDeliveryDate | datetime |
| reason | string? |
| status | REQUESTED / APPROVED / REJECTED |

### notifications

| Column | Type |
|--------|------|
| orderId | FK? |
| userId | FK |
| channel | EMAIL / SMS |
| recipient | string |
| subject | string? |
| message | string |
| provider | mock / resend / twilio |
| status | PENDING / SENT / FAILED |

## Indexes

- `orders`: `(customerId, status)`, `(assignedAgentId, status)`, `(pickupZoneId, dropZoneId)`
- `order_tracking_events`: `(orderId, createdAt)`
- `rate_cards`: `(orderType, fromZoneId, toZoneId, minWeight, maxWeight)`

## Migrations

```bash
cd backend
npx prisma migrate deploy
npm run seed
```
