import { Router } from "express";
import {
  getMe,
  login,
  register,
  verifyEmailHandler,
  resendOtpHandler
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate-request.js";
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);

// email verification routes - register ke baad yahan redirect hoga
router.post("/verify-email", validateRequest(verifyEmailSchema), verifyEmailHandler);
router.post("/resend-otp", validateRequest(resendOtpSchema), resendOtpHandler);

router.get("/me", requireAuth, getMe);

export default router;
