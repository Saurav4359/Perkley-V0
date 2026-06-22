import type { RequestHandler } from "express"

import { unauthorized } from "../lib/http-error"
import { getCachedUserStatus } from "../lib/user-status-cache"
import { getOptionalSession, requireSession } from "../modules/auth/session"
import { requireRoles } from "./rbac"

export { requireRoles }

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const session = await requireSession(req)
    const status = await getCachedUserStatus(session.id)

    if (status !== "active") {
      next(unauthorized("This account is not active."))
      return
    }

    req.auth = {
      id: session.id,
      role: session.role,
      email: session.email,
    }
    next()
  } catch (error) {
    next(error)
  }
}

export const optionalAuth: RequestHandler = async (req, _res, next) => {
  try {
    const session = await getOptionalSession(req)
    if (!session) {
      next()
      return
    }

    const status = await getCachedUserStatus(session.id)

    if (status === "active") {
      req.auth = {
        id: session.id,
        role: session.role,
        email: session.email,
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}
