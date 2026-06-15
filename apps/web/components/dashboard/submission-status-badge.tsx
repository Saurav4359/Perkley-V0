import type { SubmissionStatus } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

const styles: Record<SubmissionStatus, string> = {
  submitted: "bg-muted text-foreground/80",
  competing: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  under_review: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  qualified: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  won: "bg-yellow-500/10 text-yellow-800 dark:text-yellow-400",
  paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  not_qualified: "bg-muted text-muted-foreground",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
}

const labels: Record<SubmissionStatus, string> = {
  submitted: "Submitted",
  competing: "Competing",
  under_review: "Under review",
  qualified: "Qualified",
  won: "Won",
  paid: "Paid",
  not_qualified: "Not qualified",
  rejected: "Rejected",
}

export function SubmissionStatusBadge({
  status,
  className,
}: {
  status: SubmissionStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  )
}
