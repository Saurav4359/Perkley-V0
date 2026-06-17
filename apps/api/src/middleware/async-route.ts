import type { RequestHandler } from "express"

export function asyncRoute(handler: RequestHandler): RequestHandler {
  return async (req, res, next) => {
    try {
      await handler(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
