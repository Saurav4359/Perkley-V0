import type { Listing } from "@/lib/dashboard/types"

export const SUBMISSION_STEP_COUNT = 3

export type SubmissionChecklistId =
  | "public"
  | "hashtag"
  | "mention"
  | "contentType"
  | "brandVisible"
  | "guidelines"

export type SubmissionChecklistItem = {
  id: SubmissionChecklistId
  label: string
  description: string
}

export function buildSubmissionChecklist(listing: Listing): SubmissionChecklistItem[] {
  const contentLabel =
    listing.contentType === "reel"
      ? "Reel"
      : listing.contentType === "story"
        ? "Story"
        : "Post"

  return [
    {
      id: "public",
      label: "Post is public",
      description: "Your Instagram content must be visible to everyone, not private or close friends.",
    },
    {
      id: "hashtag",
      label: `Includes ${listing.requiredHashtag}`,
      description: "Add the required hashtag in your caption or on-screen text.",
    },
    {
      id: "mention",
      label: `Mentions ${listing.requiredMention}`,
      description: "Tag the brand handle in your caption or Reel overlay.",
    },
    {
      id: "contentType",
      label: `${contentLabel} on Instagram`,
      description: `This listing accepts ${contentLabel.toLowerCase()}s only — not other formats.`,
    },
    {
      id: "brandVisible",
      label: `${listing.brandName} is clearly shown`,
      description:
        listing.type === "campaign"
          ? "The product, app, or brand moment should be easy to spot in the content."
          : "The brand or product should be featured naturally in your content.",
    },
    {
      id: "guidelines",
      label: "Follows listing guidelines",
      description: "No misleading claims, reposts, or content that breaks the brief.",
    },
  ]
}

export function validateInstagramPostUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return "Paste your public Instagram post link."

  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`)
    const host = parsed.hostname.replace(/^www\./, "")
    if (!["instagram.com", "instagr.am"].includes(host)) {
      return "Use a link from instagram.com (Reel, post, or story highlight)."
    }
    if (!parsed.pathname || parsed.pathname === "/") {
      return "That link looks incomplete — copy the full post URL from Instagram."
    }
    return null
  } catch {
    return "Enter a valid Instagram URL."
  }
}

export function getSubmissionStepTitle(step: number): string {
  if (step === 1) return "Share your post"
  if (step === 2) return "Confirm requirements"
  return "Review and submit"
}

export function getSubmissionStepDescription(step: number, listing: Listing): string {
  if (step === 1) {
    return `Paste the public Instagram link for your ${listing.contentType}. We'll sync views every 6 hours.`
  }
  if (step === 2) {
    return "Tick each item only if your post already meets the requirement."
  }
  return "Double-check everything before we send your entry for review."
}
