import { getOnboardingState } from "@/lib/onboarding/storage"
import type { ListingType, Submission, SubmissionStatus } from "@/lib/dashboard/types"

const STORAGE_KEY = "perkley-creator-submissions"

export type CreateSubmissionInput = {
  listingId: string
  listingTitle: string
  listingType: ListingType
  postUrl: string
  note?: string
}

type StoredSubmissionRecord = {
  id: string
  listingId: string
  listingTitle: string
  listingType: ListingType
  postUrl: string
  note?: string
  submittedAt: string
  status: SubmissionStatus
}

function loadRecords(): StoredSubmissionRecord[] {
  if (typeof window === "undefined") return []

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as StoredSubmissionRecord[]
  } catch {
    return []
  }
}

function saveRecords(records: StoredSubmissionRecord[]) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // ignore storage failures
  }
}

function getCreatorIdentity() {
  const state = getOnboardingState()
  const displayName = state.displayName?.trim() || "Saurav Sharma"
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

  return {
    creatorId: "local-creator",
    creatorName: displayName,
    creatorInitials: initials || "SC",
    creatorFollowers: state.instagram?.followers ?? 12400,
  }
}

export function toSubmission(record: StoredSubmissionRecord): Submission {
  const identity = getCreatorIdentity()

  return {
    id: record.id,
    listingId: record.listingId,
    listingTitle: record.listingTitle,
    listingType: record.listingType,
    creatorId: identity.creatorId,
    creatorName: identity.creatorName,
    creatorInitials: identity.creatorInitials,
    creatorFollowers: identity.creatorFollowers,
    postUrl: record.postUrl,
    views: 0,
    likes: 0,
    comments: 0,
    engagementScore: 0,
    status: record.status,
    submittedAt: record.submittedAt,
    lastSyncedAt: record.submittedAt,
  }
}

export function getStoredCreatorSubmissions(): Submission[] {
  return loadRecords()
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )
    .map(toSubmission)
}

export function hasStoredSubmissionForListing(listingId: string): boolean {
  return loadRecords().some((record) => record.listingId === listingId)
}

export function getStoredSubmissionForListing(listingId: string): Submission | null {
  const record = loadRecords().find((item) => item.listingId === listingId)
  return record ? toSubmission(record) : null
}

export function saveCreatorSubmission(input: CreateSubmissionInput): Submission {
  const records = loadRecords()
  const existingIndex = records.findIndex((item) => item.listingId === input.listingId)
  const submittedAt = new Date().toISOString()
  const status: SubmissionStatus =
    input.listingType === "bounty" ? "competing" : "under_review"

  const nextRecord: StoredSubmissionRecord = {
    id:
      existingIndex >= 0
        ? records[existingIndex].id
        : `local-${input.listingId}-${Date.now()}`,
    listingId: input.listingId,
    listingTitle: input.listingTitle,
    listingType: input.listingType,
    postUrl: input.postUrl.trim(),
    note: input.note?.trim() || undefined,
    submittedAt,
    status,
  }

  if (existingIndex >= 0) {
    records[existingIndex] = nextRecord
  } else {
    records.unshift(nextRecord)
  }

  saveRecords(records)
  notifySubmissionsUpdated()
  return toSubmission(nextRecord)
}

export function notifySubmissionsUpdated() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event("perkley-submissions-updated"))
}
