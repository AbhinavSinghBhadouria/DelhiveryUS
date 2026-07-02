import { z } from "zod";

export const updateAvailabilitySchema = z.object({
  body: z.object({
    isAvailable: z.boolean()
  }),
  params: z.object({}),
  query: z.object({})
});

export const updateLocationSchema = z.object({
  body: z.object({
    currentZoneId: z.string().min(1).optional(),
    currentLatitude: z.coerce.number().min(-90).max(90).optional(),
    currentLongitude: z.coerce.number().min(-180).max(180).optional()
  }),
  params: z.object({}),
  query: z.object({})
});

export const adminUpdateAgentSchema = z.object({
  body: z.object({
    isAvailable: z.boolean().optional(),
    currentZoneId: z.string().min(1).optional(),
    currentLatitude: z.coerce.number().min(-90).max(90).optional(),
    currentLongitude: z.coerce.number().min(-180).max(180).optional()
  }),
  params: z.object({
    id: z.string().min(1)
  }),
  query: z.object({})
});
