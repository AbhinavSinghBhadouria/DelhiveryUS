import { prisma } from "../db/prisma.js";
import { AppError } from "../utils/app-error.js";
import { serializeAgent } from "../utils/decimal.js";

async function getAgentProfileForUser(userId) {
  const agent = await prisma.agent.findUnique({
    where: { userId },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, role: true }
      },
      currentZone: true
    }
  });

  if (!agent) throw new AppError("Agent profile not found", 404);
  return agent;
}

export async function getMyAgentProfile(userId) {
  return serializeAgent(await getAgentProfileForUser(userId));
}

export async function listActiveZones() {
  return prisma.zone.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true }
  });
}

export async function updateAgentAvailability(userId, isAvailable) {
  const agent = await getAgentProfileForUser(userId);

  const updated = await prisma.agent.update({
    where: { id: agent.id },
    data: { isAvailable },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true } },
      currentZone: true
    }
  });

  return serializeAgent(updated);
}

export async function updateAgentLocation(userId, input) {
  const agent = await getAgentProfileForUser(userId);

  if (input.currentZoneId) {
    const zone = await prisma.zone.findUnique({ where: { id: input.currentZoneId } });
    if (!zone) throw new AppError("Zone not found", 404);
  }

  const updated = await prisma.agent.update({
    where: { id: agent.id },
    data: {
      currentZoneId: input.currentZoneId ?? agent.currentZoneId,
      currentLatitude: input.currentLatitude ?? agent.currentLatitude,
      currentLongitude: input.currentLongitude ?? agent.currentLongitude
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true } },
      currentZone: true
    }
  });

  return serializeAgent(updated);
}

export async function adminUpdateAgent(agentId, input) {
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) throw new AppError("Agent not found", 404);

  if (input.currentZoneId) {
    const zone = await prisma.zone.findUnique({ where: { id: input.currentZoneId } });
    if (!zone) throw new AppError("Zone not found", 404);
  }

  const updated = await prisma.agent.update({
    where: { id: agentId },
    data: input,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, role: true } },
      currentZone: true
    }
  });

  return serializeAgent(updated);
}
