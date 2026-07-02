// yeh services/rate-calculation.service.js hai - poora pricing engine yahan hai
// order.service.js calculateOrderQuote ko yahan se call karta hai
// prisma db/prisma.js se - zone, rate card, COD surcharge database se fetch karne ke liye
import { prisma } from "../db/prisma.js";

// AppError utils/app-error.js se - validation fail ho toh 400 throw karne ke liye
import { AppError } from "../utils/app-error.js";

// decimal utility functions utils/decimal.js se - Prisma Decimal ko number banane ke liye
import { roundMoney, roundWeight, serializeCodSurcharge, serializeRateCard } from "../utils/decimal.js";

// helper function - pickup aur drop zone same hain ya alag, usi se rate type decide hoti hai
function getRateType(pickupZoneId, dropZoneId) {
  return pickupZoneId === dropZoneId ? "INTRA_ZONE" : "INTER_ZONE";
}

// detectZone - pincode aur area name se zone_areas table mein dhundhta hai
// hme order create aur quote dono ke liye yeh call karna padta hai
// label "Pickup" ya "Drop" hota hai - error message clear banane ke liye
export async function detectZone(addressInput, label) {
  // prisma db/prisma.js wala use karta hai - zone_areas table mein search
  // areaName case-insensitive match hai - "connaught place" ya "Connaught Place" dono chalega
  const zoneArea = await prisma.zoneArea.findFirst({
    where: {
      pincode: addressInput.pincode,
      areaName: {
        equals: addressInput.area,
        mode: "insensitive"
      },
      // sirf active zones consider karo - inactive zones ignore
      zone: {
        isActive: true
      }
    },
    include: {
      zone: true
    }
  });

  // agar koi match nahi mila toh clear error do - admin ko pehle zone configure karna hoga
  if (!zoneArea) {
    throw new AppError(`${label} zone could not be detected. Please configure this area and pincode first.`, 400);
  }

  return {
    zone: zoneArea.zone,
    zoneArea
  };
}

// findRateCard - order type, zone pair aur billable weight se matching rate card dhundhta hai
// hme weight range mein fit hone wala latest card chahiye - isliye minWeight desc order kiya
export async function findRateCard({ orderType, pickupZoneId, dropZoneId, billableWeight }) {
  const rateCard = await prisma.rateCard.findFirst({
    where: {
      orderType,
      fromZoneId: pickupZoneId,
      toZoneId: dropZoneId,
      // billableWeight rate card ke weight range ke andar hona chahiye
      minWeight: { lte: billableWeight },
      maxWeight: { gte: billableWeight },
      isActive: true
    },
    include: {
      fromZone: true,
      toZone: true
    },
    // most specific slab pehle aaye - isliye minWeight descending
    orderBy: { minWeight: "desc" }
  });

  if (!rateCard) {
    throw new AppError("No active rate card found for this order type, zone pair, and billable weight", 400);
  }

  return rateCard;
}

// findCodSurcharge - sirf COD payment ke liye additional charge nikalta hai
// PREPAID order hai toh directly null return karo - koi DB call nahi
export async function findCodSurcharge(orderType, paymentType) {
  if (paymentType !== "COD") {
    return null;
  }

  // cod_surcharges table se active surcharge dhundho for B2B or B2C
  const codSurcharge = await prisma.codSurcharge.findFirst({
    where: {
      orderType,
      isActive: true
    }
  });

  if (!codSurcharge) {
    throw new AppError("No active COD surcharge configured for this order type", 400);
  }

  return codSurcharge;
}

// calculateOrderQuote - main function - yeh order.service.js mein createOrder se call hota hai
// aur orders/quote route se bhi directly call hota hai preview ke liye
export async function calculateOrderQuote(input) {
  // pehle pickup aur drop dono zones detect karo
  // detectZone upar define hai isi file mein
  const pickupZoneResult = await detectZone(input.pickup, "Pickup");
  const dropZoneResult = await detectZone(input.drop, "Drop");

  // volumetric weight formula: L x B x H / 5000 - standard courier industry formula hai
  const volumetricWeight = roundWeight(
    (input.package.length * input.package.breadth * input.package.height) / 5000
  );
  const actualWeight = roundWeight(input.package.actualWeight);

  // billable weight = jo bhi zyada ho actual ya volumetric - utils/decimal.js ka roundWeight
  const billableWeight = roundWeight(Math.max(actualWeight, volumetricWeight));

  // zone IDs compare karke rate type decide karo
  const rateType = getRateType(pickupZoneResult.zone.id, dropZoneResult.zone.id);

  // upar define kiya findRateCard call karo - matching slab dhundho
  const rateCard = await findRateCard({
    orderType: input.orderType,
    pickupZoneId: pickupZoneResult.zone.id,
    dropZoneId: dropZoneResult.zone.id,
    billableWeight
  });

  // agar rate card ka type aur detected type mismatch hai toh error - misconfiguration case
  if (rateCard.rateType !== rateType) {
    throw new AppError("Configured rate card type does not match detected zone movement", 400);
  }

  // charge formula: base charge + (billable weight x per kg rate)
  // roundMoney utils/decimal.js se - float precision issues se bachne ke liye
  const baseCharge = roundMoney(Number(rateCard.baseCharge) + billableWeight * Number(rateCard.perKgCharge));

  // COD surcharge - upar define kiya findCodSurcharge call karo
  const codSurcharge = await findCodSurcharge(input.orderType, input.paymentType);
  const codCharge = roundMoney(codSurcharge ? Number(codSurcharge.surchargeAmount) : 0);

  // final charge = base + cod
  const finalCharge = roundMoney(baseCharge + codCharge);

  // yeh object order.service.js mein use hota hai order create karte waqt
  // aur /orders/quote route pe directly client ko bhi bhejte hain preview ke liye
  return {
    pickupZone: {
      id: pickupZoneResult.zone.id,
      name: pickupZoneResult.zone.name,
      matchedArea: pickupZoneResult.zoneArea.areaName,
      matchedPincode: pickupZoneResult.zoneArea.pincode
    },
    dropZone: {
      id: dropZoneResult.zone.id,
      name: dropZoneResult.zone.name,
      matchedArea: dropZoneResult.zoneArea.areaName,
      matchedPincode: dropZoneResult.zoneArea.pincode
    },
    package: {
      length: input.package.length,
      breadth: input.package.breadth,
      height: input.package.height,
      actualWeight,
      volumetricWeight,
      billableWeight
    },
    pricing: {
      orderType: input.orderType,
      paymentType: input.paymentType,
      rateType,
      baseCharge,
      codCharge,
      finalCharge
    },
    // serializeRateCard utils/decimal.js se - Prisma Decimal numbers convert karta hai
    rateCard: serializeRateCard(rateCard),
    codSurcharge: codSurcharge ? serializeCodSurcharge(codSurcharge) : null
  };
}
