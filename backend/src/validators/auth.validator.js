import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone must be at least 7 characters")
  .max(20, "Phone must be at most 20 characters")
  .optional();

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Name is required"),
    email: z.string().trim().email("Valid email is required").toLowerCase(),
    phone: phoneSchema,
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["CUSTOMER", "AGENT"]).default("CUSTOMER")
  }),
  params: z.object({}),
  query: z.object({})
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Valid email is required").toLowerCase(),
    password: z.string().min(1, "Password is required")
  }),
  params: z.object({}),
  query: z.object({})
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Valid email is required").toLowerCase(),
    otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d{6}$/, "OTP must be numeric")
  }),
  params: z.object({}),
  query: z.object({})
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Valid email is required").toLowerCase()
  }),
  params: z.object({}),
  query: z.object({})
});
