import type { CampaignStatus, CampaignType } from "@prisma/client"

type WorkflowInput = {
  type: CampaignType
  title?: string | null
  description?: string | null
  niche?: string | null
  platform?: string | null
  contentType?: string | null
  minFollowers?: number | null
  requiredHashtag?: string | null
  requiredMention?: string | null
  deadline?: Date | string | null
  totalBudget?: number | null
  maxCreators?: number | null
  minViewsThreshold?: number | null
  fixedReward?: number | null
  prizeFirst?: number | null
  prizeSecond?: number | null
  prizeThird?: number | null
  prizeTop20Each?: number | null
}

function hasText(value?: string | null) {
  return Boolean(value?.trim())
}

export function validateCampaignForPublish(input: WorkflowInput) {
  const missing: string[] = []

  if (!hasText(input.title)) missing.push("title")
  if (!hasText(input.description)) missing.push("description")
  if (!hasText(input.niche)) missing.push("niche")
  if (!hasText(input.platform)) missing.push("platform")
  if (!hasText(input.contentType)) missing.push("contentType")
  if (input.minFollowers === null || input.minFollowers === undefined || input.minFollowers < 0) {
    missing.push("minFollowers")
  }
  if (!hasText(input.requiredHashtag)) missing.push("requiredHashtag")
  if (!hasText(input.requiredMention)) missing.push("requiredMention")
  if (!input.deadline) missing.push("deadline")
  if (!input.totalBudget || input.totalBudget <= 0) missing.push("totalBudget")

  if (input.type === "campaign") {
    if (!input.fixedReward || input.fixedReward <= 0) missing.push("fixedReward")
    if (!input.minViewsThreshold || input.minViewsThreshold <= 0) {
      missing.push("minViewsThreshold")
    }
    if (!input.maxCreators || input.maxCreators <= 0) missing.push("maxCreators")
  }

  if (input.type === "bounty") {
    if (!input.prizeFirst || input.prizeFirst <= 0) missing.push("prizeFirst")
    if (!input.prizeSecond || input.prizeSecond <= 0) missing.push("prizeSecond")
    if (!input.prizeThird || input.prizeThird <= 0) missing.push("prizeThird")
    if (!input.prizeTop20Each || input.prizeTop20Each <= 0) missing.push("prizeTop20Each")
  }

  return {
    ok: missing.length === 0,
    missing,
  }
}

export function canDeleteCampaign(status: CampaignStatus) {
  return status === "draft"
}

export function canPublishCampaign(status: CampaignStatus) {
  return status === "draft"
}

export function canArchiveCampaign(status: CampaignStatus) {
  return status === "active"
}
