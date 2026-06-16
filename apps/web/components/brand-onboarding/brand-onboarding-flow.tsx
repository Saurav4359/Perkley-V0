"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { BadgeCheck, Mail, ShieldCheck } from "lucide-react"

import { useBrandOnboarding } from "@/components/brand-onboarding/brand-onboarding-provider"
import {
  BrandOnboardingStepActions,
  BrandProgressHeader,
} from "@/components/brand-onboarding/brand-progress-header"
import { inputClassName, SelectInput, textareaClassName } from "@/components/dashboard/forms/form-field"
import {
  ONBOARDING_FINISH_DURATION_MS,
  OnboardingFinishLoader,
} from "@/components/onboarding/onboarding-finish-loader"
import { PaymentForm } from "@/components/onboarding/payment-form"
import {
  onboardingCardClassName,
  onboardingPrimaryButtonClassName,
  OnboardingCardBack,
} from "@/components/onboarding/progress-header"
import { BRAND_ONBOARDING_STEP_COUNT } from "@/lib/brand-onboarding/constants"
import { getPreviousBrandOnboardingStep } from "@/lib/brand-onboarding/state"
import type { BrandOnboardingStep } from "@/lib/brand-onboarding/types"
import {
  validateBrandIdentity,
  validateBrandSocial,
  validateBrandVerification,
  validateBrandWebsite,
  validateWorkEmail,
} from "@/lib/brand-onboarding/validation"
import { NICHES } from "@/lib/dashboard/types"
import type { Niche } from "@/lib/dashboard/types"
import type { PaymentDetails } from "@/lib/onboarding/types"
import { cn } from "@/lib/utils"

const stepMotion = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
}

const INDUSTRY_OPTIONS = NICHES.filter((item) => item.id !== "all").map((item) => ({
  value: item.id,
  label: item.label,
}))

export function BrandOnboardingFlow() {
  const {
    state,
    hydrated,
    updateIdentity,
    saveIdentity,
    updateVerification,
    verifyWorkEmail,
    saveVerification,
    updatePresence,
    savePresence,
    goToStep,
    finishAndExit,
    skipCurrentStep,
  } = useBrandOnboarding()

  const searchParams = useSearchParams()
  const [identityError, setIdentityError] = useState<string | null>(null)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [presenceError, setPresenceError] = useState<string | null>(null)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
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
    if (parsed >= 1 && parsed <= BRAND_ONBOARDING_STEP_COUNT) {
      goToStep(parsed as BrandOnboardingStep)
    }
  }, [hydrated, searchParams, goToStep])

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      </div>
    )
  }

  function handleBack() {
    const previous = getPreviousBrandOnboardingStep(state.currentStep)
    if (previous) goToStep(previous)
  }

  function handleIdentityContinue() {
    const error = validateBrandIdentity(
      state.name,
      state.bio,
      state.industry,
      state.location
    )
    if (error) {
      setIdentityError(error)
      return
    }
    setIdentityError(null)
    saveIdentity({
      name: state.name.trim(),
      bio: state.bio.trim(),
      industry: state.industry,
      location: state.location.trim(),
    })
  }

  async function handleVerifyEmail() {
    const emailError = validateWorkEmail(state.workEmail)
    if (emailError) {
      setVerificationError(emailError)
      return
    }

    setVerificationError(null)
    setIsVerifyingEmail(true)
    await new Promise((resolve) => window.setTimeout(resolve, 900))
    verifyWorkEmail()
    setIsVerifyingEmail(false)
  }

  function handleVerificationContinue() {
    const error = validateBrandVerification(
      state.workEmail,
      state.website,
      state.workEmailVerified
    )
    if (error) {
      setVerificationError(error)
      return
    }
    setVerificationError(null)
    saveVerification(state.workEmail.trim(), state.website.trim(), state.workEmailVerified)
  }

  function handlePresenceContinue() {
    const error = validateBrandSocial(state.social)
    if (error) {
      setPresenceError(error)
      return
    }
    setPresenceError(null)
    savePresence(state.social, state.logoUrl)
  }

  function handlePaymentSubmit(payment: PaymentDetails) {
    setPendingPayment(payment)
    setIsFinishing(true)
  }

  return (
    <div className="perkley-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto">
      <BrandProgressHeader step={state.currentStep} completing={isFinishing} />

      <AnimatePresence mode="wait">
        <motion.div key={isFinishing ? "finishing" : state.currentStep} {...stepMotion}>
          {isFinishing ? <OnboardingFinishLoader /> : null}

          {!isFinishing && state.currentStep === 1 ? (
            <div className={onboardingCardClassName()}>
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Tell us about your brand
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                This helps creators understand who they&apos;re working with.
              </p>

              <div className="mt-6 space-y-4">
                <Field label="Brand / company name">
                  <input
                    type="text"
                    value={state.name}
                    onChange={(event) =>
                      updateIdentity({
                        name: event.target.value,
                        bio: state.bio,
                        industry: state.industry,
                        location: state.location,
                      })
                    }
                    placeholder="Acme Inc."
                    className={inputClassName}
                  />
                </Field>

                <Field label="Industry">
                  <SelectInput
                    value={state.industry}
                    onChange={(value) =>
                      updateIdentity({
                        name: state.name,
                        bio: state.bio,
                        industry: value as Niche,
                        location: state.location,
                      })
                    }
                    options={INDUSTRY_OPTIONS}
                  />
                </Field>

                <Field label="Primary location">
                  <input
                    type="text"
                    value={state.location}
                    onChange={(event) =>
                      updateIdentity({
                        name: state.name,
                        bio: state.bio,
                        industry: state.industry,
                        location: event.target.value,
                      })
                    }
                    placeholder="Mumbai, India"
                    className={inputClassName}
                  />
                </Field>

                <Field label="Brand bio">
                  <textarea
                    value={state.bio}
                    onChange={(event) =>
                      updateIdentity({
                        name: state.name,
                        bio: event.target.value,
                        industry: state.industry,
                        location: state.location,
                      })
                    }
                    rows={4}
                    placeholder="What does your brand do, and what kind of creator content are you looking for?"
                    className={textareaClassName}
                  />
                </Field>
              </div>

              {identityError ? (
                <p className="mt-3 text-sm text-destructive">{identityError}</p>
              ) : null}

              <BrandOnboardingStepActions className="mt-5">
                <button
                  type="button"
                  onClick={handleIdentityContinue}
                  className={onboardingPrimaryButtonClassName()}
                >
                  Continue
                </button>
              </BrandOnboardingStepActions>
            </div>
          ) : null}

          {!isFinishing && state.currentStep === 2 ? (
            <div className={onboardingCardClassName()}>
              <OnboardingCardBack onClick={handleBack} className="mb-4" />
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Verify your business
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Confirm your work email and website so creators trust your campaigns.
              </p>

              <div className="mt-6 space-y-4">
                <Field label="Work email">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="email"
                      value={state.workEmail}
                      onChange={(event) => {
                        updateVerification(event.target.value, state.website)
                        setVerificationError(null)
                      }}
                      placeholder="hello@acme.com"
                      className={cn(inputClassName, "flex-1")}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyEmail}
                      disabled={isVerifyingEmail || state.workEmailVerified}
                      className={cn(
                        onboardingPrimaryButtonClassName(),
                        "h-11 px-5 sm:h-12 sm:shrink-0"
                      )}
                    >
                      {state.workEmailVerified
                        ? "Verified"
                        : isVerifyingEmail
                          ? "Verifying…"
                          : "Verify email"}
                    </button>
                  </div>
                </Field>

                {state.workEmailVerified ? (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-3 py-2.5 text-sm text-emerald-800 dark:text-emerald-300">
                    <BadgeCheck className="size-4 shrink-0" />
                    Work email verified — we&apos;ll use this for campaign notifications.
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
                    <Mail className="mt-0.5 size-4 shrink-0" />
                    Use your company domain email. We&apos;ll send a one-time verification link.
                  </div>
                )}

                <Field label="Company website">
                  <input
                    type="url"
                    value={state.website}
                    onChange={(event) => {
                      updateVerification(state.workEmail, event.target.value)
                      setVerificationError(null)
                    }}
                    placeholder="https://acme.com"
                    className={inputClassName}
                  />
                </Field>

                {state.website.trim() && validateBrandWebsite(state.website) === null ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="size-4 text-brand" />
                    Website looks good — creators will see this on your profile.
                  </div>
                ) : null}
              </div>

              {verificationError ? (
                <p className="mt-3 text-sm text-destructive">{verificationError}</p>
              ) : null}

              <BrandOnboardingStepActions className="mt-5">
                <button
                  type="button"
                  onClick={handleVerificationContinue}
                  className={onboardingPrimaryButtonClassName()}
                >
                  Continue
                </button>
              </BrandOnboardingStepActions>
            </div>
          ) : null}

          {!isFinishing && state.currentStep === 3 ? (
            <div className={onboardingCardClassName()}>
              <OnboardingCardBack onClick={handleBack} className="mb-4" />
              <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Add your brand presence
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Share at least one social profile so creators can research your brand.
              </p>

              <div className="mt-6 space-y-4">
                <Field label="Instagram handle">
                  <input
                    type="text"
                    value={state.social.instagram ?? ""}
                    onChange={(event) =>
                      updatePresence(
                        { ...state.social, instagram: event.target.value },
                        state.logoUrl
                      )
                    }
                    placeholder="@yourbrand"
                    className={inputClassName}
                  />
                </Field>

                <Field label="LinkedIn page">
                  <input
                    type="text"
                    value={state.social.linkedin ?? ""}
                    onChange={(event) =>
                      updatePresence(
                        { ...state.social, linkedin: event.target.value },
                        state.logoUrl
                      )
                    }
                    placeholder="linkedin.com/company/yourbrand"
                    className={inputClassName}
                  />
                </Field>

                <Field label="X (Twitter) handle">
                  <input
                    type="text"
                    value={state.social.twitter ?? ""}
                    onChange={(event) =>
                      updatePresence(
                        { ...state.social, twitter: event.target.value },
                        state.logoUrl
                      )
                    }
                    placeholder="@yourbrand"
                    className={inputClassName}
                  />
                </Field>
              </div>

              {presenceError ? (
                <p className="mt-3 text-sm text-destructive">{presenceError}</p>
              ) : null}

              <BrandOnboardingStepActions className="mt-5">
                <button
                  type="button"
                  onClick={handlePresenceContinue}
                  className={onboardingPrimaryButtonClassName()}
                >
                  Continue
                </button>
              </BrandOnboardingStepActions>
            </div>
          ) : null}

          {!isFinishing && state.currentStep === 4 ? (
            <PaymentForm
              initial={state.payment}
              onSubmit={handlePaymentSubmit}
              onBack={handleBack}
              onSkip={skipCurrentStep}
              submitLabel="Finish setup"
              title="Add billing details"
              description="We use this to fund bounties and campaigns when creators complete your briefs."
            />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  )
}
