import type { UserStatus } from "@prisma/client"

import { prisma } from "./prisma"

type CachedStatus = {
  status: UserStatus
  expiresAt: number
}

const TTL_MS = 30_000
const MAX_ENTRIES = 5_000

const cache = new Map<string, CachedStatus>()

export async function getCachedUserStatus(userId: string): Promise<UserStatus | null> {
  const now = Date.now()
  const hit = cache.get(userId)
  if (hit && hit.expiresAt > now) {
    return hit.status
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true },
  })

  if (!user) {
    cache.delete(userId)
    return null
  }

  cache.set(userId, { status: user.status, expiresAt: now + TTL_MS })
  pruneCache(now)

  return user.status
}

export function invalidateCachedUserStatus(userId: string) {
  cache.delete(userId)
}

function pruneCache(now: number) {
  if (cache.size <= MAX_ENTRIES) return

  for (const [userId, entry] of cache) {
    if (entry.expiresAt <= now) {
      cache.delete(userId)
    }
  }

  if (cache.size <= MAX_ENTRIES) return

  const overflow = cache.size - MAX_ENTRIES
  const keys = cache.keys()
  for (let index = 0; index < overflow; index += 1) {
    const key = keys.next().value
    if (key) cache.delete(key)
  }
}
