import { z } from "zod"

export const uploadPurposeSchema = z.enum([
  "brand_logo",
  "creator_avatar",
  "portfolio_image",
])

export const prepareUploadSchema = z.object({
  purpose: uploadPurposeSchema,
  filename: z.string().trim().min(1).max(160),
  mimeType: z.string().trim().min(1).max(120).toLowerCase(),
  byteSize: z.number().int().positive().max(10 * 1024 * 1024),
})

export const assetIdParamSchema = z.object({
  assetId: z.uuid(),
})

export const attachAssetSchema = z.object({
  assetId: z.uuid(),
})

export type PrepareUploadInput = z.infer<typeof prepareUploadSchema>
