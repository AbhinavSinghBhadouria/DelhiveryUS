import test from "node:test";
import assert from "node:assert/strict";
import { haversineKm } from "../src/utils/geo.js";
import { rankAgentsByDistance } from "../src/services/agent-assignment.service.js";

test("haversineKm returns zero for same point", () => {
  assert.equal(haversineKm(28.6315, 77.2167, 28.6315, 77.2167), 0);
});

test("haversineKm ranks Connaught Place closer than distant agent", () => {
  const pickup = { latitude: 28.6315, longitude: 77.2167 };
  const near = haversineKm(pickup.latitude, pickup.longitude, 28.632, 77.217);
  const far = haversineKm(pickup.latitude, pickup.longitude, 28.7, 77.3);
  assert.ok(near < far);
});

test("rankAgentsByDistance prefers nearest agent with GPS", () => {
  const agents = [
    {
      id: "far",
      activeOrderCount: 0,
      createdAt: new Date("2024-01-01"),
      currentLatitude: 28.7,
      currentLongitude: 77.3
    },
    {
      id: "near",
      activeOrderCount: 1,
      createdAt: new Date("2024-01-02"),
      currentLatitude: 28.6316,
      currentLongitude: 77.2168
    }
  ];

  const pickupRef = { latitude: 28.6315, longitude: 77.2167 };
  const ranked = rankAgentsByDistance(agents, pickupRef);

  assert.equal(ranked[0].agent.id, "near");
});

test("rankAgentsByDistance falls back to workload without GPS", () => {
  const agents = [
    { id: "busy", activeOrderCount: 3, createdAt: new Date("2024-01-01"), currentLatitude: null, currentLongitude: null },
    { id: "free", activeOrderCount: 0, createdAt: new Date("2024-01-02"), currentLatitude: null, currentLongitude: null }
  ];

  const ranked = rankAgentsByDistance(agents, null);
  assert.equal(ranked[0].agent.id, "free");
});
