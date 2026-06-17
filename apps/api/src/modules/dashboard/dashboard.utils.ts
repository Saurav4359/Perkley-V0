import type { ApplicationStatus, SubmissionStatus } from "@prisma/client"

export type DashboardActivityKind =
  | "application"
  | "submission"
  | "campaign"
  | "review"

export type DashboardActivityItem = {
  id: string
  kind: DashboardActivityKind
  campaignId: string
  campaignTitle: string
  actorName: string
  action: string
  occurredAt: string
}

export function creatorApplicationAction(status: ApplicationStatus) {
  if (status === "accepted") return "application accepted"
  if (status === "rejected") return "application rejected"
  if (status === "withdrawn") return "application withdrawn"
  return "applied to campaign"
}

export function creatorSubmissionAction(status: SubmissionStatus, campaignType: string) {
  if (status === "won") return campaignType === "bounty" ? "won a bounty" : "won a campaign"
  if (status === "qualified") return "qualified for campaign payout"
  if (status === "competing") return "submitted to a bounty"
  if (status === "rejected") return "submission rejected"
  if (status === "under_review") return "submitted to a campaign"
  return "submitted content"
}

export function brandApplicationAction(creatorName: string, status: ApplicationStatus) {
  if (status === "pending") return `${creatorName} applied`
  if (status === "accepted") return `${creatorName} was accepted`
  if (status === "rejected") return `${creatorName} was rejected`
  return `${creatorName} updated an application`
}

export function brandSubmissionAction(creatorName: string, status: SubmissionStatus) {
  if (status === "under_review") return `${creatorName} submitted content`
  if (status === "competing") return `${creatorName} joined the bounty`
  if (status === "qualified") return `${creatorName} qualified`
  if (status === "won") return `${creatorName} won`
  if (status === "rejected") return `${creatorName}'s submission was rejected`
  return `${creatorName} updated a submission`
}

export function estimateCreatorEarnings(input: {
  status: SubmissionStatus
  campaignType: string
  fixedReward: number | null
  prizeFirst: number | null
}) {
  if (input.status === "paid" || input.status === "won") {
    if (input.campaignType === "campaign") return input.fixedReward ?? 0
    return input.prizeFirst ?? 0
  }
  if (input.status === "qualified") return input.fixedReward ?? 0
  return 0
}

export function mergeActivity(items: DashboardActivityItem[], limit: number) {
  return [...items]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, limit)
}

export function buildSearchResult(input: {
  id: string
  title: string
  brandName: string
  type: string
  niche: string
  brandId: string
  viewerBrandId?: string
}) {
  const isOwnListing = input.viewerBrandId ? input.brandId === input.viewerBrandId : false

  return {
    id: input.id,
    title: input.title,
    brand: input.brandName,
    type: input.type,
    niche: input.niche,
    isOwnListing,
    href: isOwnListing
      ? `/dashboard/brand/campaigns/${input.id}`
      : input.viewerBrandId
        ? `/dashboard/brand/listings/${input.id}`
        : `/dashboard/campaigns/${input.id}`,
  }
}
