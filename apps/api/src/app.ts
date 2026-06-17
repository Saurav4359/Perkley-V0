import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"

import { getEnv } from "./lib/env"
import { requestLog } from "./lib/request-log"
import { errorHandler } from "./middleware/error-handler"
import { analyticsRoutes } from "./modules/analytics/analytics.routes"
import { authRoutes } from "./modules/auth/auth.routes"
import { campaignRoutes } from "./modules/campaigns/campaign.routes"
import {
  brandDashboardRoutes,
  creatorDashboardRoutes,
} from "./modules/dashboard/dashboard.routes"
import { notificationRoutes } from "./modules/notifications/notification.routes"
import { brandProfileRoutes, creatorProfileRoutes } from "./modules/profiles/profile.routes"
import { mediaRoutes, uploadRoutes } from "./modules/uploads/upload.routes"
import { userRoutes } from "./modules/users/user.routes"

export function createApp() {
  const env = getEnv()
  const app = express()

  app.disable("x-powered-by")
  app.set("trust proxy", 1)

  app.use(helmet())
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    })
  )
  app.use(express.json({ limit: "1mb" }))
  app.use(cookieParser())
  app.use(requestLog)

  app.get("/health", (_req, res) => {
    res.json({ ok: true })
  })

  app.get("/", (_req, res) => {
    res.json({
      name: "Perkley API",
      version: "0.1.0",
      endpoints: {
        health: "GET /health",
        auth: "/api/auth",
      },
    })
  })

  app.use("/api/auth", authRoutes)
  app.use("/api/campaigns", campaignRoutes)
  app.use("/api/dashboard/creator", creatorDashboardRoutes)
  app.use("/api/dashboard/brand", brandDashboardRoutes)
  app.use("/api/notifications", notificationRoutes)
  app.use("/api/analytics", analyticsRoutes)
  app.use("/api/users", userRoutes)
  app.use("/api/creator", creatorProfileRoutes)
  app.use("/api/brand", brandProfileRoutes)
  app.use("/api/uploads", uploadRoutes)
  app.use("/api/media", mediaRoutes)

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found", code: "not_found" })
  })

  app.use(errorHandler)

  return app
}
