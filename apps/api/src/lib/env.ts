import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production", "staging"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:3000")
    .transform((value) =>
      value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
    )
    .pipe(z.array(z.string().url()).min(1)),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  SESSION_COOKIE_NAME: z.string().min(1).default("perkley_session"),
  REFRESH_COOKIE_NAME: z.string().min(1).optional(),
  UPLOAD_STORAGE_DIR: z.string().min(1).default("./var/uploads"),

  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default("media"),

  DATABASE_URL: z.string().url().optional(),

  RAZORPAY_KEY_ID: z.string().min(1).optional(),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional(),

  JOBS_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  JOBS_INTERVAL_MS: z.coerce.number().int().positive().default(300000),

  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),

  INSTAGRAM_CLIENT_ID: z.string().min(1).optional(),
  INSTAGRAM_CLIENT_SECRET: z.string().min(1).optional(),
  INSTAGRAM_REDIRECT_URI: z.string().url().optional(),

  JWT_SECRET: z.string().min(32).optional(),
  OAUTH_TOKEN_ENCRYPTION_KEY: z.string().optional(),
  UPLOAD_TOKEN_SECRET: z.string().min(32).optional(),

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
  if (cached && process.env.NODE_ENV !== "test") return cached

  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors)
    throw new Error("Invalid environment configuration")
  }

  if (process.env.NODE_ENV !== "test") {
    cached = parsed.data
  }

  return parsed.data
}

export function requireDatabaseEnv(env: ApiEnv = getEnv()) {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required")
  }

  return { databaseUrl: env.DATABASE_URL }
}

export function requireJwtSecret(env: ApiEnv = getEnv()) {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required")
  }

  return env.JWT_SECRET
}

export function requireOAuthTokenEncryptionKey(env: ApiEnv = getEnv()) {
  if (!env.OAUTH_TOKEN_ENCRYPTION_KEY) {
    throw new Error("OAUTH_TOKEN_ENCRYPTION_KEY is required")
  }

  const key = Buffer.from(env.OAUTH_TOKEN_ENCRYPTION_KEY, "base64")
  if (key.length !== 32) {
    throw new Error("OAUTH_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key")
  }

  return key
}

export function requireUploadTokenSecret(env: ApiEnv = getEnv()) {
  if (!env.UPLOAD_TOKEN_SECRET) {
    throw new Error("UPLOAD_TOKEN_SECRET is required")
  }

  return env.UPLOAD_TOKEN_SECRET
}

export function isRazorpayConfigured(env: ApiEnv = getEnv()) {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET)
}

export function isSupabaseStorageConfigured(env: ApiEnv = getEnv()) {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY)
}

export function requireSupabaseStorageEnv(env: ApiEnv = getEnv()) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for Supabase storage")
  }
  return {
    url: env.SUPABASE_URL.replace(/\/$/, ""),
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY,
    bucket: env.SUPABASE_STORAGE_BUCKET,
  }
}

export function isSupabaseAuthConfigured(env: ApiEnv = getEnv()) {
  return Boolean(env.SUPABASE_URL && (env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY))
}

/**
 * Returns the Supabase project URL and an API key suitable for the GoTrue
 * `/auth/v1/user` endpoint used to verify a user's access token. Prefers the
 * publishable (anon) key and falls back to the service-role key (both are valid
 * `apikey` values for that endpoint).
 */
export function requireSupabaseAuthEnv(env: ApiEnv = getEnv()) {
  const apiKey = env.SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY
  if (!env.SUPABASE_URL || !apiKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or SUPABASE_SERVICE_ROLE_KEY) are required for Supabase auth"
    )
  }
  return {
    url: env.SUPABASE_URL.replace(/\/$/, ""),
    apiKey,
  }
}

export function isInstagramConfigured(env: ApiEnv = getEnv()) {
  return Boolean(
    env.INSTAGRAM_CLIENT_ID &&
      env.INSTAGRAM_CLIENT_SECRET &&
      env.INSTAGRAM_REDIRECT_URI
  )
}

export function isGoogleConfigured(env: ApiEnv = getEnv()) {
  return Boolean(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_REDIRECT_URI
  )
}

export function getRefreshCookieName(env: ApiEnv = getEnv()) {
  return env.REFRESH_COOKIE_NAME ?? `${env.SESSION_COOKIE_NAME}_refresh`
}
