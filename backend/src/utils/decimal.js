// yeh utils/decimal.js hai
// Prisma ORM database se Decimal type values return karta hai - JavaScript mein directly use nahi hoti
// hme inhe normal number mein convert karna padta hai JSON response se pehle
// yeh functions rate-calculation.service.js, order.service.js aur admin.service.js mein use hote hain

// basic toNumber helper - null safe hai
export function toNumber(value) {
  if (value === null || value === undefined) {
    return value;
  }
  return Number(value);
}

// serializeRateCard - rate card ke Decimal fields ko number banata hai
// rate-calculation.service.js mein findRateCard ke result pe call hota hai
export function serializeRateCard(rateCard) {
  return {
    ...rateCard,
    minWeight: toNumber(rateCard.minWeight),
    maxWeight: toNumber(rateCard.maxWeight),
    baseCharge: toNumber(rateCard.baseCharge),
    perKgCharge: toNumber(rateCard.perKgCharge)
  };
}

// serializeCodSurcharge - COD surcharge amount Decimal se number
// rate-calculation.service.js mein findCodSurcharge ke baad use hota hai
export function serializeCodSurcharge(codSurcharge) {
  return {
    ...codSurcharge,
    surchargeAmount: toNumber(codSurcharge.surchargeAmount)
  };
}

// serializeAgent - agent ki GPS coordinates Decimal se number mein convert karta hai
// order.service.js mein serializeOrder ke andar nested call hota hai
export function serializeAgent(agent) {
  return {
    ...agent,
    currentLatitude: toNumber(agent.currentLatitude),
    currentLongitude: toNumber(agent.currentLongitude)
  };
}

// serializeOrder - order ke weight aur charge fields convert karta hai
// order.service.js mein hme yeh order return karne se pehle lagate hain
// assignedAgent nested hota hai - usko bhi serialize karo
export function serializeOrder(order) {
  return {
    ...order,
    length: toNumber(order.length),
    breadth: toNumber(order.breadth),
    height: toNumber(order.height),
    actualWeight: toNumber(order.actualWeight),
    volumetricWeight: toNumber(order.volumetricWeight),
    billableWeight: toNumber(order.billableWeight),
    baseCharge: toNumber(order.baseCharge),
    codCharge: toNumber(order.codCharge),
    finalCharge: toNumber(order.finalCharge),
    assignedAgent: order.assignedAgent ? serializeAgent(order.assignedAgent) : order.assignedAgent
  };
}

// roundMoney - paisa 2 decimal places pe round karta hai - floating point errors se bachne ke liye
// rate-calculation.service.js mein baseCharge, codCharge, finalCharge calculate karte waqt use hota hai
export function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

// roundWeight - weight bhi 2 decimal tak round karo
// volumetricWeight aur billableWeight ke liye rate-calculation.service.js mein use hota hai
export function roundWeight(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}
