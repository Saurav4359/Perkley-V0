"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { PerkleyLogo } from "@/components/brand/perkley-logo"
import {
  DashboardSearch,
  DashboardSearchMobilePanel,
  DashboardSearchMobileTrigger,
} from "@/components/dashboard/dashboard-search"
import { InrIcon } from "@/components/dashboard/inr-icon"
import { NotificationMenu } from "@/components/dashboard/notification-menu"
import { UserMenu } from "@/components/dashboard/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSignout } from "@/hooks/use-auth"
import { useBrandProfile, useCreatorProfile } from "@/hooks/use-profile"
import { clearUserSession } from "@/lib/onboarding/storage"
import { getBrandHeaderName } from "@/lib/dashboard/brand-profile-storage"
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
  const signout = useSignout()
  const isDetail = variant === "detail"
  const isBrand = nav.some((item) => item.href.startsWith("/dashboard/brand"))
  const [headerName, setHeaderName] = useState(userName)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const avatarInitial = headerName.slice(0, 1).toUpperCase()

  const creatorProfile = useCreatorProfile(!isBrand)
  const brandProfile = useBrandProfile(isBrand)

  useEffect(() => {
    if (!isBrand) {
      setHeaderName(userName)
      return
    }

    function syncBrandName() {
      setHeaderName(getBrandHeaderName())
    }

    syncBrandName()
    window.addEventListener("perkley-brand-profile-updated", syncBrandName)
    return () => window.removeEventListener("perkley-brand-profile-updated", syncBrandName)
  }, [isBrand, userName])

  // Prefer the authenticated profile name from the backend once it loads.
  useEffect(() => {
    const apiName = isBrand
      ? brandProfile.data?.brandName
      : creatorProfile.data?.displayName
    if (apiName) setHeaderName(apiName)
  }, [isBrand, brandProfile.data?.brandName, creatorProfile.data?.displayName])

  return (
    <div
      className={cn(
        "min-h-screen",
        isDetail ? "bg-background" : "bg-[#f9fafb] dark:bg-background"
      )}
    >
      <header className="sticky top-0 z-40 overflow-visible border-b border-border bg-background/95 backdrop-blur-md">
        <div className="relative mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 sm:h-16 sm:px-6">
          <Link href={isBrand ? "/dashboard/brand" : "/dashboard"} className="shrink-0">
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

          <div className="mx-4 hidden min-w-0 flex-1 md:block">
            <DashboardSearch mode={isBrand ? "brand" : "creator"} />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <DashboardSearchMobileTrigger
              mode={isBrand ? "brand" : "creator"}
              onOpenChange={setMobileSearchOpen}
            />
            <ThemeToggle />
            <NotificationMenu role={isBrand ? "brand" : "creator"} />
            <div className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium sm:flex">
              <InrIcon className="size-4" />
              <span className="tabular-nums text-reward">2,450</span>
            </div>
            <UserMenu
              name={headerName}
              avatarInitial={avatarInitial}
              accountLabel={isBrand ? "Brand account" : "Creator account"}
              profileHref={isBrand ? "/dashboard/brand/profile" : "/dashboard/profile"}
              analyticsHref={isBrand ? "/dashboard/brand/analytics" : undefined}
              settingsHref={
                isBrand ? "/dashboard/brand/settings" : "/dashboard/settings"
              }
              onLogout={async () => {
                try {
                  await signout.mutateAsync()
                } catch {
                  // Clear the local session regardless of API outcome.
                }
                clearUserSession()
                router.replace("/")
              }}
            />
          </div>
        </div>

        <DashboardSearchMobilePanel
          mode={isBrand ? "brand" : "creator"}
          open={mobileSearchOpen}
          onClose={() => setMobileSearchOpen(false)}
        />
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
