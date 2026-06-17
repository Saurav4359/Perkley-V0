import type { UserRole } from "@prisma/client"
import type { NextFunction, Request, RequestHandler, Response } from "express"

import { forbidden, unauthorized } from "../lib/http-error"
import { getOptionalSession, requireSession, type SessionUser } from "../modules/auth/session"

declare global {
  namespace Express {
    interface Request {
      auth?: SessionUser
    }
  }
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    req.auth = await requireSession(req)
    next()
  } catch (error) {
    next(error)
  }
}

export const optionalAuth: RequestHandler = async (req, _res, next) => {
  try {
    req.auth = await getOptionalSession(req) ?? undefined
    next()
  } catch (error) {
    next(error)
  }
}

export function requireRoles(...roles: UserRole[]): RequestHandler {
  const allowed = new Set<UserRole>(roles)

  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      next(unauthorized())
      return
    }

    if (!allowed.has(req.auth.role)) {
      next(forbidden("You do not have permission to access this resource."))
      return
    }

    next()
  }
}
