"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuth } from "@/hooks/use-auth"
import { getBrandDashboardPath } from "@/lib/brand-onboarding/storage"
import { getUserRole } from "@/lib/onboarding/storage"

// Decision derived during render (no setState-in-effect):
//   null      → still checking the session, show spinner
//   string    → redirect to this path, show spinner until it happens
//   undefined → authorized for the current route, render children
type GateDecision = string | null | undefined

export function DashboardOnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  const decision: GateDecision = (() => {
    // Wait for the real session check (`/api/auth/me`) before deciding.
    if (isLoading) return null

    // Authoritative protection: no app session → back to login.
    if (!isAuthenticated) return "/login"

    // Prefer the role from the verified session; fall back to local hint.
    const role = user?.role === "brand" ? "brand" : getUserRole()

    if (role === "brand") {
      if (pathname.startsWith("/brand-onboarding")) return undefined

      const brandPath = getBrandDashboardPath()
      if (brandPath === "/brand-onboarding" && !pathname.startsWith("/brand-onboarding")) {
        return brandPath
      }
      if (!pathname.startsWith("/dashboard/brand")) return "/dashboard/brand"
      return undefined
    }

    if (pathname.startsWith("/dashboard/brand")) return "/dashboard"
    return undefined
  })()

  useEffect(() => {
    if (typeof decision === "string") {
      router.replace(decision)
    }
  }, [decision, router])

  if (decision !== undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      </div>
    )
  }

  return children
}
