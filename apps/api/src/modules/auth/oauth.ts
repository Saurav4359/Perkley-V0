import { createHash, randomBytes } from "node:crypto"

import type { OAuthProvider, UserRole } from "@prisma/client"
import { decodeJwt, jwtVerify, createRemoteJWKSet } from "jose"

import {
  getEnv,
  isGoogleConfigured,
  isInstagramConfigured,
  requireSupabaseAuthEnv,
} from "../../lib/env"
import { badRequest, unauthorized } from "../../lib/http-error"
import { prisma } from "../../lib/prisma"

const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"))

export const oauthStateStore = {
  findUnique: prisma.oAuthState.findUnique.bind(prisma.oAuthState),
  create: prisma.oAuthState.create.bind(prisma.oAuthState),
  updateMany: prisma.oAuthState.updateMany.bind(prisma.oAuthState),
}

type OAuthStateInput = {
  provider: OAuthProvider
  role: UserRole
  userId?: string
  redirectTo?: string
}

export type GoogleProfile = {
  provider: "google"
  providerAccountId: string
  email: string
  emailVerified: boolean
  name: string | null
  picture: string | null
  accessToken: string
  refreshToken: string | null
  expiresAt: Date | null
  rawProfile: Record<string, unknown>
}

export type InstagramProfile = {
  provider: "instagram"
  providerAccountId: string
  username: string
  accountType: string | null
  mediaCount: number | null
  accessToken: string
  expiresAt: Date | null
  rawProfile: Record<string, unknown>
}

export function hashOAuthState(state: string) {
  return createHash("sha256").update(state).digest("hex")
}

export async function createOAuthState(input: OAuthStateInput) {
  const state = randomBytes(32).toString("base64url")

  await oauthStateStore.create({
    data: {
      stateHash: hashOAuthState(state),
      provider: input.provider,
      role: input.role,
      userId: input.userId,
      redirectTo: input.redirectTo,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  })

  return state
}

export async function consumeOAuthState(provider: OAuthProvider, state?: string) {
  if (!state) throw badRequest("Missing OAuth state.")

  const stateHash = hashOAuthState(state)
  const stored = await oauthStateStore.findUnique({ where: { stateHash } })

  if (
    !stored ||
    stored.provider !== provider ||
    stored.consumedAt ||
    stored.expiresAt.getTime() < Date.now()
  ) {
    throw badRequest("Invalid or expired OAuth state.")
  }

  const consumed = await oauthStateStore.updateMany({
    where: {
      stateHash,
      provider,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { consumedAt: new Date() },
  })

  if (consumed.count !== 1) {
    throw badRequest("Invalid or expired OAuth state.")
  }

  return stored
}

export async function getGoogleAuthorizationUrl(state: string) {
  const env = getEnv()
  if (!isGoogleConfigured(env)) throw badRequest("Google OAuth is not configured.")

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID!)
  url.searchParams.set("redirect_uri", env.GOOGLE_REDIRECT_URI!)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", "openid email profile")
  url.searchParams.set("state", state)
  url.searchParams.set("access_type", "offline")
  url.searchParams.set("prompt", "consent")

  return url.toString()
}

export async function exchangeGoogleCode(code: string): Promise<GoogleProfile> {
  const env = getEnv()
  if (!isGoogleConfigured(env)) throw badRequest("Google OAuth is not configured.")

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: env.GOOGLE_REDIRECT_URI!,
      grant_type: "authorization_code",
    }),
  })

  if (!response.ok) throw badRequest("Google OAuth token exchange failed.")

  const token = (await response.json()) as {
    access_token: string
    refresh_token?: string
    expires_in?: number
    id_token: string
  }

  const verified = await jwtVerify(token.id_token, googleJwks, {
    audience: env.GOOGLE_CLIENT_ID,
    issuer: ["https://accounts.google.com", "accounts.google.com"],
  })
  const profile = decodeJwt(token.id_token)
  const email = typeof profile.email === "string" ? profile.email.toLowerCase() : null

  if (!email) {
    throw badRequest("Google account did not return an email address.")
  }

  return {
    provider: "google",
    providerAccountId: verified.payload.sub!,
    email,
    emailVerified: profile.email_verified === true,
    name: typeof profile.name === "string" ? profile.name : null,
    picture: typeof profile.picture === "string" ? profile.picture : null,
    accessToken: token.access_token,
    refreshToken: token.refresh_token ?? null,
    expiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000) : null,
    rawProfile: profile,
  }
}

export type SupabaseGoogleProfile = {
  supabaseUserId: string
  googleSub: string | null
  email: string
  emailVerified: boolean
  name: string | null
  picture: string | null
  rawProfile: Record<string, unknown>
}

type GoTrueUser = {
  id: string
  email?: string | null
  email_confirmed_at?: string | null
  user_metadata?: Record<string, unknown> | null
  app_metadata?: { provider?: string; providers?: string[] } | null
  identities?: Array<{
    provider?: string
    id?: string
    identity_data?: Record<string, unknown>
  }> | null
}

/**
 * Verifies a Supabase access token by calling the GoTrue `/auth/v1/user`
 * endpoint. Supabase validates the token's signature and expiry server-side, so
 * a 200 response is proof the token is genuine. We then extract the Google
 * identity so the caller can link/mint a Perkley user.
 */
export async function fetchSupabaseUser(accessToken: string): Promise<SupabaseGoogleProfile> {
  const { url, apiKey } = requireSupabaseAuthEnv()

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: apiKey,
      authorization: `Bearer ${accessToken}`,
    },
  })

  if (response.status === 401 || response.status === 403) {
    throw unauthorized("Invalid or expired Supabase session.")
  }
  if (!response.ok) {
    throw badRequest("Could not verify the Supabase session.")
  }

  const user = (await response.json()) as GoTrueUser
  const metadata = user.user_metadata ?? {}

  const email =
    typeof user.email === "string" && user.email
      ? user.email.toLowerCase()
      : typeof metadata.email === "string"
        ? (metadata.email as string).toLowerCase()
        : null

  if (!email) {
    throw badRequest("Supabase account did not return an email address.")
  }

  const googleIdentity = user.identities?.find((identity) => identity.provider === "google")
  const name =
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.name === "string" && metadata.name) ||
    null
  const picture =
    (typeof metadata.avatar_url === "string" && metadata.avatar_url) ||
    (typeof metadata.picture === "string" && metadata.picture) ||
    null

  return {
    supabaseUserId: user.id,
    googleSub: googleIdentity?.id ?? (typeof metadata.sub === "string" ? metadata.sub : null),
    email,
    emailVerified: Boolean(user.email_confirmed_at) || metadata.email_verified === true,
    name,
    picture,
    rawProfile: { id: user.id, email, app_metadata: user.app_metadata ?? {} },
  }
}

export async function getInstagramAuthorizationUrl(state: string) {
  const env = getEnv()
  if (!isInstagramConfigured(env)) throw badRequest("Instagram OAuth is not configured.")

  const url = new URL("https://api.instagram.com/oauth/authorize")
  url.searchParams.set("client_id", env.INSTAGRAM_CLIENT_ID!)
  url.searchParams.set("redirect_uri", env.INSTAGRAM_REDIRECT_URI!)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", "user_profile,user_media")
  url.searchParams.set("state", state)

  return url.toString()
}

export async function exchangeInstagramCode(code: string): Promise<InstagramProfile> {
  const env = getEnv()
  if (!isInstagramConfigured(env)) throw badRequest("Instagram OAuth is not configured.")

  const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: env.INSTAGRAM_CLIENT_ID!,
      client_secret: env.INSTAGRAM_CLIENT_SECRET!,
      grant_type: "authorization_code",
      redirect_uri: env.INSTAGRAM_REDIRECT_URI!,
      code,
    }),
  })

  if (!tokenResponse.ok) throw badRequest("Instagram OAuth token exchange failed.")

  const shortToken = (await tokenResponse.json()) as {
    access_token: string
    user_id: number
  }

  const profileUrl = new URL("https://graph.instagram.com/me")
  profileUrl.searchParams.set("fields", "id,username,account_type,media_count")
  profileUrl.searchParams.set("access_token", shortToken.access_token)

  const profileResponse = await fetch(profileUrl)
  if (!profileResponse.ok) throw badRequest("Instagram profile fetch failed.")

  const profile = (await profileResponse.json()) as {
    id: string
    username: string
    account_type?: string
    media_count?: number
  }

  return {
    provider: "instagram",
    providerAccountId: profile.id,
    username: profile.username,
    accountType: profile.account_type ?? null,
    mediaCount: profile.media_count ?? null,
    accessToken: shortToken.access_token,
    expiresAt: null,
    rawProfile: profile,
  }
}
