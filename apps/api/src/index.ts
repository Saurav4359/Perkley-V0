import { getEnv } from "./lib/env"
import { prisma } from "./lib/prisma"
import { createApp } from "./app"

const env = getEnv()
const app = createApp()

const server = app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`)
})

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down API`)

  server.close(async (error) => {
    if (error) {
      console.error(error)
      process.exit(1)
    }

    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on("SIGINT", () => {
  void shutdown("SIGINT")
})

process.on("SIGTERM", () => {
  void shutdown("SIGTERM")
})
