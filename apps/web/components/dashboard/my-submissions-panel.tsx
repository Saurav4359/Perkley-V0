"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { MySubmissionsList } from "@/components/dashboard/my-submissions-list"
import { useCreatorSubmissions } from "@/hooks/use-submissions"
import { creatorSubmissionToSubmission } from "@/lib/dashboard/submission-adapter"
import { getCreatorSubmissions } from "@/lib/dashboard/listings-data"
import { getStoredCreatorSubmissions } from "@/lib/dashboard/submission-storage"
import type { Submission } from "@/lib/dashboard/types"

function mergeSubmissions(staticSubmissions: Submission[], storedSubmissions: Submission[]) {
  const storedListingIds = new Set(storedSubmissions.map((item) => item.listingId))
  const filteredStatic = staticSubmissions.filter(
    (item) => !storedListingIds.has(item.listingId)
  )

  return [...storedSubmissions, ...filteredStatic].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  )
}

export function MySubmissionsPanel() {
  const staticSubmissions = useMemo(() => getCreatorSubmissions(), [])
  const [fallback, setFallback] = useState<Submission[]>(() =>
    mergeSubmissions(staticSubmissions, getStoredCreatorSubmissions())
  )

  const { data: live, isSuccess } = useCreatorSubmissions()

  const refresh = useCallback(() => {
    setFallback(mergeSubmissions(staticSubmissions, getStoredCreatorSubmissions()))
  }, [staticSubmissions])

  useEffect(() => {
    refresh()

    function handleStorage(event: StorageEvent) {
      if (event.key === "perkley-creator-submissions" || event.key === null) {
        refresh()
      }
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener("perkley-submissions-updated", refresh)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("perkley-submissions-updated", refresh)
    }
  }, [refresh])

  // Prefer live backend submissions once loaded; fall back to local/sample
  // data while the request is in flight.
  const submissions =
    isSuccess && live ? live.map(creatorSubmissionToSubmission) : fallback

  return <MySubmissionsList submissions={submissions} />
}
