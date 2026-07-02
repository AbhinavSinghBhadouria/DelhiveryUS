import { registerUser, loginUser, verifyEmail, resendOtp } from "../services/auth.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { toPublicUser } from "../utils/user-response.js";

export const register = asyncHandler(async (request, response) => {
  const result = await registerUser(request.validated.body);

  // 201 - user created; OTP bheji gayi - JWT nahi milega abhi
  response.status(201).json({
    success: true,
    message: result.message,
    data: { email: result.email }
  });
});

export const login = asyncHandler(async (request, response) => {
  const result = await loginUser(request.validated.body);

  response.json({
    success: true,
    message: "Login successful",
    data: result
  });
});

// verifyEmail - OTP validate karo aur JWT do
export const verifyEmailHandler = asyncHandler(async (request, response) => {
  const result = await verifyEmail(request.validated.body);

  response.json({
    success: true,
    message: "Email verified successfully. Welcome!",
    data: result
  });
});

// resendOtp - naya OTP bhejo
export const resendOtpHandler = asyncHandler(async (request, response) => {
  const result = await resendOtp(request.validated.body);

  response.json({
    success: true,
    message: result.message
  });
});

export const getMe = asyncHandler(async (request, response) => {
  response.json({
    success: true,
    data: {
      user: toPublicUser(request.user)
    }
  });
});
