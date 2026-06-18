"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/hooks/use-auth"

export function AuthGuestGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return

    if (user.role === "brand") {
      router.replace("/dashboard/brand")
      return
    }

    if (user.role === "admin") {
      router.replace("/dashboard/admin")
      return
    }

    router.replace("/dashboard")
  }, [isAuthenticated, isLoading, router, user])

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      </div>
    )
  }

  return children
}
