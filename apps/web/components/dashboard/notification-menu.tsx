"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Bell } from "lucide-react"

import { NotificationItemRow } from "@/components/dashboard/notification-item"
import { useNotifications } from "@/hooks/use-notifications"
import {
  getNotificationsHref,
  markNotificationReadAndNotify,
} from "@/lib/dashboard/notifications"
import { cn } from "@/lib/utils"

const PREVIEW_COUNT = 5

type NotificationMenuProps = {
  role: "creator" | "brand"
}

export function NotificationMenu({ role }: NotificationMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const { items, unreadCount } = useNotifications(role)
  const previewItems = items.slice(0, PREVIEW_COUNT)
  const viewAllHref = getNotificationsHref(role)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  function handleSelect(id: string) {
    markNotificationReadAndNotify(id)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          open && "bg-muted text-foreground"
        )}
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-brand" />
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-border/80 bg-background shadow-lg shadow-black/5"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`
                  : "You're all caught up"}
              </p>
            </div>
          </div>

          <div className="perkley-scrollbar max-h-[min(24rem,60vh)] overflow-y-auto p-1">
            {previewItems.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              previewItems.map((item) => (
                <NotificationItemRow
                  key={item.id}
                  item={item}
                  compact
                  onSelect={() => handleSelect(item.id)}
                />
              ))
            )}
          </div>

          <div className="border-t border-border/60 p-1">
            <Link
              href={viewAllHref}
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium text-brand transition-colors hover:bg-muted/60"
            >
              View all
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
