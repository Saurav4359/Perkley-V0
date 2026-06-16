"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { MySubmissionsList } from "@/components/dashboard/my-submissions-list"
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
  const [submissions, setSubmissions] = useState<Submission[]>(() =>
    mergeSubmissions(staticSubmissions, getStoredCreatorSubmissions())
  )

  const refresh = useCallback(() => {
    setSubmissions(
      mergeSubmissions(staticSubmissions, getStoredCreatorSubmissions())
    )
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

  return <MySubmissionsList submissions={submissions} />
}
