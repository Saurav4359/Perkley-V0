import type { PrizeStructure } from "@/lib/dashboard/types"

export function calcEngagementScore(views: number, likes: number, comments: number) {
  return views * 1 + likes * 2 + comments * 3
}

export function calcBountyBudget(prizes: PrizeStructure) {
  return prizes.first + prizes.second + prizes.third + prizes.top20Each * 20
}

export function calcCampaignBudget(fixedReward: number, maxCreators: number) {
  return fixedReward * maxCreators
}

export function formatInr(amount: number) {
  return amount.toLocaleString("en-IN")
}

export function daysUntil(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function formatDeadlineLabel(dueInDays: number) {
  if (dueInDays <= 0) return "Closed"
  return `Due in ${dueInDays}d`
}
