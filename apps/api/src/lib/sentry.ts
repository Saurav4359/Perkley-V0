import * as Sentry from "@sentry/bun"

import { getEnv } from "./env"
import { logger } from "./logger"

let initialized = false

export function initSentry() {
  if (initialized) return

  const env = getEnv()

  if (!env.SENTRY_DSN) {
    logger.debug("Sentry DSN not set — error tracking disabled")
    return
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1,
  })

  initialized = true
  logger.info("Sentry initialized")
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!initialized) {
    logger.error({ err: error, ...context }, "Unhandled error (Sentry disabled)")
    return
  }

  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext("extra", context)
    }
    Sentry.captureException(error)
  })
}
