"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { getUserRole } from "@/lib/onboarding/storage"

export function DashboardOnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (pathname.startsWith("/dashboard/brand")) {
      setReady(true)
      return
    }

    const role = getUserRole()
    if (role === "brand") {
      router.replace("/dashboard/brand")
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
