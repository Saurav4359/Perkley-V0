import { z } from "zod"

export const confirmEscrowSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1).optional(),
})

export const releasePaymentsSchema = z.object({
  submissionIds: z.array(z.uuid()).optional(),
})

export const paymentHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(["pending", "processing", "paid", "failed", "on_hold"])
    .optional(),
})

export type ConfirmEscrowInput = z.infer<typeof confirmEscrowSchema>
export type ReleasePaymentsInput = z.infer<typeof releasePaymentsSchema>
