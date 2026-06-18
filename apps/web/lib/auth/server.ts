import { cookies } from "next/headers"
import { cache } from "react"

import {
  REFRESH_COOKIE_NAME,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/constants"
import {
  getDashboardPathForRole,
  verifyAccessToken,
  type SessionClaims,
} from "@/lib/auth/session"
import type { AuthUser } from "@/lib/api/auth"
import { getApiBaseUrl } from "@/lib/api/client"

function authUserFromClaims(claims: SessionClaims): AuthUser {
  const email = claims.email
  return {
    id: claims.id,
    email,
    role: claims.role,
    status: "active",
    emailVerified: false,
    displayName: email?.split("@")[0] ?? "User",
    instagramHandle: null,
    createdAt: new Date().toISOString(),
  }
}

function buildCookieHeader(
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ")
}

function applySetCookieHeaders(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  setCookieHeaders: string[]
) {
  for (const header of setCookieHeaders) {
    const [nameValue, ...attributes] = header.split(";")
    const separator = nameValue.indexOf("=")
    if (separator < 1) continue

    const name = nameValue.slice(0, separator).trim()
    const value = nameValue.slice(separator + 1).trim()
    const options: {
      path?: string
      maxAge?: number
      secure?: boolean
      httpOnly?: boolean
      sameSite?: "lax" | "strict" | "none"
    } = {}

    for (const attribute of attributes) {
      const part = attribute.trim()
      const lower = part.toLowerCase()
      if (lower.startsWith("path=")) {
        options.path = part.slice(5)
      } else if (lower.startsWith("max-age=")) {
        options.maxAge = Number(part.slice(8))
      } else if (lower === "secure") {
        options.secure = true
      } else if (lower === "httponly") {
        options.httpOnly = true
      } else if (lower.startsWith("samesite=")) {
        const sameSite = part.slice(9).toLowerCase()
        if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
          options.sameSite = sameSite
        }
      }
    }

    cookieStore.set(name, value, options)
  }
}

async function fetchCurrentUser(cookieHeader: string): Promise<AuthUser | null> {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  })

  if (!response.ok) return null

  const payload = (await response.json().catch(() => null)) as {
    user?: AuthUser
  } | null

  return payload?.user ?? null
}

async function refreshServerSession(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  cookieHeader: string
) {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
    method: "POST",
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  })

  if (!response.ok) return null

  const setCookieHeaders = response.headers.getSetCookie?.() ?? []
  if (setCookieHeaders.length > 0) {
    applySetCookieHeaders(cookieStore, setCookieHeaders)
    return buildCookieHeader(cookieStore)
  }

  return cookieHeader
}

/**
 * Reads the Perkley session on the server (RSC / layouts). Forwards browser
 * cookies to the API so auth works before client hydration — no loading flash.
 */
export const getServerSession = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (accessToken) {
    const claims = await verifyAccessToken(accessToken)
    if (claims) return authUserFromClaims(claims)
  }

  const hasRefreshCookie = cookieStore.has(REFRESH_COOKIE_NAME)
  if (!hasRefreshCookie) return null

  const initialCookieHeader = buildCookieHeader(cookieStore)
  if (!initialCookieHeader) return null

  const refreshedCookieHeader = await refreshServerSession(
    cookieStore,
    initialCookieHeader
  )
  if (!refreshedCookieHeader) return null

  return fetchCurrentUser(refreshedCookieHeader)
})

export function getDashboardPathForUser(user: AuthUser): string {
  return getDashboardPathForRole(user.role)
}
