import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  CalendarClock,
  CircleDollarSign,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import type { NotificationItem as NotificationItemType } from "@/lib/dashboard/notifications"
import { cn } from "@/lib/utils"

export function NotificationKindIcon({
  kind,
  compact = false,
}: {
  kind: NotificationItemType["kind"]
  compact?: boolean
}) {
  const sizeClass = compact ? "size-7" : "size-8"
  const iconClass = compact ? "size-3.5" : "size-4"

  if (kind === "qualified") {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600",
          sizeClass
        )}
      >
        <BadgeCheck className={iconClass} />
      </span>
    )
  }

  if (kind === "new") {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand",
          sizeClass
        )}
      >
        <Sparkles className={iconClass} />
      </span>
    )
  }

  if (kind === "payout") {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400",
          sizeClass
        )}
      >
        <CircleDollarSign className={iconClass} />
      </span>
    )
  }

  if (kind === "deadline" || kind === "review") {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-400",
          sizeClass
        )}
      >
        <CalendarClock className={iconClass} />
      </span>
    )
  }

  if (kind === "verification") {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-600",
          sizeClass
        )}
      >
        <ShieldCheck className={iconClass} />
      </span>
    )
  }

  if (kind === "submit") {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-600",
          sizeClass
        )}
      >
        <ArrowRight className={iconClass} />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
        sizeClass
      )}
    >
      <BellRing className={iconClass} />
    </span>
  )
}

type NotificationItemProps = {
  item: NotificationItemType
  onSelect?: () => void
  compact?: boolean
  className?: string
}

export function NotificationItemRow({
  item,
  onSelect,
  compact = false,
  className,
}: NotificationItemProps) {
  const content = (
    <>
      <NotificationKindIcon kind={item.kind} compact={compact} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p
            className={cn(
              "min-w-0 flex-1 text-sm text-foreground",
              !item.read && "font-medium"
            )}
          >
            {item.title}
          </p>
          {!item.read ? (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" aria-hidden />
          ) : null}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {item.description}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground/80">{item.time}</p>
      </div>
    </>
  )

  const rowClassName = cn(
    "flex w-full gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
    !item.read && "bg-brand/[0.03]",
    className
  )

  if (item.href) {
    return (
      <Link
        href={item.href}
        onClick={onSelect}
        className={rowClassName}
      >
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onSelect} className={rowClassName}>
      {content}
    </button>
  )
}
