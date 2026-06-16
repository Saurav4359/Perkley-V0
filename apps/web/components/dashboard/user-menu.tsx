"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
  BarChart3,
  ChevronDownIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"

type UserMenuProps = {
  name: string
  avatarInitial: string
  accountLabel?: string
  settingsHref?: string
  profileHref?: string
  analyticsHref?: string
  onLogout?: () => void
}

export function UserMenu({
  name,
  avatarInitial,
  accountLabel = "Creator account",
  settingsHref = "/dashboard/profile",
  profileHref = "/dashboard/profile",
  analyticsHref,
  onLogout,
}: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

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

  function handleLogout() {
    setOpen(false)
    onLogout?.()
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 transition-colors hover:bg-muted"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
          {avatarInitial}
        </span>
        <span className="hidden max-w-[7rem] truncate text-sm font-medium sm:inline">
          {name}
        </span>
        <ChevronDownIcon
          className={cn(
            "size-3.5 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
          strokeWidth={2}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[12rem] overflow-hidden rounded-xl border border-border/80 bg-background p-1 shadow-lg shadow-black/5"
        >
          <div className="border-b border-border/60 px-3 py-2.5">
            <p className="text-sm font-medium text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{accountLabel}</p>
          </div>

          <Link
            role="menuitem"
            href={profileHref}
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/60"
          >
            <UserIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
            Profile
          </Link>

          {analyticsHref ? (
            <Link
              role="menuitem"
              href={analyticsHref}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/60"
            >
              <BarChart3 className="size-4 text-muted-foreground" strokeWidth={1.75} />
              Analytics
            </Link>
          ) : null}

          <Link
            role="menuitem"
            href={settingsHref}
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/60"
          >
            <SettingsIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
            Settings
          </Link>

          <div className="my-1 h-px bg-border/60" />

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/60"
          >
            <LogOutIcon className="size-4 text-muted-foreground" strokeWidth={1.75} />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  )
}
