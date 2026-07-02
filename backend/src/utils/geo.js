// yeh utils/geo.js hai - do helper functions hain yahan

// haversineKm - do GPS coordinates ke beech ki distance calculate karta hai
// yeh agent-assignment.service.js mein use hoti hai nearest agent dhundhne ke liye
// Earth radius 6371 km use kiya hai - standard value hai
export function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  // Haversine formula - spherical geometry ka use karta hai flat map ki jagah
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// toNumber - Prisma Decimal type ko normal JS number mein convert karta hai
// yeh agent-assignment.service.js mein agent ki latitude/longitude ke liye use hota hai
// null/undefined safe hai - agar value nahi hai toh null wapas karta hai
export function toNumber(value) {
  if (value === null || value === undefined) return null;
  return Number(value);
}
