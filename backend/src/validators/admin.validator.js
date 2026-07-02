import { z } from "zod";

const cuidParamSchema = z.object({
  id: z.string().min(1, "ID is required")
});

export const createZoneSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Zone name is required"),
    description: z.string().trim().optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const updateZoneSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Zone name is required").optional(),
    description: z.string().trim().nullable().optional(),
    isActive: z.boolean().optional()
  }),
  params: cuidParamSchema,
  query: z.object({})
});

export const createZoneAreaSchema = z.object({
  body: z.object({
    zoneId: z.string().min(1, "Zone ID is required"),
    areaName: z.string().trim().min(2, "Area name is required"),
    pincode: z.string().trim().min(4, "Pincode is required"),
    city: z.string().trim().min(2, "City is required"),
    state: z.string().trim().min(2, "State is required"),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Name is required"),
    email: z.string().trim().email("Valid email is required").toLowerCase(),
    phone: z
      .string()
      .trim()
      .min(7, "Phone must be at least 7 characters")
      .max(20, "Phone must be at most 20 characters")
      .optional(),
    password: z.string().min(8, "Password must be at least 8 characters")
  }),
  params: z.object({}),
  query: z.object({})
});

export const updateZoneAreaSchema = z.object({
  body: z.object({
    zoneId: z.string().min(1, "Zone ID is required").optional(),
    areaName: z.string().trim().min(2, "Area name is required").optional(),
    pincode: z.string().trim().min(4, "Pincode is required").optional(),
    city: z.string().trim().min(2, "City is required").optional(),
    state: z.string().trim().min(2, "State is required").optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional()
  }),
  params: cuidParamSchema,
  query: z.object({})
});

export const createRateCardSchema = z.object({
  body: z.object({
    orderType: z.enum(["B2B", "B2C"]),
    fromZoneId: z.string().min(1, "From zone ID is required"),
    toZoneId: z.string().min(1, "To zone ID is required"),
    minWeight: z.coerce.number().nonnegative("Minimum weight cannot be negative"),
    maxWeight: z.coerce.number().positive("Maximum weight must be positive"),
    baseCharge: z.coerce.number().nonnegative("Base charge cannot be negative"),
    perKgCharge: z.coerce.number().nonnegative("Per kg charge cannot be negative"),
    isActive: z.boolean().optional()
  }).refine((data) => data.maxWeight > data.minWeight, {
    message: "Maximum weight must be greater than minimum weight",
    path: ["maxWeight"]
  }),
  params: z.object({}),
  query: z.object({})
});

export const updateRateCardSchema = z.object({
  body: z.object({
    orderType: z.enum(["B2B", "B2C"]).optional(),
    fromZoneId: z.string().min(1, "From zone ID is required").optional(),
    toZoneId: z.string().min(1, "To zone ID is required").optional(),
    minWeight: z.coerce.number().nonnegative("Minimum weight cannot be negative").optional(),
    maxWeight: z.coerce.number().positive("Maximum weight must be positive").optional(),
    baseCharge: z.coerce.number().nonnegative("Base charge cannot be negative").optional(),
    perKgCharge: z.coerce.number().nonnegative("Per kg charge cannot be negative").optional(),
    isActive: z.boolean().optional()
  }),
  params: cuidParamSchema,
  query: z.object({})
});

export const upsertCodSurchargeSchema = z.object({
  body: z.object({
    orderType: z.enum(["B2B", "B2C"]),
    surchargeAmount: z.coerce.number().nonnegative("Surcharge cannot be negative"),
    isActive: z.boolean().optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const adminListQuerySchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    isActive: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => (value === undefined ? undefined : value === "true")),
    isAvailable: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => (value === undefined ? undefined : value === "true")),
    orderType: z.enum(["B2B", "B2C"]).optional(),
    zoneId: z.string().optional()
  })
});
