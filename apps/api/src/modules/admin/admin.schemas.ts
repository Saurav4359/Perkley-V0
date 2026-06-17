import { z } from "zod"

const paginationFields = {
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
}

export const listUsersQuerySchema = z.object({
  ...paginationFields,
  role: z.enum(["creator", "brand", "admin"]).optional(),
  status: z.enum(["active", "suspended", "deleted"]).optional(),
  q: z.string().trim().max(120).optional(),
})

export const listCampaignsQuerySchema = z.object({
  ...paginationFields,
  status: z.enum(["draft", "active", "archived", "completed", "cancelled"]).optional(),
  type: z.enum(["bounty", "campaign"]).optional(),
})

export const listProfilesQuerySchema = z.object({
  ...paginationFields,
  verificationStatus: z.enum(["none", "pending", "verified", "rejected"]).optional(),
})

export const listPaymentsQuerySchema = z.object({
  ...paginationFields,
  status: z.enum(["pending", "funded", "released", "refunded", "failed"]).optional(),
})

export const updateUserStatusSchema = z.object({
  status: z.enum(["active", "suspended", "deleted"]),
})

export const updateVerificationSchema = z.object({
  verificationStatus: z.enum(["none", "pending", "verified", "rejected"]),
})

export const moderateCampaignSchema = z.object({
  action: z.literal("cancel"),
  reason: z.string().trim().max(280).optional(),
})

export const idParamSchema = z.object({
  id: z.uuid(),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>
export type ListCampaignsQuery = z.infer<typeof listCampaignsQuerySchema>
export type ListProfilesQuery = z.infer<typeof listProfilesQuerySchema>
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>
