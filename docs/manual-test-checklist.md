# Manual QA Test Checklist

Use this checklist after starting the backend and frontend locally (or on hosted URLs).

## Prerequisites

- [ ] Docker PostgreSQL running (`docker compose up -d`)
- [ ] Backend migrated and seeded (`cd backend && npx prisma migrate deploy && npm run seed`)
- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:5173`

## Authentication

- [ ] Register a new customer account
- [ ] Login as customer (`customer@example.com` / `Password@123`)
- [ ] Login as admin (`admin@example.com` / `Password@123`)
- [ ] Login as agent (`agent@example.com` / `Password@123`)
- [ ] Verify role-based redirect (customer → `/customer`, admin → `/admin`, agent → `/agent`)
- [ ] Logout clears session and redirects to login

## Customer Flow

- [ ] Open Create Order with seed addresses (Connaught Place 110001 → Kalkaji 110019)
- [ ] Get quote preview shows zones, billable weight, and final charge
- [ ] Confirm order creates order with status `CONFIRMED`
- [ ] My Orders lists the new order
- [ ] Order detail shows tracking timeline with `CONFIRMED` event

## Admin Flow

- [ ] View zones and zone areas
- [ ] Create a new zone area (optional)
- [ ] View rate cards and COD surcharges
- [ ] View customers list and create customer (`/admin/customers`)
- [ ] View and update agents (`/admin/agents`) — availability, zone, GPS
- [ ] Orders list filters by status, zone, and agent
- [ ] Create order on behalf of customer (`/admin/orders/new`)
- [ ] Manual assign agent to order → status becomes `ASSIGNED`
- [ ] Auto-assign ranks nearest agent in pickup zone (when GPS set)
- [ ] Admin status override updates tracking timeline

## Agent Flow

- [ ] Agent updates availability on profile page
- [ ] Agent updates zone and GPS location on profile page
- [ ] Agent sees assigned orders only
- [ ] Update status to `PICKED_UP`
- [ ] Update status to `IN_TRANSIT` → `OUT_FOR_DELIVERY` → `DELIVERED` (happy path)
- [ ] Or update status to `FAILED` for reschedule test

## Failed Delivery & Reschedule

- [ ] Agent marks order as `FAILED`
- [ ] Customer sees failed status on order detail
- [ ] Customer submits reschedule with new date
- [ ] Order status becomes `RESCHEDULED` then auto-reassigns to `ASSIGNED` if agent available
- [ ] Tracking timeline shows full flow: CONFIRMED → ASSIGNED → PICKED_UP → FAILED → RESCHEDULED → ASSIGNED

## Notifications

- [ ] Check `notifications` table for email + SMS log entries on status changes
- [ ] Optional: set `EMAIL_PROVIDER=resend` and verify real email delivery

## API Health

- [ ] `GET /api/health` returns success

## Edge Cases

- [ ] Order with unknown pincode/area returns clear validation error
- [ ] Customer cannot access admin routes
- [ ] Agent cannot update unassigned orders
