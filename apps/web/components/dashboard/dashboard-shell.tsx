"use client"

import Link from "next/link"
import {
  Bell,
  ChevronDown,
  Search,
} from "lucide-react"

import { PerkleyLogo } from "@/components/brand/perkley-logo"
import { InrIcon } from "@/components/dashboard/inr-icon"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

type NavItem = {
  label: string
  href: string
  active?: boolean
}

type DashboardShellProps = {
  children: React.ReactNode
  nav: readonly NavItem[]
  userName?: string
}

export function DashboardShell({
  children,
  nav,
  userName = "Creator",
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 sm:h-16 sm:px-6">
          <Link href="/dashboard" className="shrink-0">
            <PerkleyLogo
              markClassName="h-8 w-8 sm:h-9 sm:w-9"
              textClassName="text-base sm:text-[1.05rem]"
            />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  item.active
                    ? "text-foreground after:absolute after:inset-x-3 after:-bottom-[17px] after:h-0.5 after:rounded-full after:bg-brand sm:after:-bottom-[19px]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Search"
              className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Search className="size-4" />
            </button>
            <ThemeToggle />
            <button
              type="button"
              aria-label="Notifications"
              className="relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-brand" />
            </button>
            <div className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium sm:flex">
              <InrIcon className="size-4" />
              <span className="tabular-nums text-reward">0</span>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 transition-colors hover:bg-muted"
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                {userName.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-[7rem] truncate text-sm font-medium sm:inline">
                {userName}
              </span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  )
}
