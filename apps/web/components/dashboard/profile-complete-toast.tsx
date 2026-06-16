"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function ProfileCompleteToast() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get("profileComplete") !== "1") return

    setVisible(true)
    router.replace("/dashboard")

    const timer = window.setTimeout(() => {
      setVisible(false)
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [router, searchParams])

  if (!visible) return null

  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
        "rounded-full border border-emerald-500/20 bg-card px-4 py-2 shadow-lg",
        "text-sm font-medium text-foreground"
      )}
    >
      <span className="inline-flex items-center gap-2">
        <CheckIcon className="size-4 text-emerald-600" strokeWidth={2.5} />
        Profile complete
      </span>
    </div>
  )
}
