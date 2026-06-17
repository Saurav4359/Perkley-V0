"use client"

import { Check, ExternalLink, X } from "lucide-react"

import {
  useAcceptApplication,
  useCampaignApplications,
  useRejectApplication,
} from "@/hooks/use-applications"
import { useCampaignEscrow, useReleasePayments } from "@/hooks/use-payments"
import {
  useApproveSubmission,
  useCampaignSubmissions,
  useRejectSubmission,
} from "@/hooks/use-submissions"
import type { ApplicationStatus } from "@/lib/api/applications"
import { ApiError } from "@/lib/api/client"
import type { SubmissionStatus } from "@/lib/api/submissions"
import { formatInr } from "@/lib/dashboard/utils"
import { cn } from "@/lib/utils"

const statusTone: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600",
  accepted: "bg-emerald-500/10 text-emerald-600",
  qualified: "bg-emerald-500/10 text-emerald-600",
  won: "bg-emerald-500/10 text-emerald-600",
  paid: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-destructive/10 text-destructive",
  not_qualified: "bg-destructive/10 text-destructive",
  withdrawn: "bg-muted text-muted-foreground",
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        statusTone[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  )
}

const REVIEWABLE_SUBMISSION_STATUSES: SubmissionStatus[] = [
  "submitted",
  "competing",
  "under_review",
  "qualified",
]

const PENDING_APPLICATION_STATUS: ApplicationStatus = "pending"

export function BrandCampaignReview({ campaignId }: { campaignId: string }) {
  const applicationsQuery = useCampaignApplications(campaignId)
  const submissionsQuery = useCampaignSubmissions(campaignId)

  const acceptApplication = useAcceptApplication(campaignId)
  const rejectApplication = useRejectApplication(campaignId)
  const approveSubmission = useApproveSubmission(campaignId)
  const rejectSubmission = useRejectSubmission(campaignId)

  const escrowQuery = useCampaignEscrow(campaignId)
  const releasePayments = useReleasePayments(campaignId)

  const applications = applicationsQuery.data ?? []
  const submissions = submissionsQuery.data ?? []
  const escrow = escrowQuery.data

  function handleRelease() {
    if (releasePayments.isPending) return
    if (!window.confirm("Release payouts to all eligible winners? This cannot be undone.")) {
      return
    }
    releasePayments.mutate(undefined)
  }

  return (
    <div className="space-y-8 border-t border-border bg-muted/10 px-4 py-8 sm:px-6 lg:px-10">
      {escrow ? (
        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Payments</h2>
            <StatusBadge status={escrow.status} />
          </div>
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Escrow</dt>
              <dd className="font-semibold tabular-nums">₹{formatInr(escrow.amountInr)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Released</dt>
              <dd className="font-semibold tabular-nums">
                ₹{formatInr(escrow.releasedAmountInr)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Remaining</dt>
              <dd className="font-semibold tabular-nums">
                ₹{formatInr(escrow.remainingAmountInr)}
              </dd>
            </div>
          </dl>
          {(escrow.status === "funded" || escrow.status === "partially_released") &&
          escrow.remainingAmountInr > 0 ? (
            <button
              type="button"
              disabled={releasePayments.isPending}
              onClick={handleRelease}
              className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand/90 disabled:opacity-50"
            >
              {releasePayments.isPending ? "Releasing…" : "Release payouts"}
            </button>
          ) : null}
          {releasePayments.isError ? (
            <p className="text-sm text-destructive" role="alert">
              {releasePayments.error instanceof ApiError
                ? releasePayments.error.message
                : "Couldn't release payouts."}
            </p>
          ) : null}
          {releasePayments.isSuccess ? (
            <p className="text-sm text-emerald-600">
              Released ₹{formatInr(releasePayments.data.releasedAmountInr)} to{" "}
              {releasePayments.data.payouts.length} creator
              {releasePayments.data.payouts.length === 1 ? "" : "s"}.
            </p>
          ) : null}
        </section>
      ) : null}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Applications{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({applications.length})
            </span>
          </h2>
        </div>

        {applicationsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading applications…</p>
        ) : applications.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card/40 px-4 py-6 text-center text-sm text-muted-foreground">
            No applications yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {applications.map((application) => {
              const isPending = application.status === PENDING_APPLICATION_STATUS
              const busy =
                acceptApplication.isPending || rejectApplication.isPending
              return (
                <li
                  key={application.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {application.creator.displayName}
                      </p>
                      <StatusBadge status={application.status} />
                    </div>
                    {application.creator.instagramHandle ? (
                      <p className="truncate text-xs text-muted-foreground">
                        @{application.creator.instagramHandle}
                        {application.creator.followersCount
                          ? ` · ${application.creator.followersCount.toLocaleString("en-IN")} followers`
                          : ""}
                      </p>
                    ) : null}
                    {application.message ? (
                      <p className="mt-1 line-clamp-2 text-sm text-foreground/80">
                        {application.message}
                      </p>
                    ) : null}
                  </div>

                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => acceptApplication.mutate(application.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand/90 disabled:opacity-50"
                      >
                        <Check className="size-3.5" />
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => rejectApplication.mutate(application.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                      >
                        <X className="size-3.5" />
                        Reject
                      </button>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Submissions{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({submissions.length})
          </span>
        </h2>

        {submissionsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading submissions…</p>
        ) : submissions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card/40 px-4 py-6 text-center text-sm text-muted-foreground">
            No submissions yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {submissions.map((submission) => {
              const canReview = REVIEWABLE_SUBMISSION_STATUSES.includes(
                submission.status
              )
              const busy =
                approveSubmission.isPending || rejectSubmission.isPending
              return (
                <li
                  key={submission.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {submission.creator.displayName}
                      </p>
                      <StatusBadge status={submission.status} />
                    </div>
                    <a
                      href={submission.postUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                    >
                      View post
                      <ExternalLink className="size-3" />
                    </a>
                    <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                      {submission.views.toLocaleString("en-IN")} views ·{" "}
                      {submission.likes.toLocaleString("en-IN")} likes ·{" "}
                      score {submission.engagementScore}
                    </p>
                  </div>

                  {canReview ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => approveSubmission.mutate(submission.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand/90 disabled:opacity-50"
                      >
                        <Check className="size-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          const reason = window.prompt(
                            "Reason for rejecting this submission?"
                          )
                          if (reason && reason.trim().length >= 3) {
                            rejectSubmission.mutate({
                              submissionId: submission.id,
                              reason: reason.trim(),
                            })
                          }
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                      >
                        <X className="size-3.5" />
                        Reject
                      </button>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
