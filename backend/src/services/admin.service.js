import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/app-error.js";
import { serializeAgent, serializeCodSurcharge, serializeRateCard } from "../utils/decimal.js";

function getRateType(fromZoneId, toZoneId) {
  return fromZoneId === toZoneId ? "INTRA_ZONE" : "INTER_ZONE";
}

async function ensureZoneExists(zoneId, label = "Zone") {
  const zone = await prisma.zone.findUnique({
    where: { id: zoneId }
  });

  if (!zone) {
    throw new AppError(`${label} not found`, 404);
  }

  return zone;
}

export async function createZone(input) {
  return prisma.zone.create({
    data: {
      name: input.name,
      description: input.description,
      isActive: input.isActive ?? true
    }
  });
}

export async function listZones(query = {}) {
  return prisma.zone.findMany({
    where: {
      isActive: query.isActive
    },
    include: {
      areas: true
    },
    orderBy: {
      name: "asc"
    }
  });
}

export async function updateZone(id, input) {
  await ensureZoneExists(id);

  return prisma.zone.update({
    where: { id },
    data: input
  });
}

export async function createZoneArea(input) {
  await ensureZoneExists(input.zoneId);

  return prisma.zoneArea.create({
    data: input,
    include: {
      zone: true
    }
  });
}

export async function listZoneAreas(query = {}) {
  return prisma.zoneArea.findMany({
    where: {
      zoneId: query.zoneId
    },
    include: {
      zone: true
    },
    orderBy: [
      { city: "asc" },
      { areaName: "asc" }
    ]
  });
}

export async function updateZoneArea(id, input) {
  const zoneArea = await prisma.zoneArea.findUnique({
    where: { id }
  });

  if (!zoneArea) {
    throw new AppError("Zone area not found", 404);
  }

  if (input.zoneId) {
    await ensureZoneExists(input.zoneId);
  }

  return prisma.zoneArea.update({
    where: { id },
    data: input,
    include: {
      zone: true
    }
  });
}

export async function createRateCard(input) {
  await ensureZoneExists(input.fromZoneId, "From zone");
  await ensureZoneExists(input.toZoneId, "To zone");

  const rateType = getRateType(input.fromZoneId, input.toZoneId);

  const rateCard = await prisma.rateCard.create({
    data: {
      ...input,
      rateType,
      isActive: input.isActive ?? true
    },
    include: {
      fromZone: true,
      toZone: true
    }
  });

  return serializeRateCard(rateCard);
}

export async function listRateCards(query = {}) {
  const rateCards = await prisma.rateCard.findMany({
    where: {
      isActive: query.isActive,
      orderType: query.orderType,
      OR: query.zoneId
        ? [
            { fromZoneId: query.zoneId },
            { toZoneId: query.zoneId }
          ]
        : undefined
    },
    include: {
      fromZone: true,
      toZone: true
    },
    orderBy: [
      { orderType: "asc" },
      { minWeight: "asc" }
    ]
  });

  return rateCards.map(serializeRateCard);
}

export async function updateRateCard(id, input) {
  const existingRateCard = await prisma.rateCard.findUnique({
    where: { id }
  });

  if (!existingRateCard) {
    throw new AppError("Rate card not found", 404);
  }

  const fromZoneId = input.fromZoneId ?? existingRateCard.fromZoneId;
  const toZoneId = input.toZoneId ?? existingRateCard.toZoneId;
  const minWeight = input.minWeight ?? Number(existingRateCard.minWeight);
  const maxWeight = input.maxWeight ?? Number(existingRateCard.maxWeight);

  if (maxWeight <= minWeight) {
    throw new AppError("Maximum weight must be greater than minimum weight", 400);
  }

  if (input.fromZoneId) {
    await ensureZoneExists(input.fromZoneId, "From zone");
  }

  if (input.toZoneId) {
    await ensureZoneExists(input.toZoneId, "To zone");
  }

  const rateCard = await prisma.rateCard.update({
    where: { id },
    data: {
      ...input,
      rateType: getRateType(fromZoneId, toZoneId)
    },
    include: {
      fromZone: true,
      toZone: true
    }
  });

  return serializeRateCard(rateCard);
}

export async function upsertCodSurcharge(input) {
  const codSurcharge = await prisma.codSurcharge.upsert({
    where: {
      orderType: input.orderType
    },
    update: {
      surchargeAmount: input.surchargeAmount,
      isActive: input.isActive ?? true
    },
    create: {
      orderType: input.orderType,
      surchargeAmount: input.surchargeAmount,
      isActive: input.isActive ?? true
    }
  });

  return serializeCodSurcharge(codSurcharge);
}

export async function listCodSurcharges(query = {}) {
  const surcharges = await prisma.codSurcharge.findMany({
    where: {
      isActive: query.isActive,
      orderType: query.orderType
    },
    orderBy: {
      orderType: "asc"
    }
  });

  return surcharges.map(serializeCodSurcharge);
}

export async function listAgents(query = {}) {
  const agents = await prisma.agent.findMany({
    where: {
      isAvailable: query.isAvailable,
      currentZoneId: query.zoneId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true
        }
      },
      currentZone: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return agents.map(serializeAgent);
}

export async function listCustomers() {
  return prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: { select: { customerOrders: true } }
    },
    orderBy: { name: "asc" }
  });
}

export async function createCustomer(input) {
  // Admin creates customers directly - no OTP flow needed
  // isEmailVerified = true because admin is creating on their behalf
  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(input.password, 10);

  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: "CUSTOMER",
      isEmailVerified: true   // admin-created accounts are pre-verified
    }
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt
  };
}
