import {
  getMyAgentProfile,
  listActiveZones,
  updateAgentAvailability,
  updateAgentLocation
} from "../services/agent.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const getProfileHandler = asyncHandler(async (request, response) => {
  const agent = await getMyAgentProfile(request.user.id);
  response.json({ success: true, data: { agent } });
});

export const listZonesHandler = asyncHandler(async (_request, response) => {
  const zones = await listActiveZones();
  response.json({ success: true, data: { zones } });
});

export const updateAvailabilityHandler = asyncHandler(async (request, response) => {
  const agent = await updateAgentAvailability(request.user.id, request.validated.body.isAvailable);
  response.json({ success: true, message: "Availability updated", data: { agent } });
});

export const updateLocationHandler = asyncHandler(async (request, response) => {
  const agent = await updateAgentLocation(request.user.id, request.validated.body);
  response.json({ success: true, message: "Location updated", data: { agent } });
});
