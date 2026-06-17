"use client"

import { useCallback } from "react"
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  type ApiNotification,
} from "@/lib/api/notifications"
import type { NotificationItem } from "@/lib/dashboard/notifications"
import { formatRelativeTime } from "@/lib/dashboard/utils"

export const notificationKeys = {
  list: ["notifications", "list"] as const,
  unread: ["notifications", "unread-count"] as const,
}

function toNotificationItem(item: ApiNotification): NotificationItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    time: formatRelativeTime(item.createdAt),
    kind: item.kind,
    href: item.href,
    read: item.read,
  }
}

/**
 * Backend-backed notifications. The server scopes notifications to the
 * authenticated user, so no role argument is required.
 */
export function useNotifications() {
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: notificationKeys.list,
    queryFn: () => fetchNotifications({ limit: 30 }),
  })

  const unreadQuery = useQuery({
    queryKey: notificationKeys.unread,
    queryFn: fetchUnreadNotificationCount,
    refetchInterval: 60_000,
  })

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] })
  }, [queryClient])

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: invalidate,
  })

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: invalidate,
  })

  const items: NotificationItem[] = (listQuery.data ?? []).map(toNotificationItem)
  const unreadCount =
    unreadQuery.data ?? items.filter((item) => !item.read).length

  return {
    items,
    unreadCount,
    isLoading: listQuery.isLoading,
    refresh: invalidate,
    markRead: (id: string) => markReadMutation.mutate(id),
    markAllRead: () => markAllMutation.mutate(),
  }
}
