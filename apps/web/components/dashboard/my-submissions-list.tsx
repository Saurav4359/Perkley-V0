"use client"

import Link from "next/link"

import { SubmissionStatusBadge } from "@/components/dashboard/submission-status-badge"
import type { Submission } from "@/lib/dashboard/types"

function earningsForSubmission(submission: Submission) {
  if (submission.status === "paid" || submission.status === "won") {
    return submission.listingType === "campaign" ? "5,000" : "25,000"
  }
  if (submission.status === "qualified") return "Pending"
  return "—"
}

export function MySubmissionsList({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        No submissions yet. Browse listings to get started.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Listing</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Views</th>
            <th className="px-4 py-3 font-medium">Score</th>
            <th className="px-4 py-3 font-medium">Earnings</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission.id} className="border-b border-border last:border-b-0">
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/campaigns/${submission.listingId}`}
                  className="font-medium text-foreground hover:text-brand"
                >
                  {submission.listingTitle}
                </Link>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{submission.postUrl}</p>
              </td>
              <td className="px-4 py-3 capitalize">{submission.listingType}</td>
              <td className="px-4 py-3">
                <SubmissionStatusBadge status={submission.status} />
              </td>
              <td className="px-4 py-3 tabular-nums">{submission.views.toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 tabular-nums">{submission.engagementScore.toLocaleString("en-IN")}</td>
              <td className="px-4 py-3 font-medium tabular-nums">
                {earningsForSubmission(submission) === "—"
                  ? "—"
                  : earningsForSubmission(submission) === "Pending"
                    ? "Pending"
                    : `₹${earningsForSubmission(submission)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
