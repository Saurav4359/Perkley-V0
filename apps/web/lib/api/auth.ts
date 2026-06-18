import { apiFetch, getApiBaseUrl } from "@/lib/api/client"

export type AuthRole = "creator" | "brand"

export function oauthStartUrl(
  provider: "google" | "instagram",
  role: AuthRole = "creator",
  redirectTo?: string
): string {
  const params = new URLSearchParams({ role })
  if (redirectTo) params.set("redirectTo", redirectTo)
  return `${getApiBaseUrl()}/api/auth/oauth/${provider}/start?${params.toString()}`
}

export type AuthUser = {
  id: string
  email: string | null
  role: "creator" | "brand" | "admin"
  status: string
  emailVerified: boolean
  displayName: string
  instagramHandle: string | null
  createdAt: string
}

type AuthResponse = { user: AuthUser }

export type SignupPayload = {
  role: AuthRole
  email: string
  password: string
  displayName?: string
  brandName?: string
}

export type SigninPayload = {
  email: string
  password: string
}

export async function signupRequest(payload: SignupPayload): Promise<AuthUser> {
  const { user } = await apiFetch<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: payload,
  })
  return user
}

/**
 * Bridges a Supabase Google sign-in into the app's own session. Sends the
 * Supabase access token to the API, which verifies it, links/creates the
 * Perkley user, and sets the `perkley_session` cookie (hence `credentials`
 * are included by `apiFetch`).
 */
export async function bridgeSupabaseSession(payload: {
  accessToken: string
  role: AuthRole
}): Promise<AuthUser> {
  const { user } = await apiFetch<AuthResponse>("/api/auth/supabase", {
    method: "POST",
    body: payload,
  })
  return user
}

export async function signinRequest(payload: SigninPayload): Promise<AuthUser> {
  const { user } = await apiFetch<AuthResponse>("/api/auth/signin", {
    method: "POST",
    body: payload,
  })
  return user
}

export async function signoutRequest(): Promise<void> {
  await apiFetch<void>("/api/auth/signout", { method: "POST" })
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { user } = await apiFetch<AuthResponse>("/api/auth/me")
    return user
  } catch {
    return null
  }
}
