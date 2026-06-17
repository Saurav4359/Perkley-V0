import { z } from "zod"

export const dashboardActivityQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export const dashboardSearchQuerySchema = z.object({
  q: z.string().trim().min(1).max(120),
  limit: z.coerce.number().int().min(1).max(50).default(8),
})
