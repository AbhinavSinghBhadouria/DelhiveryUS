import { Router } from "express";
import {
  assignAgentHandler,
  autoAssignAgentHandler,
  createOrderHandler,
  getOrderHandler,
  getOrderTrackingHandler,
  listAllOrdersHandler,
  listMyOrdersHandler,
  quoteOrderHandler,
  rescheduleOrderHandler,
  updateOrderStatusHandler
} from "../controllers/order.controller.js";
import { requireAuth, requireRoles } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate-request.js";
import {
  assignAgentSchema,
  createOrderSchema,
  listOrdersSchema,
  orderIdSchema,
  quoteOrderSchema,
  rescheduleOrderSchema,
  updateOrderStatusSchema
} from "../validators/order.validator.js";

const router = Router();

router.post(
  "/quote",
  requireAuth,
  requireRoles("CUSTOMER", "ADMIN"),
  validateRequest(quoteOrderSchema),
  quoteOrderHandler
);

router.post(
  "/",
  requireAuth,
  requireRoles("CUSTOMER", "ADMIN"),
  validateRequest(createOrderSchema),
  createOrderHandler
);

router.get("/my", requireAuth, requireRoles("CUSTOMER", "AGENT"), listMyOrdersHandler);

router.get(
  "/",
  requireAuth,
  requireRoles("ADMIN"),
  validateRequest(listOrdersSchema),
  listAllOrdersHandler
);

router.get("/:id", requireAuth, validateRequest(orderIdSchema), getOrderHandler);
router.get("/:id/tracking", requireAuth, validateRequest(orderIdSchema), getOrderTrackingHandler);

router.patch(
  "/:id/assign-agent",
  requireAuth,
  requireRoles("ADMIN"),
  validateRequest(assignAgentSchema),
  assignAgentHandler
);

router.post(
  "/:id/auto-assign",
  requireAuth,
  requireRoles("ADMIN"),
  validateRequest(orderIdSchema),
  autoAssignAgentHandler
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRoles("ADMIN", "AGENT"),
  validateRequest(updateOrderStatusSchema),
  updateOrderStatusHandler
);

router.post(
  "/:id/reschedule",
  requireAuth,
  requireRoles("CUSTOMER"),
  validateRequest(rescheduleOrderSchema),
  rescheduleOrderHandler
);

export default router;
