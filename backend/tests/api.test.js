import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { roundMoney, roundWeight } from "../src/utils/decimal.js";
import { app } from "../src/app.js";

test("roundWeight rounds to two decimal places", () => {
  assert.equal(roundWeight(1.005), 1.01);
  assert.equal(roundWeight(2.5), 2.5);
});

test("roundMoney rounds to two decimal places", () => {
  assert.equal(roundMoney(99.995), 100);
  assert.equal(roundMoney(60.5), 60.5);
});

test("volumetric weight formula uses divisor 5000", () => {
  const volumetric = roundWeight((30 * 20 * 15) / 5000);
  assert.equal(volumetric, 1.8);
  const billable = roundWeight(Math.max(2, volumetric));
  assert.equal(billable, 2);
});

test("GET /api/health returns ok", async () => {
  const response = await request(app).get("/api/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
});
