"use client"

import { useCallback, useEffect, useState } from "react"

import {
  getStoredSubmissionForListing,
  hasStoredSubmissionForListing,
  type CreateSubmissionInput,
  saveCreatorSubmission,
} from "@/lib/dashboard/submission-storage"
import type { Submission } from "@/lib/dashboard/types"

export function useListingSubmission(listingId: string) {
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const refresh = useCallback(() => {
    setHasSubmitted(hasStoredSubmissionForListing(listingId))
    setSubmission(getStoredSubmissionForListing(listingId))
  }, [listingId])

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

  function submit(input: CreateSubmissionInput) {
    const saved = saveCreatorSubmission(input)
    setSubmission(saved)
    setHasSubmitted(true)
    return saved
  }

  return { submission, hasSubmitted, submit, refresh }
}
