import { z } from "zod"

export const submissionStatusSchema = z.enum([
  "submitted",
  "competing",
  "under_review",
  "qualified",
  "won",
  "paid",
  "not_qualified",
  "rejected",
])

export const createSubmissionSchema = z.object({
  postUrl: z.string().trim().min(8).max(2048),
  note: z.string().trim().max(500).optional(),
})

export const updateSubmissionSchema = z.object({
  postUrl: z.string().trim().min(8).max(2048).optional(),
  note: z.string().trim().max(500).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "At least one field must be provided.",
})

export const rejectSubmissionSchema = z.object({
  reason: z.string().trim().min(3).max(500),
})

export const campaignIdParamSchema = z.object({
  id: z.uuid(),
})

export const submissionParamsSchema = z.object({
  id: z.uuid(),
  submissionId: z.uuid(),
})

export const listSubmissionsQuerySchema = z.object({
  status: submissionStatusSchema.optional(),
})

export const creatorSubmissionsQuerySchema = z.object({
  status: submissionStatusSchema.optional(),
})

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>
export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>
export type RejectSubmissionInput = z.infer<typeof rejectSubmissionSchema>
