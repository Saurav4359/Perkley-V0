import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

import { requireDatabaseEnv } from "./env"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

const { databaseUrl } = requireDatabaseEnv()
const adapter = new PrismaPg(databaseUrl)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
