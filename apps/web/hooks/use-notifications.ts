"use client"

import { useCallback, useEffect, useState } from "react"

import {
  getNotificationsForRole,
  getUnreadNotificationCount,
  type NotificationItem,
} from "@/lib/dashboard/notifications"

export function useNotifications(role: "creator" | "brand") {
  const [items, setItems] = useState<NotificationItem[]>(() =>
    getNotificationsForRole(role)
  )
  const [unreadCount, setUnreadCount] = useState(() =>
    getUnreadNotificationCount(role)
  )

  const refresh = useCallback(() => {
    setItems(getNotificationsForRole(role))
    setUnreadCount(getUnreadNotificationCount(role))
  }, [role])

  useEffect(() => {
    refresh()

    function handleStorage(event: StorageEvent) {
      if (event.key === "perkley-notification-read-ids" || event.key === null) {
        refresh()
      }
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener("perkley-notifications-updated", refresh)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("perkley-notifications-updated", refresh)
    }
  }, [refresh])

  return { items, unreadCount, refresh }
}
