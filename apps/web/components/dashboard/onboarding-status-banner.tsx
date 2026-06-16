"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { useOnboardingProgress } from "@/hooks/use-onboarding-progress"
import { ONBOARDING_STEP_COUNT } from "@/lib/onboarding/constants"
import { cn } from "@/lib/utils"

type OnboardingStatusBannerProps = {
  className?: string
}

export function OnboardingStatusBanner({ className }: OnboardingStatusBannerProps) {
  const { canParticipate, completionPercent, resumeStep } = useOnboardingProgress()

  if (canParticipate) return null

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-border/80 bg-card px-3 py-2.5 sm:px-4",
        className
      )}
    >
      <span className="shrink-0 rounded-full bg-brand-muted px-2 py-0.5 text-[11px] font-semibold text-brand">
        Step {resumeStep}/{ONBOARDING_STEP_COUNT}
      </span>

      <p className="min-w-0 flex-1 text-xs font-semibold text-foreground sm:text-sm">
        Complete your profile to participate
      </p>

      <div className="hidden h-1 w-16 shrink-0 overflow-hidden rounded-full bg-muted sm:block lg:w-20">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-300"
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      <Link
        href={`/onboarding?step=${resumeStep}`}
        className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand transition-colors hover:text-brand/80 sm:text-sm"
      >
        Complete profile
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}
