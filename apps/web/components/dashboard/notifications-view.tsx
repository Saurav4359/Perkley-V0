"use client"

import { NotificationItemRow } from "@/components/dashboard/notification-item"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/hooks/use-notifications"
import {
  markAllNotificationsReadAndNotify,
  markNotificationReadAndNotify,
} from "@/lib/dashboard/notifications"

type NotificationsViewProps = {
  role: "creator" | "brand"
}

export function NotificationsView({ role }: NotificationsViewProps) {
  const { items, unreadCount, refresh } = useNotifications(role)

  function handleMarkAllRead() {
    markAllNotificationsReadAndNotify(role)
    refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {role === "brand"
              ? "Submissions, reviews, payouts, and campaign updates for your brand."
              : "Submission status, campaign updates, and payout alerts for your creator account."}
          </p>
        </div>
        {unreadCount > 0 ? (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[1.15rem] border border-border bg-card">
        {items.length === 0 ? (
          <div className="px-4 py-16 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          <div className="divide-y divide-border/70 p-1">
            {items.map((item) => (
              <NotificationItemRow
                key={item.id}
                item={item}
                onSelect={() => {
                  markNotificationReadAndNotify(item.id)
                  refresh()
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
