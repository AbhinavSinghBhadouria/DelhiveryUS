import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { isEmailVerified: true },
    create: {
      name: "Admin User",
      email: "admin@example.com",
      phone: "9999999999",
      passwordHash,
      role: "ADMIN",
      isEmailVerified: true
    }
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: { isEmailVerified: true },
    create: {
      name: "Sample Customer",
      email: "customer@example.com",
      phone: "8888888888",
      passwordHash,
      role: "CUSTOMER",
      isEmailVerified: true
    }
  });

  const agentUser = await prisma.user.upsert({
    where: { email: "agent@example.com" },
    update: { isEmailVerified: true },
    create: {
      name: "Sample Agent",
      email: "agent@example.com",
      phone: "7777777777",
      passwordHash,
      role: "AGENT",
      isEmailVerified: true
    }
  });

  const northZone = await prisma.zone.upsert({
    where: { name: "North Zone" },
    update: {},
    create: {
      name: "North Zone",
      description: "Sample service zone for north-side deliveries."
    }
  });

  const southZone = await prisma.zone.upsert({
    where: { name: "South Zone" },
    update: {},
    create: {
      name: "South Zone",
      description: "Sample service zone for south-side deliveries."
    }
  });

  await prisma.zoneArea.upsert({
    where: {
      pincode_areaName: {
        pincode: "110001",
        areaName: "Connaught Place"
      }
    },
    update: { latitude: 28.6315, longitude: 77.2167 },
    create: {
      zoneId: northZone.id,
      areaName: "Connaught Place",
      pincode: "110001",
      city: "Delhi",
      state: "Delhi",
      latitude: 28.6315,
      longitude: 77.2167
    }
  });

  await prisma.zoneArea.upsert({
    where: {
      pincode_areaName: {
        pincode: "110019",
        areaName: "Kalkaji"
      }
    },
    update: { latitude: 28.5494, longitude: 77.2583 },
    create: {
      zoneId: southZone.id,
      areaName: "Kalkaji",
      pincode: "110019",
      city: "Delhi",
      state: "Delhi",
      latitude: 28.5494,
      longitude: 77.2583
    }
  });

  await prisma.agent.upsert({
    where: { userId: agentUser.id },
    update: {},
    create: {
      userId: agentUser.id,
      currentZoneId: northZone.id,
      currentLatitude: 28.6315,
      currentLongitude: 77.2167,
      isAvailable: true
    }
  });

  const rateRows = [
    ["B2C", northZone.id, northZone.id, "INTRA_ZONE", 0, 5, 60, 12],
    ["B2C", northZone.id, southZone.id, "INTER_ZONE", 0, 5, 90, 18],
    ["B2B", northZone.id, northZone.id, "INTRA_ZONE", 0, 10, 120, 10],
    ["B2B", northZone.id, southZone.id, "INTER_ZONE", 0, 10, 180, 16]
  ];

  for (const [orderType, fromZoneId, toZoneId, rateType, minWeight, maxWeight, baseCharge, perKgCharge] of rateRows) {
    await prisma.rateCard.upsert({
      where: {
        orderType_fromZoneId_toZoneId_minWeight_maxWeight: {
          orderType,
          fromZoneId,
          toZoneId,
          minWeight,
          maxWeight
        }
      },
      update: {
        rateType,
        baseCharge,
        perKgCharge,
        isActive: true
      },
      create: {
        orderType,
        fromZoneId,
        toZoneId,
        rateType,
        minWeight,
        maxWeight,
        baseCharge,
        perKgCharge
      }
    });
  }

  await prisma.codSurcharge.upsert({
    where: { orderType: "B2C" },
    update: { surchargeAmount: 30 },
    create: {
      orderType: "B2C",
      surchargeAmount: 30
    }
  });

  await prisma.codSurcharge.upsert({
    where: { orderType: "B2B" },
    update: { surchargeAmount: 75 },
    create: {
      orderType: "B2B",
      surchargeAmount: 75
    }
  });

  console.log("Seed data created.");
  console.log("Admin:", admin.email);
  console.log("Customer:", customer.email);
  console.log("Agent:", agentUser.email);
  console.log("Password for all seed users: Password@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
