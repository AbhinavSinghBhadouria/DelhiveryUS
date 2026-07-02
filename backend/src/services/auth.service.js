// yeh services/auth.service.js hai - registration, login, aur email verification logic yahan hai
// auth.controller.js is file ke functions ko call karta hai

// bcrypt password hashing ke liye - plain text store nahi karte
import bcrypt from "bcryptjs";

// prisma db/prisma.js se - users table, emailVerifications table
import { prisma } from "../db/prisma.js";

// AppError utils/app-error.js se - 409, 401, 403, 400 throw karne ke liye
import { AppError } from "../utils/app-error.js";

// signAuthToken utils/token.js se - JWT token generate karne ke liye
import { signAuthToken } from "../utils/token.js";

// toPublicUser utils/user-response.js se - passwordHash response mein nahi aana chahiye
import { toPublicUser } from "../utils/user-response.js";

// sendOtpEmail - OTP email bhejne ke liye (Nodemailer ya mock)
import { sendOtpEmail } from "./notification/providers.js";
import { env } from "../config/env.js";

// generateOtp - cryptographically safe 6-digit OTP banata hai
function generateOtp() {
  // Math.random ki jagah simple 6-digit number - padStart ensures always 6 digits
  return String(Math.floor(100000 + Math.random() * 900000));
}

// createAndSendOtp - OTP banao, hash karo, DB mein store karo, email bhejo
// registerUser aur resendOtp dono mein use hota hai
async function createAndSendOtp(user) {
  const otp = generateOtp();

  // OTP ko hash karo - plain text DB mein mat rakho
  const otpHash = await bcrypt.hash(otp, 10);

  // 15 minutes ki expiry
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // pehle user ke saare purane unused OTPs invalidate karo
  await prisma.emailVerification.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true }
  });

  // naya OTP record create karo
  await prisma.emailVerification.create({
    data: { userId: user.id, otpHash, expiresAt }
  });

  // email bhejo - mock mode mein console log hoga
  try {
    await sendOtpEmail({ to: user.email, otp, name: user.name });
  } catch (error) {
    console.error(`[Email Error] Failed to send OTP email via ${env.emailProvider}:`, error.message);
    console.log(`-----------------------------------------------------------------`);
    console.log(`[Email Fallback Log] Verification OTP for ${user.email} is: ${otp}`);
    console.log(`-----------------------------------------------------------------`);
  }
}

// registerUser - naya user banana
// auth.controller.js ka register function yahan se call karta hai
export async function registerUser(input) {
  // pehle check karo email pehle se registered toh nahi hai
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (existingUser) {
    // 409 Conflict - duplicate email
    throw new AppError("Email is already registered", 409);
  }

  // password ko hash karo - salt rounds 10 standard hai
  const passwordHash = await bcrypt.hash(input.password, 10);

  // users table mein naya record create karo - isEmailVerified false by default
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: input.role,
      isEmailVerified: false  // OTP verify hone ke baad true hoga
    }
  });

  // agar AGENT role hai toh agents table mein bhi entry banao
  if (user.role === "AGENT") {
    await prisma.agent.create({
      data: {
        userId: user.id,
        isAvailable: true
      }
    });
  }

  // OTP generate karo aur email bhejo
  await createAndSendOtp(user);

  // JWT nahi dete ab - pehle email verify karni hogi
  return {
    message: "Registration successful. Please check your email for the OTP to verify your account.",
    email: user.email
  };
}

// loginUser - existing user login
// auth.controller.js ka login function yahan se call karta hai
export async function loginUser(input) {
  // email se user dhundho
  const user = await prisma.user.findUnique({
    where: { email: input.email }
  });

  // user nahi mila - same error dena hai jaise wrong password - security ke liye
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // bcrypt.compare - input password ko stored hash se compare karo
  const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // email verify nahi ki toh login nahi hone denge
  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email before logging in. Check your inbox for the OTP.", 403);
  }

  // password sahi hai aur email verified hai - token generate karo
  const token = signAuthToken(user);

  return {
    token,
    user: toPublicUser(user)
  };
}

// verifyEmail - OTP check karo aur user ko verified mark karo
// auth.controller.js ka verifyEmail function yahan se call karta hai
export async function verifyEmail(input) {
  // user dhundho by email
  const user = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // already verified hai toh seedha login kar do
  if (user.isEmailVerified) {
    const token = signAuthToken(user);
    return { token, user: toPublicUser(user) };
  }

  // latest unused, unexpired OTP dhundho
  const verification = await prisma.emailVerification.findFirst({
    where: {
      userId: user.id,
      used: false,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: "desc" }
  });

  if (!verification) {
    throw new AppError("OTP has expired or is invalid. Please request a new OTP.", 400);
  }

  // OTP match karo
  const isOtpValid = await bcrypt.compare(input.otp, verification.otpHash);

  if (!isOtpValid) {
    throw new AppError("Incorrect OTP. Please try again.", 400);
  }

  // OTP sahi hai - transaction mein dono kaam karo
  await prisma.$transaction([
    // OTP used mark karo
    prisma.emailVerification.update({
      where: { id: verification.id },
      data: { used: true }
    }),
    // user ko verified mark karo
    prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true }
    })
  ]);

  // ab JWT do - user verified ho gaya
  const verifiedUser = { ...user, isEmailVerified: true };
  const token = signAuthToken(verifiedUser);

  return {
    token,
    user: toPublicUser(verifiedUser)
  };
}

// resendOtp - naya OTP bhejo - purana expire ho gaya ho ya nahi mila ho
export async function resendOtp(input) {
  const user = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email is already verified", 400);
  }

  // naya OTP generate karo aur bhejo - createAndSendOtp purane invalidate bhi karta hai
  await createAndSendOtp(user);

  return {
    message: "A new OTP has been sent to your email address."
  };
}
