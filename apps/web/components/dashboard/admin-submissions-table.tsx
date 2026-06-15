"use client"

import { useState } from "react"

import { SubmissionStatusBadge } from "@/components/dashboard/submission-status-badge"
import { buttonVariants } from "@/components/ui/button"
import type { Submission, SubmissionStatus } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

type AdminSubmissionsTableProps = {
  submissions: Submission[]
}

export function AdminSubmissionsTable({ submissions: initial }: AdminSubmissionsTableProps) {
  const [submissions, setSubmissions] = useState(initial)
  const [tab, setTab] = useState<"pending" | "all">("pending")

  const visible =
    tab === "pending"
      ? submissions.filter((s) => !["paid", "rejected", "not_qualified"].includes(s.status))
      : submissions

  function updateStatus(id: string, status: SubmissionStatus) {
    setSubmissions((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    )
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-full border border-border bg-card p-1">
        {(["pending", "all"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium capitalize sm:text-sm",
              tab === value ? "bg-foreground text-background" : "text-muted-foreground"
            )}
          >
            {value === "pending" ? "Pending submissions" : "All submissions"}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Creator</th>
              <th className="px-4 py-3 font-medium">Listing</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Views</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((submission) => (
              <tr key={submission.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{submission.creatorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {submission.creatorFollowers.toLocaleString("en-IN")} followers
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p>{submission.listingTitle}</p>
                  <a
                    href={submission.postUrl}
                    className="text-xs text-brand hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View post
                  </a>
                </td>
                <td className="px-4 py-3 capitalize">{submission.listingType}</td>
                <td className="px-4 py-3 tabular-nums">{submission.views.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 tabular-nums">
                  {submission.engagementScore.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <SubmissionStatusBadge status={submission.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "xs" }), "rounded-full")}
                      onClick={() =>
                        updateStatus(
                          submission.id,
                          submission.listingType === "bounty" ? "won" : "qualified"
                        )
                      }
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "xs" }), "rounded-full")}
                      onClick={() => updateStatus(submission.id, "rejected")}
                    >
                      Reject
                    </button>
                    {(submission.status === "won" || submission.status === "qualified") && (
                      <button
                        type="button"
                        className={cn(
                          buttonVariants({ size: "xs" }),
                          "rounded-full bg-brand text-white hover:bg-brand/90"
                        )}
                        onClick={() => updateStatus(submission.id, "paid")}
                      >
                        Release payout
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
