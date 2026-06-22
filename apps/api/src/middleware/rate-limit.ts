import rateLimit from "express-rate-limit"

import { getEnv } from "../lib/env"

// Disable rate limiting in local development so testing isn't blocked.
const skipInDevelopment = () => getEnv().NODE_ENV === "development"

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: skipInDevelopment,
  message: {
    error: "Too many authentication attempts. Try again later.",
    code: "rate_limited",
  },
})

export const oauthRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: skipInDevelopment,
  message: {
    error: "Too many OAuth attempts. Try again later.",
    code: "rate_limited",
  },
})

export const publicReadRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: skipInDevelopment,
  message: {
    error: "Too many requests. Try again later.",
    code: "rate_limited",
  },
})

export const uploadContentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: skipInDevelopment,
  message: {
    error: "Too many upload attempts. Try again later.",
    code: "rate_limited",
  },
})
