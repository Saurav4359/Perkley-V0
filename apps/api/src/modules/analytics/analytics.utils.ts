import type { SubmissionStatus } from "@prisma/client"

export type EngagementTotals = {
  views: number
  likes: number
  comments: number
}

export type AnalyticsSubmission = EngagementTotals & {
  status: SubmissionStatus
  engagementScore: number
}

export function sumEngagement(submissions: EngagementTotals[]): EngagementTotals {
  return submissions.reduce(
    (totals, submission) => ({
      views: totals.views + submission.views,
      likes: totals.likes + submission.likes,
      comments: totals.comments + submission.comments,
    }),
    { views: 0, likes: 0, comments: 0 }
  )
}

export function engagementRate(totals: EngagementTotals): number {
  if (totals.views <= 0) return 0
  return Number((((totals.likes + totals.comments) / totals.views) * 100).toFixed(2))
}

export function averageEngagementScore(scores: number[]): number {
  if (scores.length === 0) return 0
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
}

export function calculateWinRate(input: { submissions: number; wins: number }): number {
  if (input.submissions <= 0) return 0
  return Number(((input.wins / input.submissions) * 100).toFixed(2))
}

export function countByStatus(
  submissions: Array<{ status: SubmissionStatus }>
): Record<string, number> {
  return submissions.reduce<Record<string, number>>((counts, submission) => {
    counts[submission.status] = (counts[submission.status] ?? 0) + 1
    return counts
  }, {})
}

export function topPerformers<T extends { engagementScore: number }>(
  items: T[],
  limit: number
): T[] {
  return [...items]
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, Math.max(0, limit))
}

export function buildEngagementSummary(submissions: AnalyticsSubmission[]) {
  const totals = sumEngagement(submissions)

  return {
    submissions: submissions.length,
    totalViews: totals.views,
    totalLikes: totals.likes,
    totalComments: totals.comments,
    engagementRate: engagementRate(totals),
    averageEngagementScore: averageEngagementScore(
      submissions.map((submission) => submission.engagementScore)
    ),
  }
}
