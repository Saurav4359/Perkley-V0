import { z } from "zod"

const contentTypeSchema = z.enum(["reel", "post", "story"])
const nicheSchema = z.string().trim().min(1).max(40).toLowerCase()

const optionalUrlSchema = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal("").transform(() => undefined))

export const updateUserSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  brandName: z.string().trim().min(1).max(120).optional(),
})

export const updateCreatorProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  instagramHandle: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^@?[a-zA-Z0-9._]+$/)
    .optional(),
  location: z.string().trim().min(1).max(120).optional(),
  niches: z.array(nicheSchema).max(10).optional(),
  contentTypes: z.array(contentTypeSchema).max(3).optional(),
})

export const updateBrandProfileSchema = z.object({
  brandName: z.string().trim().min(1).max(120).optional(),
  bio: z.string().trim().max(1000).optional(),
  industry: z.string().trim().min(1).max(80).optional(),
  website: optionalUrlSchema,
  workEmail: z.email().toLowerCase().optional(),
  logoUrl: optionalUrlSchema,
  socialLinks: z
    .object({
      instagram: optionalUrlSchema,
      linkedin: optionalUrlSchema,
      twitter: optionalUrlSchema,
    })
    .partial()
    .optional(),
  visibility: z.enum(["public", "private"]).optional(),
})

export const upsertPaymentDetailsSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("upi"),
    upiId: z
      .string()
      .trim()
      .min(3)
      .max(80)
      .regex(/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/),
  }),
  z.object({
    type: z.literal("bank"),
    accountHolder: z.string().trim().min(2).max(120),
    accountNumber: z.string().trim().regex(/^\d{6,24}$/),
    ifsc: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/),
  }),
])

export const createPortfolioItemSchema = z.object({
  title: z.string().trim().min(1).max(120),
  url: z.string().trim().url(),
  platform: z.enum(["instagram"]).default("instagram"),
  contentType: contentTypeSchema,
  thumbnailUrl: optionalUrlSchema,
  metrics: z.record(z.string(), z.unknown()).default({}),
  sortOrder: z.number().int().min(0).max(1000).default(0),
})

export const portfolioIdParamSchema = z.object({
  id: z.uuid(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UpdateCreatorProfileInput = z.infer<typeof updateCreatorProfileSchema>
export type UpdateBrandProfileInput = z.infer<typeof updateBrandProfileSchema>
export type UpsertPaymentDetailsInput = z.infer<typeof upsertPaymentDetailsSchema>
export type CreatePortfolioItemInput = z.infer<typeof createPortfolioItemSchema>
