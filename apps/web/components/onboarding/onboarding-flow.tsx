"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

import { ContentTypeSelector } from "@/components/onboarding/content-type-selector"
import { InstagramConnectCard } from "@/components/onboarding/instagram-connect-card"
import {
  ONBOARDING_FINISH_DURATION_MS,
  OnboardingFinishLoader,
} from "@/components/onboarding/onboarding-finish-loader"
import { NicheSelector } from "@/components/onboarding/niche-selector"
import { useOnboarding } from "@/components/onboarding/onboarding-provider"
import { PaymentForm } from "@/components/onboarding/payment-form"
import {
  onboardingCardClassName,
  onboardingPrimaryButtonClassName,
  OnboardingCardBack,
  OnboardingStepActions,
  ProgressHeader,
} from "@/components/onboarding/progress-header"
import { VerificationCard } from "@/components/onboarding/verification-card"
import { ONBOARDING_STEP_COUNT } from "@/lib/onboarding/constants"
import { getPreviousOnboardingStep } from "@/lib/onboarding/state"
import type { OnboardingStep, PaymentDetails } from "@/lib/onboarding/types"
import {
  validateContentTypes,
  validateNiches,
} from "@/lib/onboarding/validation"

const stepMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
}

export function OnboardingFlow() {
  const {
    state,
    hydrated,
    connectInstagram,
    advanceFromVerification,
    saveContentProfile,
    updateNiches,
    updateContentTypes,
    goToStep,
    finishAndExit,
  } = useOnboarding()

  const searchParams = useSearchParams()
  const [contentError, setContentError] = useState<string | null>(null)
  const [isFinishing, setIsFinishing] = useState(false)
  const [pendingPayment, setPendingPayment] = useState<PaymentDetails | null>(null)

  useEffect(() => {
    if (!isFinishing || !pendingPayment) return

    const timer = window.setTimeout(() => {
      finishAndExit(pendingPayment)
    }, ONBOARDING_FINISH_DURATION_MS + 150)

    return () => window.clearTimeout(timer)
  }, [isFinishing, pendingPayment, finishAndExit])

  useEffect(() => {
    if (!hydrated) return

    const stepParam = searchParams.get("step")
    if (!stepParam) return

    const parsed = Number(stepParam)
    if (parsed >= 1 && parsed <= ONBOARDING_STEP_COUNT) {
      goToStep(parsed as OnboardingStep)
    }
  }, [hydrated, searchParams, goToStep])

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      </div>
    )
  }

  function handleContentContinue() {
    const nicheError = validateNiches(state.niches)
    const contentTypeError = validateContentTypes(state.contentTypes)
    const error = nicheError ?? contentTypeError
    if (error) {
      setContentError(error)
      return
    }
    setContentError(null)
    saveContentProfile(state.niches, state.contentTypes)
  }

  function handleBack() {
    const previous = getPreviousOnboardingStep(state.currentStep)
    if (previous) goToStep(previous)
  }

  function handlePaymentSubmit(payment: PaymentDetails) {
    setPendingPayment(payment)
    setIsFinishing(true)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <ProgressHeader step={state.currentStep} completing={isFinishing} />

      <AnimatePresence mode="wait">
        <motion.div key={isFinishing ? "finishing" : state.currentStep} {...stepMotion}>
          {isFinishing ? (
            <OnboardingFinishLoader />
          ) : null}

          {!isFinishing && state.currentStep === 1 ? (
            <InstagramConnectCard onConnected={connectInstagram} />
          ) : null}

          {!isFinishing && state.currentStep === 2 && state.instagram ? (
            <VerificationCard
              profile={state.instagram}
              onContinue={advanceFromVerification}
              onBack={handleBack}
            />
          ) : null}

          {!isFinishing && state.currentStep === 2 && !state.instagram ? (
            <div className={onboardingCardClassName()}>
              <OnboardingCardBack onClick={handleBack} className="mb-3" />
              <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Verify your profile
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Connect Instagram to review your profile details, or skip and finish this later.
              </p>
              <OnboardingStepActions className="mt-5" />
            </div>
          ) : null}

          {!isFinishing && state.currentStep === 3 ? (
            <div className={onboardingCardClassName()}>
              <OnboardingCardBack onClick={handleBack} className="mb-4" />
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Tell brands what you create
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Select the niches and formats that best describe your content.
              </p>

              <div className="mt-6 space-y-6">
                <section className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Niches</p>
                  <NicheSelector selected={state.niches} onChange={updateNiches} />
                </section>

                <section className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Content types</p>
                  <ContentTypeSelector
                    selected={state.contentTypes}
                    onChange={updateContentTypes}
                  />
                </section>
              </div>

              {contentError ? (
                <p className="mt-3 text-sm text-destructive">{contentError}</p>
              ) : null}

              <OnboardingStepActions className="mt-5">
                <button
                  type="button"
                  onClick={handleContentContinue}
                  className={onboardingPrimaryButtonClassName()}
                >
                  Continue
                </button>
              </OnboardingStepActions>
            </div>
          ) : null}

          {!isFinishing && state.currentStep === 4 ? (
            <PaymentForm
              initial={state.payment}
              onSubmit={handlePaymentSubmit}
              onBack={handleBack}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
