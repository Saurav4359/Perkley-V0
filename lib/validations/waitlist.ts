import { z } from "zod"

export const waitlistRoleSchema = z.enum(["brand", "creator"])

export const brandWaitlistSchema = z.object({
  role: z.literal("brand"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid work email"),
  company: z.string().trim().min(2, "Company name is required"),
})

export const creatorWaitlistSchema = z.object({
  role: z.literal("creator"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email"),
  instagram: z
    .string()
    .trim()
    .min(1, "Instagram handle is required")
    .transform((value) => value.replace(/^@/, "")),
  niche: z.string().trim().min(2, "Niche is required"),
  followers: z.string().trim().min(1, "Follower count is required"),
})

export const waitlistSchema = z.discriminatedUnion("role", [
  brandWaitlistSchema,
  creatorWaitlistSchema,
])

export type WaitlistInput = z.infer<typeof waitlistSchema>
export type WaitlistRole = z.infer<typeof waitlistRoleSchema>
