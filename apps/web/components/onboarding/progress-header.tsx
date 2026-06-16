"use client"

import { ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"

import { useOnboarding } from "@/components/onboarding/onboarding-provider"

import { ONBOARDING_STEP_COUNT } from "@/lib/onboarding/constants"
import { getOnboardingStepProgressPercent } from "@/lib/onboarding/progress"
import type { OnboardingStep } from "@/lib/onboarding/types"
import { cn } from "@/lib/utils"

type ProgressHeaderProps = {
  step: OnboardingStep
  completing?: boolean
}

export function ProgressHeader({ step, completing = false }: ProgressHeaderProps) {
  const progress = completing ? 100 : getOnboardingStepProgressPercent(step)

  return (
    <div className="mb-5 space-y-2.5 sm:mb-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-brand">Complete your profile</p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {completing ? "All set" : `Step ${step} of ${ONBOARDING_STEP_COUNT}`}
          </h1>
          <span className="text-sm tabular-nums text-muted-foreground">{progress}%</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand to-[#FF8547]"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: completing ? 1.2 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </div>
        <p className="text-xs leading-snug text-muted-foreground">
          {completing
            ? "Wrapping up — you’ll land on your dashboard in a moment."
            : "You can finish later — profile setup is required before you submit to any listing."}
        </p>
      </div>
    </div>
  )
}

export function onboardingCardClassName(className?: string) {
  return cn(
    "rounded-[1.5rem] border border-border/70 bg-card p-6",
    "shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_40px_-20px_rgba(0,0,0,0.08)]",
    "dark:shadow-[0_1px_2px_rgba(0,0,0,0.35),0_12px_40px_-20px_rgba(0,0,0,0.55)]",
    "sm:p-7",
    className
  )
}

export function onboardingPrimaryButtonClassName(className?: string) {
  return cn(
    "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-8 text-sm font-semibold text-white transition-all",
    "hover:bg-brand/90 hover:-translate-y-px active:translate-y-0",
    "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0",
    className
  )
}

export function onboardingSecondaryButtonClassName(className?: string) {
  return cn(
    "inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted",
    className
  )
}

export function OnboardingCardBack({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-0.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      <ChevronLeft className="size-4" />
      Back
    </button>
  )
}

export function OnboardingActionsRow({
  children,
  showSkip = true,
  onSkip,
  className,
}: {
  children?: React.ReactNode
  showSkip?: boolean
  onSkip?: () => void
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center", className)}>
      {children}
      {showSkip && onSkip ? (
        <button
          type="button"
          onClick={onSkip}
          className="inline-flex h-12 shrink-0 items-center justify-center px-6 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:shrink-0"
        >
          Skip for now
        </button>
      ) : null}
    </div>
  )
}

export function OnboardingStepActions({
  children,
  showSkip = true,
  onSkip,
  className,
}: {
  children?: React.ReactNode
  showSkip?: boolean
  onSkip?: () => void
  className?: string
}) {
  const { skipCurrentStep } = useOnboarding()

  return (
    <OnboardingActionsRow
      showSkip={showSkip}
      onSkip={onSkip ?? skipCurrentStep}
      className={className}
    >
      {children}
    </OnboardingActionsRow>
  )
}
