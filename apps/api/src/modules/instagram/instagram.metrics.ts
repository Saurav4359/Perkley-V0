import { createHash } from "node:crypto"

import { calculateEngagementScore } from "../submissions/submission.utils"

export type InstagramMediaMetrics = {
  views: number
  likes: number
  comments: number
}

export type SyncedSubmissionMetrics = InstagramMediaMetrics & {
  engagementScore: number
  source: "instagram" | "simulated"
}

export function normalizeInstagramMediaMetrics(raw: {
  view_count?: number | null
  play_count?: number | null
  like_count?: number | null
  comments_count?: number | null
}): InstagramMediaMetrics {
  const views = Math.max(0, Math.floor(raw.view_count ?? raw.play_count ?? 0))
  const likes = Math.max(0, Math.floor(raw.like_count ?? 0))
  const comments = Math.max(0, Math.floor(raw.comments_count ?? 0))
  return { views, likes, comments }
}

export function simulateInstagramMetrics(seed: string): InstagramMediaMetrics {
  const hash = createHash("sha256").update(seed).digest()
  const views = 1000 + (hash.readUInt32BE(0) % 90000)
  const likePct = (hash[4]! % 15) + 1
  const commentPct = (hash[5]! % 8) + 1
  const likes = Math.floor((views * likePct) / 100)
  const comments = Math.floor((likes * commentPct) / 100)
  return { views, likes, comments }
}

export function buildSyncedMetrics(
  metrics: InstagramMediaMetrics,
  source: SyncedSubmissionMetrics["source"]
): SyncedSubmissionMetrics {
  return {
    ...metrics,
    engagementScore: calculateEngagementScore(metrics),
    source,
  }
}
