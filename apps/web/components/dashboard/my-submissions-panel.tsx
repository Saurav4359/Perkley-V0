"use client"

import { MySubmissionsList } from "@/components/dashboard/my-submissions-list"
import { useCreatorSubmissions } from "@/hooks/use-submissions"
import { creatorSubmissionToSubmission } from "@/lib/dashboard/submission-adapter"

export function MySubmissionsPanel() {
  const { data, isLoading, isError } = useCreatorSubmissions()

  if (isLoading) {
    return (
      <div className="rounded-[1.15rem] border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
        Loading submissions…
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-[1.15rem] border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
        Couldn&apos;t load submissions. Please try again.
      </div>
    )
  }

  const submissions = (data ?? []).map(creatorSubmissionToSubmission)

  return <MySubmissionsList submissions={submissions} />
}
