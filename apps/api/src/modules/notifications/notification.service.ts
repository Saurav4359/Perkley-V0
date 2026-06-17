import { notFound, unauthorized } from "../../lib/http-error"
import { prisma } from "../../lib/prisma"
import { notificationKindForType } from "./notification.utils"

function serializeNotification(notification: {
  id: string
  type: string
  title: string
  body: string
  href: string | null
  readAt: Date | null
  createdAt: Date
}) {
  return {
    id: notification.id,
    title: notification.title,
    description: notification.body,
    kind: notificationKindForType(notification.type as never),
    href: notification.href ?? undefined,
    read: Boolean(notification.readAt),
    createdAt: notification.createdAt.toISOString(),
  }
}

async function requireActiveUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.status !== "active") throw unauthorized()
  return user
}

export async function listNotifications(
  userId: string,
  options: { limit?: number; unreadOnly?: boolean } = {}
) {
  await requireActiveUser(userId)

  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      readAt: options.unreadOnly ? null : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: options.limit ?? 20,
  })

  return notifications.map(serializeNotification)
}

export async function getUnreadNotificationCount(userId: string) {
  await requireActiveUser(userId)

  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  })

  return { unreadCount }
}

export async function markNotificationRead(userId: string, notificationId: string) {
  await requireActiveUser(userId)

  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  })
  if (!notification) throw notFound("Notification not found.")

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: notification.readAt ?? new Date() },
  })

  return serializeNotification(updated)
}

export async function markAllNotificationsRead(userId: string) {
  await requireActiveUser(userId)

  const result = await prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  })

  return { updatedCount: result.count }
}
