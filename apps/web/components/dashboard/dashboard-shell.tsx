"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bell,
  Search,
} from "lucide-react"

import { PerkleyLogo } from "@/components/brand/perkley-logo"
import { InrIcon } from "@/components/dashboard/inr-icon"
import { UserMenu } from "@/components/dashboard/user-menu"
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
  variant?: "default" | "detail"
}

export function DashboardShell({
  children,
  nav,
  userName = "Creator",
  variant = "default",
}: DashboardShellProps) {
  const router = useRouter()
  const isDetail = variant === "detail"
  const isBrand = nav.some((item) => item.href.startsWith("/dashboard/brand"))
  const avatarInitial = userName.slice(0, 1).toUpperCase()

  return (
    <div
      className={cn(
        "min-h-screen",
        isDetail ? "bg-background" : "bg-[#f9fafb] dark:bg-background"
      )}
    >
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

          <div className="mx-4 hidden min-w-0 flex-1 lg:block">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search campaigns, brands..."
                className="h-10 w-full rounded-full border border-border bg-muted/40 pl-10 pr-14 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
                ⌘K
              </kbd>
            </label>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Search"
              className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
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
              <span className="tabular-nums text-reward">2,450</span>
            </div>
            <UserMenu
              name={userName}
              avatarInitial={avatarInitial}
              accountLabel={isBrand ? "Brand account" : "Creator account"}
              profileHref={isBrand ? "/dashboard/brand" : "/dashboard/profile"}
              settingsHref={isBrand ? "/dashboard/brand" : "/dashboard/profile"}
                onLogout={() => {
                  if (typeof window !== "undefined") {
                    window.localStorage.removeItem("perkley-user-role")
                  }
                  router.push("/login")
                }}
            />
          </div>
        </div>
      </header>

      <main
        className={cn(
          "mx-auto max-w-[1400px]",
          isDetail ? "px-0 py-0 sm:px-0" : "px-4 py-6 sm:px-6 sm:py-8"
        )}
      >
        {children}
      </main>
    </div>
  )
}
