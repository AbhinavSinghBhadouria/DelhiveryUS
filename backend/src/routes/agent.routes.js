import { Router } from "express";
import {
  getProfileHandler,
  listZonesHandler,
  updateAvailabilityHandler,
  updateLocationHandler
} from "../controllers/agent.controller.js";
import {
  getOrderHandler,
  getOrderTrackingHandler,
  listMyOrdersHandler,
  updateOrderStatusHandler
} from "../controllers/order.controller.js";
import { requireAuth, requireRoles } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate-request.js";
import { updateAvailabilitySchema, updateLocationSchema } from "../validators/agent.validator.js";
import { orderIdSchema, updateOrderStatusSchema } from "../validators/order.validator.js";

const router = Router();

router.use(requireAuth, requireRoles("AGENT"));

router.get("/profile", getProfileHandler);
router.get("/zones", listZonesHandler);
router.patch("/availability", validateRequest(updateAvailabilitySchema), updateAvailabilityHandler);
router.patch("/location", validateRequest(updateLocationSchema), updateLocationHandler);

router.get("/orders", listMyOrdersHandler);
router.get("/orders/:id", validateRequest(orderIdSchema), getOrderHandler);
router.get("/orders/:id/tracking", validateRequest(orderIdSchema), getOrderTrackingHandler);
router.patch("/orders/:id/status", validateRequest(updateOrderStatusSchema), updateOrderStatusHandler);

export default router;
