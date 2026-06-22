import type { NextFunction, Request, RequestHandler, Response } from "express"

import { forbidden } from "../lib/http-error"

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

/**
 * Blocks classic cross-site cookie-forging attacks.
 *
 * Browsers send `Sec-Fetch-Site: cross-site` on embedded form/img requests from
 * other origins. Same-origin SPA fetches (including the Next.js `/api` rewrite)
 * send `same-origin`. Non-browser callers (SSR, Postman) omit the header and are
 * allowed when they use JSON or Bearer auth.
 */
export function csrfProtection(req: Request, _res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) {
    next()
    return
  }

  if (hasBearerAuthorization(req)) {
    next()
    return
  }

  if (isUploadTokenRequest(req)) {
    next()
    return
  }

  const secFetchSite = req.header("sec-fetch-site")?.toLowerCase()
  if (secFetchSite === "cross-site") {
    next(forbidden("Cross-site request blocked.", "csrf_blocked"))
    return
  }

  if (req.header("x-requested-with") === "Perkley") {
    next()
    return
  }

  const contentType = req.header("content-type") ?? ""
  if (contentType.includes("application/json")) {
    if (!secFetchSite || secFetchSite === "same-origin" || secFetchSite === "same-site") {
      next()
      return
    }
  }

  next(forbidden("Cross-site request blocked.", "csrf_blocked"))
}

export const apiCsrfProtection: RequestHandler = (req, res, next) => {
  if (!req.path.startsWith("/api")) {
    next()
    return
  }

  csrfProtection(req, res, next)
}

function hasBearerAuthorization(req: Request) {
  return Boolean(req.header("authorization")?.match(/^Bearer\s+/i))
}

function isUploadTokenRequest(req: Request) {
  return req.method === "PUT" && req.path.startsWith("/api/uploads/content/")
}
