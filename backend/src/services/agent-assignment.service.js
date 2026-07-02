// yeh services/agent-assignment.service.js hai
// order.service.js mein auto-assign aur reschedule ke waqt yahan se findBestAvailableAgent call hota hai
// prisma db/prisma.js se - zone_areas aur agents table read karne ke liye
import { prisma } from "../db/prisma.js";

// haversineKm aur toNumber utils/geo.js se - distance calculate karne ke liye
import { haversineKm, toNumber } from "../utils/geo.js";

// resolvePickupReference - order ke pickup pincode+area se GPS coordinates dhundhta hai
// agar zone_area mein lat/lng set hai toh woh use karte hain distance ranking ke liye
async function resolvePickupReference(order) {
  const zoneArea = await prisma.zoneArea.findFirst({
    where: {
      pincode: order.pickupPincode,
      areaName: { equals: order.pickupArea, mode: "insensitive" }
    }
  });

  // agar latitude aur longitude dono available hain tabhi GPS reference return karo
  // warna null - tab sirf zone matching pe depend karenge, distance nahi dekhenge
  if (zoneArea?.latitude != null && zoneArea?.longitude != null) {
    return {
      latitude: toNumber(zoneArea.latitude),   // toNumber utils/geo.js se - Decimal to number
      longitude: toNumber(zoneArea.longitude)
    };
  }

  return null;
}

// rankAgentsByDistance - agents ki list lo, GPS se distance calculate karo, sort karo
// kaam karta hai: agar GPS data hai toh nearest agent pehle, warna least busy agent pehle
function rankAgentsByDistance(agents, pickupRef) {
  return agents
    .map((agent) => {
      const lat = toNumber(agent.currentLatitude);   // utils/geo.js ka toNumber
      const lng = toNumber(agent.currentLongitude);

      // haversineKm utils/geo.js se - dono coordinates ke beech ka distance km mein
      const distanceKm =
        pickupRef && lat != null && lng != null
          ? haversineKm(pickupRef.latitude, pickupRef.longitude, lat, lng)
          : null;

      return { agent, distanceKm };
    })
    .sort((a, b) => {
      // pehle distance se sort karo - agar GPS data available hai
      if (a.distanceKm != null && b.distanceKm != null) {
        if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
      } else if (a.distanceKm != null) {
        return -1;  // GPS wala pehle aaye
      } else if (b.distanceKm != null) {
        return 1;
      }

      // tie break: jiske paas kam active orders hain woh pehle
      if (a.agent.activeOrderCount !== b.agent.activeOrderCount) {
        return a.agent.activeOrderCount - b.agent.activeOrderCount;
      }

      // last resort: jo pehle se registered hai woh pehle
      return a.agent.createdAt - b.agent.createdAt;
    });
}

// findBestAvailableAgent - main function - order.service.js se call hota hai
// pickup zone mein available agents dhundhta hai aur best wala return karta hai
// excludeAgentId - reschedule ke time pehle wale agent ko exclude karte hain agar ho sake
export async function findBestAvailableAgent(order, excludeAgentId) {
  // agents table se sirf woh agents lo jo:
  // 1. available hain (isAvailable = true)
  // 2. order ke pickup zone mein hain
  // 3. optionally exclude specific agent
  const agents = await prisma.agent.findMany({
    where: {
      id: excludeAgentId ? { not: excludeAgentId } : undefined,
      isAvailable: true,
      currentZoneId: order.pickupZoneId
    },
    include: { user: true }
  });

  // koi agent nahi mila pickup zone mein - null wapas karo, caller handle karega
  if (!agents.length) return null;

  // pickup zone area se GPS reference dhundho - upar resolvePickupReference function call karo
  const pickupRef = await resolvePickupReference(order);

  // rankAgentsByDistance se sort karo aur pehla agent return karo
  const ranked = rankAgentsByDistance(agents, pickupRef);
  return ranked[0].agent;
}

export { resolvePickupReference, rankAgentsByDistance };
