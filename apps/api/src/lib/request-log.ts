import type { MiddlewareHandler } from "hono"

import { logger } from "./logger"

export const requestLogMiddleware: MiddlewareHandler = async (c, next) => {
  const start = Date.now()
  const { method } = c.req
  const path = c.req.path

  await next()

  const durationMs = Date.now() - start
  const status = c.res.status

  const log = status >= 500 ? logger.error.bind(logger) : logger.info.bind(logger)

  log(
    {
      method,
      path,
      status,
      durationMs,
    },
    "request completed"
  )
}
