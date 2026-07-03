import test from "node:test";
import assert from "node:assert/strict";
import { assignAgentManually, autoAssignAgent, updateOrderStatus } from "../src/services/order.service.js";
import { prisma } from "../src/db/prisma.js";
import { AppError } from "../src/utils/app-error.js";

// Mocking findUnique on prisma.order
const originalFindUnique = prisma.order.findUnique;

test.afterEach(() => {
  prisma.order.findUnique = originalFindUnique;
});

test("assignAgentManually throws error if order is already delivered", async () => {
  prisma.order.findUnique = async () => {
    return {
      id: "test-order-id",
      status: "DELIVERED"
    };
  };

  await assert.rejects(
    () => assignAgentManually("test-order-id", "agent-id", { role: "ADMIN" }),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.statusCode, 400);
      assert.match(error.message, /Cannot assign agent to a delivered order/i);
      return true;
    }
  );
});

test("autoAssignAgent throws error if order is already delivered", async () => {
  prisma.order.findUnique = async () => {
    return {
      id: "test-order-id",
      status: "DELIVERED"
    };
  };

  await assert.rejects(
    () => autoAssignAgent("test-order-id", { role: "ADMIN" }),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.statusCode, 400);
      assert.match(error.message, /Cannot assign agent to a delivered order/i);
      return true;
    }
  );
});

test("updateOrderStatus throws error if order is already delivered", async () => {
  prisma.order.findUnique = async () => {
    return {
      id: "test-order-id",
      status: "DELIVERED"
    };
  };

  await assert.rejects(
    () => updateOrderStatus("test-order-id", { status: "CONFIRMED" }, { role: "ADMIN" }),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.statusCode, 400);
      assert.match(error.message, /Cannot update status of a delivered order/i);
      return true;
    }
  );
});
