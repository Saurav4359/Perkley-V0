import type { UserRole } from "@prisma/client"
import type { Request, Response } from "express"
import { jwtVerify, SignJWT } from "jose"

import { getEnv, getRefreshCookieName, requireJwtSecret } from "../../lib/env"
import { unauthorized } from "../../lib/http-error"

const encoder = new TextEncoder()
const accessTtlSeconds = 60 * 15
const refreshTtlSeconds = 60 * 60 * 24 * 30
const sessionRoles = new Set<UserRole>(["admin", "brand", "creator"])

export type SessionUser = {
  id: string
  role: UserRole
  email: string | null
}

export type SessionTokens = {
  accessToken: string
  refreshToken: string
}

function secretKey() {
  return encoder.encode(requireJwtSecret())
}

function isProductionLikeDeployment() {
  const env = getEnv()
  return env.NODE_ENV === "production" || env.NODE_ENV === "staging"
}

function sessionCookieSameSite(): "lax" | "none" {
  return getEnv().SESSION_COOKIE_SAMESITE
}

function sessionCookieSecure() {
  const env = getEnv()
  return isProductionLikeDeployment() || env.NODE_ENV === "production" || env.SESSION_COOKIE_SAMESITE === "none"
}

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: sessionCookieSameSite(),
    secure: sessionCookieSecure(),
    maxAge: maxAgeSeconds * 1000,
  }
}

export async function signAccessToken(user: SessionUser) {
  return new SignJWT({
    role: user.role,
    email: user.email,
    typ: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${accessTtlSeconds}s`)
    .sign(secretKey())
}

export async function signRefreshToken(userId: string) {
  return new SignJWT({ typ: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${refreshTtlSeconds}s`)
    .sign(secretKey())
}

/** @deprecated Use `createSessionTokens` for new sessions. */
export async function signSession(user: SessionUser) {
  return signAccessToken(user)
}

export async function createSessionTokens(user: SessionUser): Promise<SessionTokens> {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(user),
    signRefreshToken(user.id),
  ])
  return { accessToken, refreshToken }
}

export async function verifySessionToken(token: string): Promise<SessionUser> {
  const { payload } = await jwtVerify(token, secretKey())

  if (
    payload.typ !== "access" ||
    !payload.sub ||
    typeof payload.role !== "string" ||
    !sessionRoles.has(payload.role as UserRole)
  ) {
    throw unauthorized()
  }

  return {
    id: payload.sub,
    role: payload.role as UserRole,
    email: typeof payload.email === "string" ? payload.email : null,
  }
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string }> {
  const { payload } = await jwtVerify(token, secretKey())

  if (payload.typ !== "refresh" || !payload.sub) {
    throw unauthorized()
  }

  return { userId: payload.sub }
}

export async function getOptionalSession(req: Request) {
  const env = getEnv()
  const bearer = req.header("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1]
  const token = bearer ?? req.cookies?.[env.SESSION_COOKIE_NAME]

  if (!token) return null

  try {
    return await verifySessionToken(token)
  } catch {
    return null
  }
}

export async function requireSession(req: Request) {
  const session = await getOptionalSession(req)
  if (!session) throw unauthorized()
  return session
}

export function setSessionCookies(res: Response, tokens: SessionTokens) {
  const env = getEnv()

  res.cookie(env.SESSION_COOKIE_NAME, tokens.accessToken, {
    ...cookieOptions(accessTtlSeconds),
    path: "/",
  })

  res.cookie(getRefreshCookieName(env), tokens.refreshToken, {
    ...cookieOptions(refreshTtlSeconds),
    path: "/api/auth/refresh",
  })
}

/** @deprecated Use `setSessionCookies` for new sessions. */
export function setSessionCookie(res: Response, token: string) {
  const env = getEnv()

  res.cookie(env.SESSION_COOKIE_NAME, token, {
    ...cookieOptions(accessTtlSeconds),
    path: "/",
  })
}

export function clearSessionCookies(res: Response) {
  const env = getEnv()
  const sameSite = sessionCookieSameSite()
  const secure = sessionCookieSecure()

  res.clearCookie(env.SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite,
    secure,
    path: "/",
  })

  res.clearCookie(getRefreshCookieName(env), {
    httpOnly: true,
    sameSite,
    secure,
    path: "/api/auth/refresh",
  })
}

/** @deprecated Use `clearSessionCookies`. */
export function clearSessionCookie(res: Response) {
  clearSessionCookies(res)
}
