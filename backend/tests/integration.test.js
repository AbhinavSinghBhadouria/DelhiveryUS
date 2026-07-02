import dotenv from "dotenv";
import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/db/prisma.js";
import { calculateOrderQuote, detectZone } from "../src/services/rate-calculation.service.js";
import { findBestAvailableAgent } from "../src/services/agent-assignment.service.js";
import { AppError } from "../src/utils/app-error.js";

dotenv.config();

const basePackage = { length: 30, breadth: 20, height: 15, actualWeight: 2 };
const northPickup = { address: "12 Janpath", area: "Connaught Place", pincode: "110001" };
const southDrop = { address: "45 Temple Lane", area: "Kalkaji", pincode: "110019" };

test("B2C inter-zone quote uses seeded rate card", async () => {
  const quote = await calculateOrderQuote({
    pickup: northPickup,
    drop: southDrop,
    package: basePackage,
    orderType: "B2C",
    paymentType: "PREPAID"
  });

  assert.equal(quote.pricing.rateType, "INTER_ZONE");
  assert.equal(quote.pricing.codCharge, 0);
  assert.ok(quote.pricing.finalCharge > 0);
});

test("B2C intra-zone quote when pickup and drop share zone", async () => {
  const quote = await calculateOrderQuote({
    pickup: northPickup,
    drop: { address: "1 CP", area: "Connaught Place", pincode: "110001" },
    package: basePackage,
    orderType: "B2C",
    paymentType: "PREPAID"
  });

  assert.equal(quote.pricing.rateType, "INTRA_ZONE");
});

test("COD surcharge is applied for COD orders", async () => {
  const quote = await calculateOrderQuote({
    pickup: northPickup,
    drop: southDrop,
    package: basePackage,
    orderType: "B2C",
    paymentType: "COD"
  });

  assert.ok(quote.pricing.codCharge > 0);
  assert.equal(quote.pricing.finalCharge, quote.pricing.baseCharge + quote.pricing.codCharge);
});

test("prepaid orders have zero COD charge", async () => {
  const quote = await calculateOrderQuote({
    pickup: northPickup,
    drop: southDrop,
    package: basePackage,
    orderType: "B2C",
    paymentType: "PREPAID"
  });

  assert.equal(quote.pricing.codCharge, 0);
});

test("volumetric weight exceeds actual weight when package is large", async () => {
  const quote = await calculateOrderQuote({
    pickup: northPickup,
    drop: southDrop,
    package: { length: 40, breadth: 30, height: 20, actualWeight: 2 },
    orderType: "B2C",
    paymentType: "PREPAID"
  });

  assert.ok(quote.package.volumetricWeight > quote.package.actualWeight);
  assert.equal(quote.package.billableWeight, quote.package.volumetricWeight);
});

test("actual weight is used when higher than volumetric", async () => {
  const quote = await calculateOrderQuote({
    pickup: northPickup,
    drop: southDrop,
    package: { length: 10, breadth: 10, height: 10, actualWeight: 4 },
    orderType: "B2C",
    paymentType: "PREPAID"
  });

  assert.equal(quote.package.billableWeight, 4);
});

test("unknown zone returns clear validation error", async () => {
  await assert.rejects(
    () => detectZone({ address: "Nowhere", area: "Unknown Area", pincode: "000000" }, "Pickup"),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.match(error.message, /zone could not be detected/i);
      return true;
    }
  );
});

test("missing rate card for extreme weight returns error", async () => {
  await assert.rejects(
    () =>
      calculateOrderQuote({
        pickup: northPickup,
        drop: southDrop,
        package: { length: 10, breadth: 10, height: 10, actualWeight: 500 },
        orderType: "B2C",
        paymentType: "PREPAID"
      }),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.match(error.message, /rate card/i);
      return true;
    }
  );
});

test("auto-assignment selects available agent in pickup zone", async () => {
  const northZone = await prisma.zone.findFirst({ where: { name: "North Zone" } });
  assert.ok(northZone);

  const agent = await findBestAvailableAgent({
    pickupPincode: "110001",
    pickupArea: "Connaught Place",
    pickupZoneId: northZone.id
  });

  assert.ok(agent);
  assert.equal(agent.currentZoneId, northZone.id);
  assert.equal(agent.isAvailable, true);
});

test.after(async () => {
  await prisma.$disconnect();
});
