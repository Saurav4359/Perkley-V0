"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { getBrandDashboardPath } from "@/lib/brand-onboarding/storage"
import { getUserRole } from "@/lib/onboarding/storage"

export function DashboardOnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const role = getUserRole()

    if (role === "brand") {
      if (pathname.startsWith("/brand-onboarding")) {
        setReady(true)
        return
      }

      const brandPath = getBrandDashboardPath()
      if (brandPath === "/brand-onboarding" && !pathname.startsWith("/brand-onboarding")) {
        router.replace(brandPath)
        return
      }

      if (!pathname.startsWith("/dashboard/brand")) {
        router.replace("/dashboard/brand")
        return
      }

      setReady(true)
      return
    }

    if (pathname.startsWith("/dashboard/brand")) {
      router.replace("/dashboard")
      return
    }

    setReady(true)
  }, [pathname, router])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      </div>
    )
  }

  return children
}
