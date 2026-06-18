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

/** e.g. 350000 → "₹3.5L", 100000 → "₹1L" */
export function formatInrLakhs(amount: number) {
  if (amount < 100_000) {
    return `₹${formatInr(amount)}`
  }

  const lakhs = amount / 100_000
  const rounded = Math.round(lakhs * 10) / 10
  return `₹${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}L`
}

export function daysUntil(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function formatDeadlineLabel(dueInDays: number) {
  if (dueInDays <= 0) return "Closed"
  return `Due in ${dueInDays}d`
}

export function formatRelativeTime(isoDate: string) {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diffMs / (1000 * 60))
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}
