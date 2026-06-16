import pino from "pino"

import { getEnv } from "./env"

const env = getEnv()

export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  base: {
    service: "perkley-api",
    env: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV,
  },
})
