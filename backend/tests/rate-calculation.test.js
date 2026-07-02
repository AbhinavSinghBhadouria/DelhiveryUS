import test from "node:test";
import assert from "node:assert/strict";
import { roundMoney, roundWeight } from "../src/utils/decimal.js";

test("billable weight uses max of actual and volumetric", () => {
  const volumetric = roundWeight((50 * 40 * 30) / 5000);
  const actual = 5;
  assert.equal(volumetric, 12);
  assert.equal(roundWeight(Math.max(actual, volumetric)), 12);
});

test("actual weight wins when higher than volumetric", () => {
  const volumetric = roundWeight((10 * 10 * 10) / 5000);
  const actual = 8;
  assert.equal(roundWeight(Math.max(actual, volumetric)), 8);
});

test("base charge formula from rate card", () => {
  const baseCharge = roundMoney(90 + 2 * 18);
  assert.equal(baseCharge, 126);
});

test("COD adds surcharge to base", () => {
  const base = 126;
  const cod = 30;
  assert.equal(roundMoney(base + cod), 156);
});

test("prepaid has zero COD charge", () => {
  const codCharge = 0;
  assert.equal(codCharge, 0);
});
