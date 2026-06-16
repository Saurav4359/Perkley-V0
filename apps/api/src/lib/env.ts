import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production", "staging"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z.string().url().default("http://localhost:3000"),

  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),

  RAZORPAY_KEY_ID: z.string().min(1).optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional(),

  INSTAGRAM_APP_ID: z.string().min(1).optional(),
  INSTAGRAM_APP_SECRET: z.string().min(1).optional(),
  INSTAGRAM_REDIRECT_URI: z.string().url().optional(),

  JWT_SECRET: z.string().min(32).optional(),

  ADMIN_EMAIL_WHITELIST: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(",")
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean)
        : []
    ),

  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),

  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
})

export type ApiEnv = z.infer<typeof envSchema>

let cached: ApiEnv | null = null

export function getEnv(): ApiEnv {
  if (cached) return cached

  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors)
    throw new Error("Invalid environment configuration")
  }

  cached = parsed.data
  return cached
}

export function requireSupabaseEnv(env: ApiEnv = getEnv()) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")
  }

  return {
    url: env.SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: env.SUPABASE_ANON_KEY,
  }
}

export function isRazorpayConfigured(env: ApiEnv = getEnv()) {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET)
}

export function isInstagramConfigured(env: ApiEnv = getEnv()) {
  return Boolean(
    env.INSTAGRAM_APP_ID &&
      env.INSTAGRAM_APP_SECRET &&
      env.INSTAGRAM_REDIRECT_URI
  )
}
