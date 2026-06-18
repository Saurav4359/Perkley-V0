import { jwtVerify } from "jose"

import {
  REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  type SessionRole,
} from "@/lib/auth/constants"

export type SessionClaims = {
  id: string
  role: SessionRole
  email: string | null
}

const sessionRoles = new Set<SessionRole>(["admin", "brand", "creator"])

function secretKey() {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) return null
  return new TextEncoder().encode(secret)
}

export async function verifyAccessToken(
  token: string
): Promise<SessionClaims | null> {
  const key = secretKey()
  if (!key) return null

  try {
    const { payload } = await jwtVerify(token, key)

    if (
      !payload.sub ||
      typeof payload.role !== "string" ||
      !sessionRoles.has(payload.role as SessionRole)
    ) {
      return null
    }

    return {
      id: payload.sub,
      role: payload.role as SessionRole,
      email: typeof payload.email === "string" ? payload.email : null,
    }
  } catch {
    return null
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<{ userId: string } | null> {
  const key = secretKey()
  if (!key) return null

  try {
    const { payload } = await jwtVerify(token, key)
    if (payload.typ !== "refresh" || !payload.sub) return null
    return { userId: payload.sub }
  } catch {
    return null
  }
}

export function getDashboardPathForRole(role: SessionRole): string {
  if (role === "brand") return "/dashboard/brand"
  if (role === "admin") return "/dashboard/admin"
  return "/dashboard"
}

export type ProxySession = {
  claims: SessionClaims | null
  hasRefreshToken: boolean
}

export async function readProxySession(cookies: {
  get(name: string): { value: string } | undefined
}): Promise<ProxySession> {
  const accessToken = cookies.get(SESSION_COOKIE_NAME)?.value
  if (accessToken) {
    const claims = await verifyAccessToken(accessToken)
    if (claims) {
      return { claims, hasRefreshToken: false }
    }
  }

  const refreshToken = cookies.get(REFRESH_COOKIE_NAME)?.value
  if (refreshToken) {
    const refresh = await verifyRefreshToken(refreshToken)
    if (refresh) {
      return { claims: null, hasRefreshToken: true }
    }
  }

  return { claims: null, hasRefreshToken: false }
}

export function isAuthenticatedSession(session: ProxySession) {
  return session.claims !== null || session.hasRefreshToken
}
