"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { useAuth } from "@/hooks/use-auth"
import { dashboardPathForRole } from "@/lib/auth/redirect"

/**
 * Client fallback when the user already has a session cookie but landed on
 * /login (e.g. before proxy runs or JWT env was misconfigured).
 */
export function LoginSessionRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return

    const next = searchParams.get("next")
    router.replace(dashboardPathForRole(user.role, next))
  }, [isAuthenticated, isLoading, router, searchParams, user])

  return null
}
