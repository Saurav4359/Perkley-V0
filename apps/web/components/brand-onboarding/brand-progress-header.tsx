"use client"

import { motion } from "framer-motion"

import { useBrandOnboarding } from "@/components/brand-onboarding/brand-onboarding-provider"
import { BRAND_ONBOARDING_STEP_COUNT } from "@/lib/brand-onboarding/constants"
import { getBrandOnboardingStepProgressPercent } from "@/lib/brand-onboarding/progress"
import type { BrandOnboardingStep } from "@/lib/brand-onboarding/types"
import { cn } from "@/lib/utils"

type BrandProgressHeaderProps = {
  step: BrandOnboardingStep
  completing?: boolean
}

export function BrandProgressHeader({ step, completing = false }: BrandProgressHeaderProps) {
  const progress = completing ? 100 : getBrandOnboardingStepProgressPercent(step)

  return (
    <div className="mb-5 space-y-2.5 sm:mb-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-brand">Verify your brand</p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {completing ? "All set" : `Step ${step} of ${BRAND_ONBOARDING_STEP_COUNT}`}
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
            : "You can finish later — brand verification is required before you launch campaigns or bounties."}
        </p>
      </div>
    </div>
  )
}

export function BrandOnboardingStepActions({
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
  const { skipCurrentStep } = useBrandOnboarding()

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center", className)}>
      {children}
      {showSkip ? (
        <button
          type="button"
          onClick={onSkip ?? skipCurrentStep}
          className="inline-flex h-12 shrink-0 items-center justify-center px-6 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:shrink-0"
        >
          Skip for now
        </button>
      ) : null}
    </div>
  )
}
