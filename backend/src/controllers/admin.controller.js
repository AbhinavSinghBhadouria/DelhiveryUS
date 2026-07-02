import {
  createRateCard,
  createZone,
  createZoneArea,
  createCustomer,
  listAgents,
  listCodSurcharges,
  listCustomers,
  listRateCards,
  listZoneAreas,
  listZones,
  updateRateCard,
  updateZone,
  updateZoneArea,
  upsertCodSurcharge
} from "../services/admin.service.js";
import { adminUpdateAgent } from "../services/agent.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const createZoneHandler = asyncHandler(async (request, response) => {
  const zone = await createZone(request.validated.body);

  response.status(201).json({
    success: true,
    message: "Zone created",
    data: { zone }
  });
});

export const listZonesHandler = asyncHandler(async (request, response) => {
  const zones = await listZones(request.validated.query);

  response.json({
    success: true,
    data: { zones }
  });
});

export const updateZoneHandler = asyncHandler(async (request, response) => {
  const zone = await updateZone(request.validated.params.id, request.validated.body);

  response.json({
    success: true,
    message: "Zone updated",
    data: { zone }
  });
});

export const createZoneAreaHandler = asyncHandler(async (request, response) => {
  const zoneArea = await createZoneArea(request.validated.body);

  response.status(201).json({
    success: true,
    message: "Zone area created",
    data: { zoneArea }
  });
});

export const listZoneAreasHandler = asyncHandler(async (request, response) => {
  const zoneAreas = await listZoneAreas(request.validated.query);

  response.json({
    success: true,
    data: { zoneAreas }
  });
});

export const updateZoneAreaHandler = asyncHandler(async (request, response) => {
  const zoneArea = await updateZoneArea(request.validated.params.id, request.validated.body);

  response.json({
    success: true,
    message: "Zone area updated",
    data: { zoneArea }
  });
});

export const createRateCardHandler = asyncHandler(async (request, response) => {
  const rateCard = await createRateCard(request.validated.body);

  response.status(201).json({
    success: true,
    message: "Rate card created",
    data: { rateCard }
  });
});

export const listRateCardsHandler = asyncHandler(async (request, response) => {
  const rateCards = await listRateCards(request.validated.query);

  response.json({
    success: true,
    data: { rateCards }
  });
});

export const updateRateCardHandler = asyncHandler(async (request, response) => {
  const rateCard = await updateRateCard(request.validated.params.id, request.validated.body);

  response.json({
    success: true,
    message: "Rate card updated",
    data: { rateCard }
  });
});

export const upsertCodSurchargeHandler = asyncHandler(async (request, response) => {
  const codSurcharge = await upsertCodSurcharge(request.validated.body);

  response.json({
    success: true,
    message: "COD surcharge saved",
    data: { codSurcharge }
  });
});

export const listCodSurchargesHandler = asyncHandler(async (request, response) => {
  const codSurcharges = await listCodSurcharges(request.validated.query);

  response.json({
    success: true,
    data: { codSurcharges }
  });
});

export const listAgentsHandler = asyncHandler(async (request, response) => {
  const agents = await listAgents(request.validated.query);

  response.json({
    success: true,
    data: { agents }
  });
});

export const listCustomersHandler = asyncHandler(async (request, response) => {
  const customers = await listCustomers();

  response.json({
    success: true,
    data: { customers }
  });
});

export const createCustomerHandler = asyncHandler(async (request, response) => {
  const customer = await createCustomer(request.validated.body);

  response.status(201).json({
    success: true,
    message: "Customer created",
    data: { customer }
  });
});

export const updateAgentHandler = asyncHandler(async (request, response) => {
  const agent = await adminUpdateAgent(request.validated.params.id, request.validated.body);

  response.json({
    success: true,
    message: "Agent updated",
    data: { agent }
  });
});
