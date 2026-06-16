"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronLeft,
  ExternalLink,
  Link2,
  Sparkles,
  XIcon,
  Zap,
} from "lucide-react"

import { CompleteProfileReminder } from "@/components/dashboard/complete-profile-reminder"
import { DetailSectionLabel } from "@/components/dashboard/campaign-detail/detail-primitives"
import { FormField, inputClassName, textareaClassName } from "@/components/dashboard/forms/form-field"
import {
  onboardingCardClassName,
  onboardingPrimaryButtonClassName,
  onboardingSecondaryButtonClassName,
} from "@/components/onboarding/progress-header"
import { useListingSubmission } from "@/hooks/use-listing-submission"
import { useOnboardingProgress } from "@/hooks/use-onboarding-progress"
import {
  buildSubmissionChecklist,
  getSubmissionStepDescription,
  getSubmissionStepTitle,
  SUBMISSION_STEP_COUNT,
  validateInstagramPostUrl,
  type SubmissionChecklistId,
} from "@/lib/dashboard/submission-flow"
import type { Listing } from "@/lib/dashboard/types"
import { formatInr } from "@/lib/dashboard/utils"
import { cn } from "@/lib/utils"

type SubmitListingDialogProps = {
  listing: Listing
  open: boolean
  onOpenChange: (open: boolean) => void
}

const stepMotion = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
}

const dialogMotion = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 16, scale: 0.98 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
}

function SubmissionProgressHeader({
  step,
  listing,
}: {
  step: number
  listing: Listing
}) {
  const progress = Math.round((step / SUBMISSION_STEP_COUNT) * 100)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {Array.from({ length: SUBMISSION_STEP_COUNT }, (_, index) => {
          const stepNumber = index + 1
          const active = stepNumber === step
          const complete = stepNumber < step

          return (
            <div key={stepNumber} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  complete && "bg-brand text-white",
                  active && "bg-brand/15 text-brand ring-2 ring-brand/25",
                  !complete && !active && "bg-muted text-muted-foreground"
                )}
              >
                {complete ? <Check className="size-3.5" /> : stepNumber}
              </span>
              {stepNumber < SUBMISSION_STEP_COUNT ? (
                <span
                  className={cn(
                    "h-0.5 flex-1 rounded-full",
                    stepNumber < step ? "bg-brand" : "bg-muted"
                  )}
                />
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <DetailSectionLabel>Submit entry</DetailSectionLabel>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            {getSubmissionStepTitle(step)}
          </h3>
        </div>
        <span className="text-sm tabular-nums text-muted-foreground">
          {progress}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand to-[#FF8547]"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {getSubmissionStepDescription(step, listing)}
      </p>
    </div>
  )
}

function SubmissionSuccess({
  listing,
  postUrl,
  onClose,
}: {
  listing: Listing
  postUrl: string
  onClose: () => void
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
          <BadgeCheck className="size-5" />
        </span>
        <div>
          <p className="font-semibold text-foreground">Submission received</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {listing.type === "bounty"
              ? "You're on the leaderboard. Rankings refresh every 6 hours."
              : "We'll sync your views every 6 hours. You qualify once you hit the view threshold."}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Submitted link
        </p>
        <a
          href={postUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 break-all text-sm font-medium text-brand hover:underline"
        >
          {postUrl}
          <ExternalLink className="size-3.5 shrink-0" />
        </a>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/dashboard/work"
          onClick={onClose}
          className={cn(onboardingPrimaryButtonClassName(), "flex-1")}
        >
          View my submissions
          <ArrowUpRight className="size-4" />
        </Link>
        <button type="button" onClick={onClose} className={onboardingSecondaryButtonClassName("flex-1")}>
          Close
        </button>
      </div>
    </div>
  )
}

export function SubmitListingDialog({
  listing,
  open,
  onOpenChange,
}: SubmitListingDialogProps) {
  const { canParticipate } = useOnboardingProgress()
  const { hasSubmitted, submission, submit } = useListingSubmission(listing.id)
  const checklist = useMemo(() => buildSubmissionChecklist(listing), [listing])
  const [mounted, setMounted] = useState(false)

  const [step, setStep] = useState(1)
  const [postUrl, setPostUrl] = useState("")
  const [note, setNote] = useState("")
  const [checks, setChecks] = useState<Record<SubmissionChecklistId, boolean>>(() =>
    Object.fromEntries(checklist.map((item) => [item.id, false])) as Record<
      SubmissionChecklistId,
      boolean
    >
  )
  const [confirmed, setConfirmed] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    setStep(1)
    setPostUrl("")
    setNote("")
    setChecks(
      Object.fromEntries(checklist.map((item) => [item.id, false])) as Record<
        SubmissionChecklistId,
        boolean
      >
    )
    setConfirmed(false)
    setUrlError(null)
    if (hasSubmitted && submission) {
      setPostUrl(submission.postUrl)
      setIsSuccess(true)
      return
    }

    setIsSuccess(false)
  }, [open, checklist, hasSubmitted, submission])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onOpenChange])

  if (!mounted || !open) return null

  const allChecked = checklist.every((item) => checks[item.id])
  const rewardLabel =
    listing.type === "bounty"
      ? `₹${formatInr(listing.totalBudget)} prize pool`
      : `₹${formatInr(listing.fixedReward)} per creator`

  function close() {
    onOpenChange(false)
  }

  function handleContinueFromUrl() {
    const error = validateInstagramPostUrl(postUrl)
    if (error) {
      setUrlError(error)
      return
    }
    setUrlError(null)
    setStep(2)
  }

  function handleFinalSubmit() {
    if (!confirmed) return
    submit({
      listingId: listing.id,
      listingTitle: listing.title,
      listingType: listing.type,
      postUrl,
      note,
    })
    setIsSuccess(true)
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close submission dialog"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            onClick={close}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-listing-title"
            className={cn(
              "relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden",
              "rounded-t-[1.75rem] border border-border/80 bg-background",
              "shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:rounded-[1.75rem]"
            )}
            {...dialogMotion}
          >
            <div className="border-b border-border/70 bg-muted/20 px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className="flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: listing.brandAccent }}
                  >
                    {listing.brandInitials}
                  </div>
                  <div className="min-w-0">
                    <DetailSectionLabel>{listing.brandName}</DetailSectionLabel>
                    <p
                      id="submit-listing-title"
                      className="mt-1 truncate text-base font-semibold text-foreground"
                    >
                      {listing.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 capitalize">
                        <Zap className="size-3 text-brand" />
                        {listing.type}
                      </span>
                      <span>·</span>
                      <span>{rewardLabel}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              {!canParticipate ? (
                <CompleteProfileReminder title="Finish your profile before submitting" />
              ) : isSuccess ? (
                <SubmissionSuccess listing={listing} postUrl={postUrl} onClose={close} />
              ) : (
                <div className="space-y-5">
                  <SubmissionProgressHeader step={step} listing={listing} />

                  <AnimatePresence mode="wait">
                    {step === 1 ? (
                      <motion.div key="step-1" {...stepMotion} className="space-y-5">
                        <div className={onboardingCardClassName("space-y-4")}>
                          <div className="flex items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand">
                              <Link2 className="size-4" />
                            </span>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Instagram {listing.contentType} URL
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Open your post on Instagram, tap share, and copy the link.
                              </p>
                            </div>
                          </div>

                          <FormField label="Post link" hint="Public link only">
                            <input
                              className={inputClassName}
                              type="url"
                              value={postUrl}
                              onChange={(event) => {
                                setPostUrl(event.target.value)
                                if (urlError) setUrlError(null)
                              }}
                              placeholder="https://instagram.com/reel/..."
                              autoFocus
                            />
                          </FormField>
                          {urlError ? (
                            <p className="text-sm text-destructive">{urlError}</p>
                          ) : null}

                          <FormField label="Optional note to the brand" hint="Not required">
                            <textarea
                              className={textareaClassName}
                              value={note}
                              onChange={(event) => setNote(event.target.value)}
                              placeholder="Anything you'd like the reviewer to know about your entry..."
                            />
                          </FormField>
                        </div>

                        <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                          Required in your post:{" "}
                          <span className="font-medium text-foreground">
                            {listing.requiredHashtag}
                          </span>{" "}
                          and{" "}
                          <span className="font-medium text-foreground">
                            {listing.requiredMention}
                          </span>
                        </div>
                      </motion.div>
                    ) : null}

                    {step === 2 ? (
                      <motion.div key="step-2" {...stepMotion} className="space-y-3">
                        {checklist.map((item) => {
                          const checked = checks[item.id]
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                setChecks((current) => ({
                                  ...current,
                                  [item.id]: !current[item.id],
                                }))
                              }
                              className={cn(
                                "flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
                                checked
                                  ? "border-brand/30 bg-brand/[0.04]"
                                  : "border-border/70 bg-card hover:bg-muted/30"
                              )}
                            >
                              <span
                                className={cn(
                                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border",
                                  checked
                                    ? "border-brand bg-brand text-white"
                                    : "border-border bg-background"
                                )}
                              >
                                {checked ? <Check className="size-3" /> : null}
                              </span>
                              <span>
                                <span className="block text-sm font-medium text-foreground">
                                  {item.label}
                                </span>
                                <span className="mt-0.5 block text-sm text-muted-foreground">
                                  {item.description}
                                </span>
                              </span>
                            </button>
                          )
                        })}
                      </motion.div>
                    ) : null}

                    {step === 3 ? (
                      <motion.div key="step-3" {...stepMotion} className="space-y-4">
                        <div className={onboardingCardClassName("space-y-4")}>
                          <div className="flex items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand">
                              <Sparkles className="size-4" />
                            </span>
                            <div>
                              <p className="text-sm font-medium text-foreground">Ready to send</p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {listing.type === "bounty"
                                  ? "Your entry joins the leaderboard immediately after submission."
                                  : "We'll track views and mark you qualified once you cross the threshold."}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm">
                            <div>
                              <DetailSectionLabel>Post link</DetailSectionLabel>
                              <p className="mt-1 break-all font-medium text-foreground">
                                {postUrl.trim()}
                              </p>
                            </div>
                            {note.trim() ? (
                              <div>
                                <DetailSectionLabel>Note</DetailSectionLabel>
                                <p className="mt-1 text-foreground">{note.trim()}</p>
                              </div>
                            ) : null}
                            <div>
                              <DetailSectionLabel>Listing</DetailSectionLabel>
                              <p className="mt-1 text-foreground">{listing.title}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setConfirmed((current) => !current)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
                              confirmed
                                ? "border-brand/30 bg-brand/[0.04]"
                                : "border-border/70 bg-card hover:bg-muted/30"
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border",
                                confirmed
                                  ? "border-brand bg-brand text-white"
                                  : "border-border bg-background"
                              )}
                            >
                              {confirmed ? <Check className="size-3" /> : null}
                            </span>
                            <span className="text-sm text-foreground">
                              I confirm this post meets all listing requirements and is my original
                              work.
                            </span>
                          </button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {canParticipate && !isSuccess ? (
              <div className="flex items-center gap-2 border-t border-border/70 bg-background px-5 py-4 sm:px-6">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((current) => current - 1)}
                    className={cn(onboardingSecondaryButtonClassName(), "px-4")}
                  >
                    <ChevronLeft className="size-4" />
                    Back
                  </button>
                ) : (
                  <button type="button" onClick={close} className={onboardingSecondaryButtonClassName()}>
                    Cancel
                  </button>
                )}

                {step === 1 ? (
                  <button
                    type="button"
                    onClick={handleContinueFromUrl}
                    className={cn(onboardingPrimaryButtonClassName(), "ml-auto flex-1 sm:flex-none")}
                  >
                    Continue
                    <ArrowUpRight className="size-4" />
                  </button>
                ) : null}

                {step === 2 ? (
                  <button
                    type="button"
                    disabled={!allChecked}
                    onClick={() => setStep(3)}
                    className={cn(onboardingPrimaryButtonClassName(), "ml-auto flex-1 sm:flex-none")}
                  >
                    Review submission
                    <ArrowUpRight className="size-4" />
                  </button>
                ) : null}

                {step === 3 ? (
                  <button
                    type="button"
                    disabled={!confirmed}
                    onClick={handleFinalSubmit}
                    className={cn(onboardingPrimaryButtonClassName(), "ml-auto flex-1 sm:flex-none")}
                  >
                    Submit entry
                    <ArrowUpRight className="size-4" />
                  </button>
                ) : null}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  )
}
