import { z } from "zod"

export const notificationTypeSchema = z.enum([
  "new_campaign",
  "application_accepted",
  "submission_reviewed",
  "winner_announced",
  "payment_released",
])

export const listNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
})

export const notificationIdParamSchema = z.object({
  id: z.uuid(),
})
