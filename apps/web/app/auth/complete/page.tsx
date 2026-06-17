"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"

import { authQueryKey } from "@/hooks/use-auth"
import { bridgeSupabaseSession } from "@/lib/api/auth"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { getBrandDashboardPath } from "@/lib/brand-onboarding/storage"
import {
  clearOnboardingPending,
  initBrandSession,
  setUserRole,
} from "@/lib/onboarding/storage"

function CompleteSignIn() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    // Guard against React Strict Mode double-invoking the effect.
    if (ran.current) return
    ran.current = true

    const role = searchParams.get("role") === "brand" ? "brand" : "creator"
    const next = searchParams.get("next")

    async function finish() {
      try {
        const supabase = createSupabaseBrowserClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
          throw new Error("missing-session")
        }

        // Exchange the verified Supabase identity for the app's own session.
        const user = await bridgeSupabaseSession({
          accessToken: session.access_token,
          role,
        })
        queryClient.setQueryData(authQueryKey, user)

        if (next) {
          router.replace(next)
          return
        }

        if (user.role === "brand") {
          initBrandSession({ workEmail: user.email ?? "" })
          router.replace(getBrandDashboardPath())
          return
        }

        setUserRole("creator")
        clearOnboardingPending()
        router.replace("/dashboard")
      } catch {
        setError("We couldn't complete your sign-in. Please try again.")
      }
    }

    void finish()
  }, [router, searchParams, queryClient])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <button
          type="button"
          onClick={() => router.replace("/login")}
          className="text-sm font-semibold text-foreground hover:text-brand"
        >
          Back to login
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <div className="size-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      <p className="text-sm text-muted-foreground">Finishing sign-in…</p>
    </div>
  )
}

export default function AuthCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="size-8 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
      }
    >
      <CompleteSignIn />
    </Suspense>
  )
}
