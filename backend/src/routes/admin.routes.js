import { Router } from "express";
import {
  createRateCardHandler,
  createZoneAreaHandler,
  createZoneHandler,
  createCustomerHandler,
  listAgentsHandler,
  listCodSurchargesHandler,
  listCustomersHandler,
  listRateCardsHandler,
  listZoneAreasHandler,
  listZonesHandler,
  updateAgentHandler,
  updateRateCardHandler,
  updateZoneAreaHandler,
  updateZoneHandler,
  upsertCodSurchargeHandler
} from "../controllers/admin.controller.js";
import {
  assignAgentHandler,
  autoAssignAgentHandler,
  createOrderHandler,
  getOrderHandler,
  getOrderTrackingHandler,
  listAllOrdersHandler,
  updateOrderStatusHandler
} from "../controllers/order.controller.js";
import { requireAuth, requireRoles } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate-request.js";
import {
  adminListQuerySchema,
  createRateCardSchema,
  createZoneAreaSchema,
  createZoneSchema,
  createCustomerSchema,
  updateRateCardSchema,
  updateZoneAreaSchema,
  updateZoneSchema,
  upsertCodSurchargeSchema
} from "../validators/admin.validator.js";
import { adminUpdateAgentSchema } from "../validators/agent.validator.js";
import {
  assignAgentSchema,
  createOrderSchema,
  listOrdersSchema,
  orderIdSchema,
  updateOrderStatusSchema
} from "../validators/order.validator.js";

const router = Router();

router.use(requireAuth, requireRoles("ADMIN"));

router.post("/zones", validateRequest(createZoneSchema), createZoneHandler);
router.get("/zones", validateRequest(adminListQuerySchema), listZonesHandler);
router.patch("/zones/:id", validateRequest(updateZoneSchema), updateZoneHandler);

router.post("/zone-areas", validateRequest(createZoneAreaSchema), createZoneAreaHandler);
router.get("/zone-areas", validateRequest(adminListQuerySchema), listZoneAreasHandler);
router.patch("/zone-areas/:id", validateRequest(updateZoneAreaSchema), updateZoneAreaHandler);

router.post("/rate-cards", validateRequest(createRateCardSchema), createRateCardHandler);
router.get("/rate-cards", validateRequest(adminListQuerySchema), listRateCardsHandler);
router.patch("/rate-cards/:id", validateRequest(updateRateCardSchema), updateRateCardHandler);

router.post("/cod-surcharges", validateRequest(upsertCodSurchargeSchema), upsertCodSurchargeHandler);
router.get("/cod-surcharges", validateRequest(adminListQuerySchema), listCodSurchargesHandler);

router.get("/agents", validateRequest(adminListQuerySchema), listAgentsHandler);
router.patch("/agents/:id", validateRequest(adminUpdateAgentSchema), updateAgentHandler);
router.get("/customers", listCustomersHandler);
router.post("/customers", validateRequest(createCustomerSchema), createCustomerHandler);

router.get("/orders", validateRequest(listOrdersSchema), listAllOrdersHandler);
router.post("/orders", validateRequest(createOrderSchema), createOrderHandler);
router.get("/orders/:id", validateRequest(orderIdSchema), getOrderHandler);
router.get("/orders/:id/tracking", validateRequest(orderIdSchema), getOrderTrackingHandler);
router.patch("/orders/:id/status", validateRequest(updateOrderStatusSchema), updateOrderStatusHandler);
router.patch("/orders/:id/assign-agent", validateRequest(assignAgentSchema), assignAgentHandler);
router.post("/orders/:id/auto-assign", validateRequest(orderIdSchema), autoAssignAgentHandler);

export default router;
