import { apiFetch } from "@/lib/api/client"

export type LeaderboardApiEntry = {
  rank: number
  submissionId: string
  creatorId: string
  creatorName: string
  creatorInitials: string
  followers: number
  views: number
  likes: number
  comments: number
  score: number
  prizeAmount: number
  status: string
}

export type CampaignLeaderboard = {
  isLive: boolean
  generatedAt: string
  prizeTiers: { rank: number; amount: number }[]
  entries: LeaderboardApiEntry[]
}

export async function fetchCampaignLeaderboard(
  campaignId: string
): Promise<CampaignLeaderboard> {
  const { leaderboard } = await apiFetch<{ leaderboard: CampaignLeaderboard }>(
    `/api/campaigns/${campaignId}/leaderboard`
  )
  return leaderboard
}

export type SelectWinnersResult = {
  campaignId: string
  campaignStatus: string
  winners: {
    rank: number
    submissionId: string
    creatorId: string
    creatorName: string
    creatorInitials: string
    score: number
    prizeAmount: number
    status: "won"
  }[]
  leaderboard: CampaignLeaderboard
}

export async function selectCampaignWinners(
  campaignId: string
): Promise<SelectWinnersResult> {
  return apiFetch<SelectWinnersResult>(
    `/api/campaigns/${campaignId}/leaderboard/select-winners`,
    { method: "POST" }
  )
}
