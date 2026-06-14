import { Hono } from "hono"
import { cors } from "hono/cors"

import { waitlistRoutes } from "./routes/waitlist"

const app = new Hono()

app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    allowMethods: ["GET", "POST", "OPTIONS"],
  })
)

app.get("/health", (c) => c.json({ ok: true }))

app.get("/", (c) =>
  c.json({
    name: "Perkley API",
    version: "0.1.0",
    endpoints: {
      health: "GET /health",
      waitlist: "POST /api/waitlist",
    },
  })
)

app.route("/api/waitlist", waitlistRoutes)

app.notFound((c) =>
  c.json(
    {
      error: "Not found",
      endpoints: {
        health: "GET /health",
        waitlist: "POST /api/waitlist",
      },
    },
    404
  )
)

const port = Number(process.env.PORT ?? 3001)

console.log(`API listening on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
