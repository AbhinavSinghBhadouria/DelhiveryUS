import { Router } from "express";
import { requireAuth, requireRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/customer", requireAuth, requireRoles("CUSTOMER"), (_request, response) => {
  response.json({
    success: true,
    message: "Customer route access confirmed"
  });
});

router.get("/admin", requireAuth, requireRoles("ADMIN"), (_request, response) => {
  response.json({
    success: true,
    message: "Admin route access confirmed"
  });
});

router.get("/agent", requireAuth, requireRoles("AGENT"), (_request, response) => {
  response.json({
    success: true,
    message: "Agent route access confirmed"
  });
});

export default router;
