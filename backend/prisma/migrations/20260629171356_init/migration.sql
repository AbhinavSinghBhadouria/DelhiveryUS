-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN', 'AGENT');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('B2B', 'B2C');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('PREPAID', 'COD');

-- CreateEnum
CREATE TYPE "RateType" AS ENUM ('INTRA_ZONE', 'INTER_ZONE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RESCHEDULED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RescheduleStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zone_areas" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "areaName" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,

    CONSTRAINT "zone_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentZoneId" TEXT,
    "currentLatitude" DECIMAL(10,7),
    "currentLongitude" DECIMAL(10,7),
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "activeOrderCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_cards" (
    "id" TEXT NOT NULL,
    "orderType" "OrderType" NOT NULL,
    "fromZoneId" TEXT NOT NULL,
    "toZoneId" TEXT NOT NULL,
    "rateType" "RateType" NOT NULL,
    "minWeight" DECIMAL(10,2) NOT NULL,
    "maxWeight" DECIMAL(10,2) NOT NULL,
    "baseCharge" DECIMAL(10,2) NOT NULL,
    "perKgCharge" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cod_surcharges" (
    "id" TEXT NOT NULL,
    "orderType" "OrderType" NOT NULL,
    "surchargeAmount" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cod_surcharges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "assignedAgentId" TEXT,
    "pickupAddress" TEXT NOT NULL,
    "pickupArea" TEXT NOT NULL,
    "pickupPincode" TEXT NOT NULL,
    "pickupZoneId" TEXT NOT NULL,
    "dropAddress" TEXT NOT NULL,
    "dropArea" TEXT NOT NULL,
    "dropPincode" TEXT NOT NULL,
    "dropZoneId" TEXT NOT NULL,
    "length" DECIMAL(10,2) NOT NULL,
    "breadth" DECIMAL(10,2) NOT NULL,
    "height" DECIMAL(10,2) NOT NULL,
    "actualWeight" DECIMAL(10,2) NOT NULL,
    "volumetricWeight" DECIMAL(10,2) NOT NULL,
    "billableWeight" DECIMAL(10,2) NOT NULL,
    "orderType" "OrderType" NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "baseCharge" DECIMAL(10,2) NOT NULL,
    "codCharge" DECIMAL(10,2) NOT NULL,
    "finalCharge" DECIMAL(10,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'CREATED',
    "scheduledDeliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_tracking_events" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "oldStatus" "OrderStatus",
    "newStatus" "OrderStatus" NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "actorRole" "UserRole" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_tracking_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reschedule_requests" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "requestedByUserId" TEXT NOT NULL,
    "oldDeliveryDate" TIMESTAMP(3),
    "newDeliveryDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "status" "RescheduleStatus" NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reschedule_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "userId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "zones_name_key" ON "zones"("name");

-- CreateIndex
CREATE UNIQUE INDEX "zone_areas_pincode_areaName_key" ON "zone_areas"("pincode", "areaName");

-- CreateIndex
CREATE UNIQUE INDEX "agents_userId_key" ON "agents"("userId");

-- CreateIndex
CREATE INDEX "rate_cards_orderType_fromZoneId_toZoneId_minWeight_maxWeigh_idx" ON "rate_cards"("orderType", "fromZoneId", "toZoneId", "minWeight", "maxWeight");

-- CreateIndex
CREATE UNIQUE INDEX "rate_cards_orderType_fromZoneId_toZoneId_minWeight_maxWeigh_key" ON "rate_cards"("orderType", "fromZoneId", "toZoneId", "minWeight", "maxWeight");

-- CreateIndex
CREATE UNIQUE INDEX "cod_surcharges_orderType_key" ON "cod_surcharges"("orderType");

-- CreateIndex
CREATE INDEX "orders_customerId_status_idx" ON "orders"("customerId", "status");

-- CreateIndex
CREATE INDEX "orders_assignedAgentId_status_idx" ON "orders"("assignedAgentId", "status");

-- CreateIndex
CREATE INDEX "orders_pickupZoneId_dropZoneId_idx" ON "orders"("pickupZoneId", "dropZoneId");

-- CreateIndex
CREATE INDEX "order_tracking_events_orderId_createdAt_idx" ON "order_tracking_events"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "reschedule_requests_orderId_createdAt_idx" ON "reschedule_requests"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_orderId_userId_idx" ON "notifications"("orderId", "userId");

-- AddForeignKey
ALTER TABLE "zone_areas" ADD CONSTRAINT "zone_areas_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_currentZoneId_fkey" FOREIGN KEY ("currentZoneId") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_cards" ADD CONSTRAINT "rate_cards_fromZoneId_fkey" FOREIGN KEY ("fromZoneId") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_cards" ADD CONSTRAINT "rate_cards_toZoneId_fkey" FOREIGN KEY ("toZoneId") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_pickupZoneId_fkey" FOREIGN KEY ("pickupZoneId") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_dropZoneId_fkey" FOREIGN KEY ("dropZoneId") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_tracking_events" ADD CONSTRAINT "order_tracking_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_tracking_events" ADD CONSTRAINT "order_tracking_events_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_requests" ADD CONSTRAINT "reschedule_requests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reschedule_requests" ADD CONSTRAINT "reschedule_requests_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
