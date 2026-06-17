import type { UserRole } from "@prisma/client"
import type { Request, Response } from "express"
import { jwtVerify, SignJWT } from "jose"

import { getEnv, requireJwtSecret } from "../../lib/env"
import { unauthorized } from "../../lib/http-error"

const encoder = new TextEncoder()
const sessionTtlSeconds = 60 * 60 * 24 * 30
const sessionRoles = new Set<UserRole>(["admin", "brand", "creator"])

export type SessionUser = {
  id: string
  role: UserRole
  email: string | null
}

function secretKey() {
  return encoder.encode(requireJwtSecret())
}

export async function signSession(user: SessionUser) {
  return new SignJWT({
    role: user.role,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${sessionTtlSeconds}s`)
    .sign(secretKey())
}

export async function verifySessionToken(token: string): Promise<SessionUser> {
  const { payload } = await jwtVerify(token, secretKey())

  if (
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

export function setSessionCookie(res: Response, token: string) {
  const env = getEnv()

  res.cookie(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    maxAge: sessionTtlSeconds * 1000,
    path: "/",
  })
}

export function clearSessionCookie(res: Response) {
  const env = getEnv()

  res.clearCookie(env.SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
  })
}
