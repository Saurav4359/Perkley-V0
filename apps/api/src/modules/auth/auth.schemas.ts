import { z } from "zod"

export const authRoleSchema = z.enum(["creator", "brand"])

export const signupSchema = z
  .object({
    role: authRoleSchema,
    email: z.email().transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(128),
    displayName: z.string().trim().min(1).max(80).optional(),
    brandName: z.string().trim().min(1).max(120).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.role === "brand" && !value.brandName) {
      ctx.addIssue({
        code: "custom",
        path: ["brandName"],
        message: "Brand name is required for brand signup.",
      })
    }
  })

export const signinSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
})

export const oauthStartQuerySchema = z.object({
  role: authRoleSchema.default("creator"),
  redirectTo: z
    .string()
    .startsWith("/")
    .refine((value) => !value.startsWith("//"), {
      message: "Redirect path must be relative to this app.",
    })
    .optional(),
})

export const oauthCallbackQuerySchema = z.object({
  code: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
})

export type SignupInput = z.infer<typeof signupSchema>
export type SigninInput = z.infer<typeof signinSchema>
export type OAuthStartQuery = z.infer<typeof oauthStartQuerySchema>
export type OAuthCallbackQuery = z.infer<typeof oauthCallbackQuerySchema>
