export type NotificationKind =
  | "submit"
  | "qualified"
  | "payout"
  | "new"
  | "deadline"
  | "review"
  | "verification"

export type DashboardNotification = {
  id: string
  title: string
  description: string
  time: string
  kind: NotificationKind
  href?: string
}

export type NotificationItem = DashboardNotification & {
  read: boolean
}

const READ_IDS_KEY = "perkley-notification-read-ids"

export const CREATOR_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: "creator-1",
    title: "Submission under review",
    description: "Your entry for Vitamin C launch reel sprint is being reviewed",
    time: "12m ago",
    kind: "submit",
    href: "/dashboard/work",
  },
  {
    id: "creator-2",
    title: "You qualified for payout",
    description: "Your UPI demo reel hit the view threshold",
    time: "1h ago",
    kind: "qualified",
    href: "/dashboard/work",
  },
  {
    id: "creator-3",
    title: "Payout processed",
    description: "₹2,450 was sent to your linked UPI account",
    time: "3h ago",
    kind: "payout",
    href: "/dashboard/earnings",
  },
  {
    id: "creator-4",
    title: "New bounty live",
    description: "Northline Skincare posted Vitamin C launch reel sprint",
    time: "5h ago",
    kind: "new",
    href: "/dashboard",
  },
  {
    id: "creator-5",
    title: "Deadline reminder",
    description: "Monsoon drop lookbook ends in 2 days",
    time: "1d ago",
    kind: "deadline",
    href: "/dashboard/discover",
  },
  {
    id: "creator-6",
    title: "Profile verification complete",
    description: "Your Instagram profile is verified — you can submit to listings",
    time: "2d ago",
    kind: "verification",
    href: "/dashboard/profile",
  },
]

export const BRAND_NOTIFICATIONS: DashboardNotification[] = [
  {
    id: "brand-1",
    title: "New creator submission",
    description: "Alex Rivera submitted to Vitamin C launch reel sprint",
    time: "2m ago",
    kind: "submit",
    href: "/dashboard/brand/campaigns",
  },
  {
    id: "brand-2",
    title: "Submissions need review",
    description: "9 entries are waiting on Summer shred challenge",
    time: "45m ago",
    kind: "review",
    href: "/dashboard/brand/campaigns",
  },
  {
    id: "brand-3",
    title: "Campaign moved to reviewing",
    description: "UPI demo reel closed and is ready for winner selection",
    time: "2h ago",
    kind: "deadline",
    href: "/dashboard/brand/campaigns",
  },
  {
    id: "brand-4",
    title: "Payout confirmed",
    description: "Winner payout of ₹25,000 was processed successfully",
    time: "6h ago",
    kind: "payout",
    href: "/dashboard/brand/analytics",
  },
  {
    id: "brand-5",
    title: "New bounty published",
    description: "Your Monsoon drop lookbook bounty is now live",
    time: "1d ago",
    kind: "new",
    href: "/dashboard/brand/campaigns",
  },
  {
    id: "brand-6",
    title: "Verification pending",
    description: "We're reviewing your business verification documents",
    time: "2d ago",
    kind: "verification",
    href: "/dashboard/brand/settings",
  },
]

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set()

  try {
    const raw = localStorage.getItem(READ_IDS_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveReadIds(ids: Set<string>) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(READ_IDS_KEY, JSON.stringify([...ids]))
  } catch {
    // ignore storage failures
  }
}

export function getNotificationsForRole(role: "creator" | "brand"): NotificationItem[] {
  const source = role === "brand" ? BRAND_NOTIFICATIONS : CREATOR_NOTIFICATIONS
  const readIds = loadReadIds()

  return source.map((item) => ({
    ...item,
    read: readIds.has(item.id),
  }))
}

export function getUnreadNotificationCount(role: "creator" | "brand"): number {
  return getNotificationsForRole(role).filter((item) => !item.read).length
}

export function markNotificationRead(id: string) {
  const readIds = loadReadIds()
  readIds.add(id)
  saveReadIds(readIds)
}

export function markAllNotificationsRead(role: "creator" | "brand") {
  const readIds = loadReadIds()
  const source = role === "brand" ? BRAND_NOTIFICATIONS : CREATOR_NOTIFICATIONS
  for (const item of source) {
    readIds.add(item.id)
  }
  saveReadIds(readIds)
}

export function notifyNotificationsUpdated() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event("perkley-notifications-updated"))
}

export function markNotificationReadAndNotify(id: string) {
  markNotificationRead(id)
  notifyNotificationsUpdated()
}

export function markAllNotificationsReadAndNotify(role: "creator" | "brand") {
  markAllNotificationsRead(role)
  notifyNotificationsUpdated()
}

export function getNotificationsHref(role: "creator" | "brand"): string {
  return role === "brand" ? "/dashboard/brand/notifications" : "/dashboard/notifications"
}
