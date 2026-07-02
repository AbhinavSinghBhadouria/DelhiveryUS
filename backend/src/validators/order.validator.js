import { z } from "zod";

const addressSchema = z.object({
  address: z.string().trim().min(5, "Address is required"),
  area: z.string().trim().min(2, "Area is required"),
  pincode: z.string().trim().min(4, "Pincode is required")
});

const packageSchema = z.object({
  length: z.coerce.number().positive("Length must be greater than zero"),
  breadth: z.coerce.number().positive("Breadth must be greater than zero"),
  height: z.coerce.number().positive("Height must be greater than zero"),
  actualWeight: z.coerce.number().positive("Actual weight must be greater than zero")
});

export const quoteOrderSchema = z.object({
  body: z.object({
    pickup: addressSchema,
    drop: addressSchema,
    package: packageSchema,
    orderType: z.enum(["B2B", "B2C"]),
    paymentType: z.enum(["PREPAID", "COD"])
  }),
  params: z.object({}),
  query: z.object({})
});

const orderStatusSchema = z.enum([
  "CREATED",
  "CONFIRMED",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
  "RESCHEDULED",
  "CANCELLED"
]);

const idParamSchema = z.object({
  id: z.string().min(1, "ID is required")
});

export const createOrderSchema = z.object({
  body: z.object({
    customerId: z.string().min(1, "Customer ID is required").optional(),
    pickup: addressSchema,
    drop: addressSchema,
    package: packageSchema,
    orderType: z.enum(["B2B", "B2C"]),
    paymentType: z.enum(["PREPAID", "COD"]),
    scheduledDeliveryDate: z.string().datetime("Scheduled delivery date must be ISO datetime").optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const listOrdersSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    status: orderStatusSchema.optional(),
    zoneId: z.string().optional(),
    agentId: z.string().optional()
  })
});

export const orderIdSchema = z.object({
  body: z.object({}),
  params: idParamSchema,
  query: z.object({})
});

export const assignAgentSchema = z.object({
  body: z.object({
    agentId: z.string().min(1, "Agent ID is required")
  }),
  params: idParamSchema,
  query: z.object({})
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: orderStatusSchema,
    note: z.string().trim().optional()
  }),
  params: idParamSchema,
  query: z.object({})
});

export const rescheduleOrderSchema = z.object({
  body: z.object({
    newDeliveryDate: z.string().datetime("New delivery date must be ISO datetime"),
    reason: z.string().trim().optional()
  }),
  params: idParamSchema,
  query: z.object({})
});
