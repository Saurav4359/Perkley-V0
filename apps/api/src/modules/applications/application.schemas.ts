import { z } from "zod"

export const applicationStatusSchema = z.enum([
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
])

export const applyToCampaignSchema = z.object({
  message: z.string().trim().max(500).optional(),
})

export const campaignIdParamSchema = z.object({
  id: z.uuid(),
})

export const applicationParamsSchema = z.object({
  id: z.uuid(),
  applicationId: z.uuid(),
})

export const listApplicationsQuerySchema = z.object({
  status: applicationStatusSchema.optional(),
})

export const creatorApplicationsQuerySchema = z.object({
  status: applicationStatusSchema.optional(),
})

export type ApplyToCampaignInput = z.infer<typeof applyToCampaignSchema>
