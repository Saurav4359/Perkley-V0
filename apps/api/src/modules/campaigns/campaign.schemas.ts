import { z } from "zod"

export const campaignTypeSchema = z.enum(["bounty", "campaign"])
export const campaignStatusSchema = z.enum([
  "draft",
  "active",
  "archived",
  "completed",
  "cancelled",
])
export const nicheSchema = z.enum(["fitness", "tech", "fashion", "food", "lifestyle"])
export const contentTypeSchema = z.enum(["reel", "post", "story"])

const requiredTagSchema = z.string().trim().min(2).max(80)

const baseCampaignInputSchema = z.object({
  type: campaignTypeSchema,
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(4000),
  niche: nicheSchema,
  platform: z.literal("instagram").default("instagram"),
  contentType: contentTypeSchema,
  minFollowers: z.number().int().min(0).max(10_000_000),
  requiredHashtag: requiredTagSchema.regex(/^#/),
  requiredMention: requiredTagSchema.regex(/^@/),
  deadline: z.coerce.date(),
  totalBudget: z.number().int().positive().max(100_000_000),
  maxCreators: z.number().int().positive().max(100_000).optional(),
  minViewsThreshold: z.number().int().positive().max(100_000_000).optional(),
  fixedReward: z.number().int().positive().max(10_000_000).optional(),
  prizeFirst: z.number().int().positive().max(10_000_000).optional(),
  prizeSecond: z.number().int().positive().max(10_000_000).optional(),
  prizeThird: z.number().int().positive().max(10_000_000).optional(),
  prizeTop20Each: z.number().int().positive().max(10_000_000).optional(),
})

export const createCampaignSchema = baseCampaignInputSchema

export const updateCampaignSchema = baseCampaignInputSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "At least one field must be provided.",
  }
)

export const campaignIdParamSchema = z.object({
  id: z.uuid(),
})

export const campaignListQuerySchema = z.object({
  type: campaignTypeSchema.optional(),
  niche: nicheSchema.optional(),
  contentType: contentTypeSchema.optional(),
  platform: z.literal("instagram").optional(),
  q: z.string().trim().min(1).max(120).optional(),
  minReward: z.coerce.number().int().min(0).optional(),
  maxReward: z.coerce.number().int().positive().optional(),
  sort: z
    .enum([
      "published_at_desc",
      "published_at_asc",
      "reward_desc",
      "reward_asc",
      "deadline_asc",
      "deadline_desc",
    ])
    .default("published_at_desc"),
})

export const campaignSearchQuerySchema = z.object({
  q: z.string().trim().min(1).max(120),
  limit: z.coerce.number().int().min(1).max(50).default(8),
})

export const myCampaignsQuerySchema = z.object({
  status: campaignStatusSchema.optional(),
})

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>
