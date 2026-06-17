import { apiFetch } from "@/lib/api/client"
import type { NotificationKind } from "@/lib/dashboard/notifications"

export type ApiNotification = {
  id: string
  title: string
  description: string
  kind: NotificationKind
  href?: string
  read: boolean
  createdAt: string
}

export async function fetchNotifications(options?: {
  limit?: number
  unreadOnly?: boolean
}): Promise<ApiNotification[]> {
  const params = new URLSearchParams()
  if (options?.limit) params.set("limit", String(options.limit))
  if (options?.unreadOnly) params.set("unreadOnly", "true")
  const query = params.toString() ? `?${params.toString()}` : ""

  const { notifications } = await apiFetch<{ notifications: ApiNotification[] }>(
    `/api/notifications${query}`
  )
  return notifications
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const { unreadCount } = await apiFetch<{ unreadCount: number }>(
    "/api/notifications/unread-count"
  )
  return unreadCount
}

export async function markNotificationRead(
  id: string
): Promise<ApiNotification> {
  const { notification } = await apiFetch<{ notification: ApiNotification }>(
    `/api/notifications/${id}/read`,
    { method: "POST" }
  )
  return notification
}

export async function markAllNotificationsRead(): Promise<number> {
  const { updatedCount } = await apiFetch<{ updatedCount: number }>(
    "/api/notifications/read-all",
    { method: "POST" }
  )
  return updatedCount
}
