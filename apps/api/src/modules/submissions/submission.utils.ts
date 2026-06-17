import type { CampaignType, ContentType, SubmissionStatus } from "@prisma/client"

export type InstagramValidationResult = {
  ok: boolean
  normalizedUrl: string | null
  detectedContentType: ContentType | null
  errors: string[]
}

const INSTAGRAM_HOSTS = new Set(["instagram.com", "instagr.am"])

export function normalizeInstagramPostUrl(rawUrl: string) {
  const trimmed = rawUrl.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`)
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase()
    if (!INSTAGRAM_HOSTS.has(host)) return null
    if (!parsed.pathname || parsed.pathname === "/") return null

    parsed.hash = ""
    parsed.search = ""
    return parsed.toString().replace(/\/$/, "")
  } catch {
    return null
  }
}

export function detectInstagramContentType(pathname: string): ContentType | null {
  const path = pathname.toLowerCase()
  if (path.includes("/reel/") || path.includes("/reels/")) return "reel"
  if (path.includes("/p/")) return "post"
  if (path.includes("/stories/")) return "story"
  return null
}

export function validateInstagramPostUrl(
  rawUrl: string,
  expectedContentType?: ContentType
): InstagramValidationResult {
  const errors: string[] = []
  const normalizedUrl = normalizeInstagramPostUrl(rawUrl)

  if (!normalizedUrl) {
    return {
      ok: false,
      normalizedUrl: null,
      detectedContentType: null,
      errors: ["Enter a valid public Instagram post URL."],
    }
  }

  const pathname = new URL(normalizedUrl).pathname
  const detectedContentType = detectInstagramContentType(pathname)

  if (!detectedContentType) {
    errors.push("URL must point to an Instagram reel, post, or story.")
  }

  if (expectedContentType && detectedContentType && detectedContentType !== expectedContentType) {
    errors.push(`This campaign requires an Instagram ${expectedContentType} link.`)
  }

  return {
    ok: errors.length === 0,
    normalizedUrl,
    detectedContentType,
    errors,
  }
}

export function statusAfterValidation(campaignType: CampaignType): SubmissionStatus {
  return campaignType === "bounty" ? "competing" : "under_review"
}

export function canSubmitSubmission(input: {
  campaignStatus: string
  campaignDeadline: Date
  applicationStatus: string | null
  hasExistingSubmission: boolean
  now?: Date
}) {
  const now = input.now ?? new Date()
  const reasons: string[] = []

  if (input.campaignStatus !== "active") reasons.push("campaign_not_active")
  if (input.campaignDeadline.getTime() <= now.getTime()) reasons.push("campaign_deadline_passed")
  if (!input.applicationStatus || input.applicationStatus !== "accepted") {
    reasons.push("application_not_accepted")
  }
  if (input.hasExistingSubmission) reasons.push("submission_exists")

  return { ok: reasons.length === 0, reasons }
}

export function canEditSubmission(status: SubmissionStatus) {
  return status === "submitted" || status === "under_review" || status === "competing"
}

export function canValidateSubmission(status: SubmissionStatus) {
  return status === "submitted" || status === "under_review" || status === "competing"
}

export function canApproveSubmission(input: {
  campaignType: CampaignType
  status: SubmissionStatus
}) {
  if (input.campaignType === "bounty") {
    return { ok: false, reason: "bounty_auto_competing" as const }
  }

  if (input.status !== "under_review") {
    return { ok: false, reason: "invalid_submission_state" as const }
  }

  return { ok: true as const }
}

export function canRejectSubmission(status: SubmissionStatus) {
  return status === "under_review" || status === "competing" || status === "qualified"
}

export function calculateEngagementScore(metrics: {
  views: number
  likes: number
  comments: number
}) {
  return metrics.views + metrics.likes * 2 + metrics.comments * 3
}
