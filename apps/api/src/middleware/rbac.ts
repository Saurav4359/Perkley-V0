import type { UserRole } from "@prisma/client"
import type { NextFunction, Request, RequestHandler, Response } from "express"

import { forbidden, unauthorized } from "../lib/http-error"
import type { SessionUser } from "../modules/auth/session"

declare global {
  namespace Express {
    interface Request {
      auth?: SessionUser
    }
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
