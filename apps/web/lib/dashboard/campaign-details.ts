import {
  buildLeaderboard,
  getListing,
  getSubmissionsForListing,
} from "@/lib/dashboard/listings-data"
import type { LeaderboardEntry } from "@/lib/dashboard/types"
import type { Listing } from "@/lib/dashboard/types"
import { formatInr } from "@/lib/dashboard/utils"

export type ListingDetail = Listing & {
  commentCount: number
  participantInitials: string[]
  sections: {
    title: string
    paragraphs?: string[]
    bullets?: string[]
  }[]
  leaderboard: LeaderboardEntry[]
  prizeTiers: { label: string; amount: string }[]
}

export function getListingDetail(id: string): ListingDetail | undefined {
  const listing = getListing(id)
  if (!listing) return undefined

  const submissions = getSubmissionsForListing(id)
  const participantInitials = submissions.slice(0, 6).map((s) => s.creatorInitials)

  const requirements = [
    `Platform: Instagram ${listing.contentType}`,
    `Minimum ${listing.minFollowers.toLocaleString("en-IN")} followers`,
    `Include hashtag ${listing.requiredHashtag}`,
    `Mention ${listing.requiredMention}`,
  ]

  if (listing.type === "campaign") {
    requirements.push(`Minimum ${listing.minViewsThreshold.toLocaleString("en-IN")} views to qualify`)
    requirements.push(`Fixed payout: ₹${formatInr(listing.fixedReward)} per qualified creator`)
  } else {
    requirements.push("Compete for prize pool — ranked by engagement score")
    requirements.push("Tiebreaker: views, then earliest submission")
  }

  const prizeTiers =
    listing.type === "bounty"
      ? [
          { label: "1st place", amount: formatInr(listing.prizeStructure.first) },
          { label: "2nd place", amount: formatInr(listing.prizeStructure.second) },
          { label: "3rd place", amount: formatInr(listing.prizeStructure.third) },
          { label: "Top 20 each", amount: formatInr(listing.prizeStructure.top20Each) },
        ]
      : []

  return {
    ...listing,
    commentCount: 0,
    participantInitials,
    prizeTiers,
    leaderboard: listing.type === "bounty" ? buildLeaderboard(id) : [],
    sections: [
      {
        title: "Description",
        paragraphs: [listing.description],
      },
      {
        title: listing.type === "bounty" ? "How to win" : "How to qualify",
        bullets:
          listing.type === "bounty"
            ? [
                "Submit a public Instagram post before the deadline.",
                "Leaderboard updates every 6 hours based on engagement score.",
                "On deadline, status moves to completed and top submissions are reviewed.",
                "Winners receive payout via Razorpay after admin approval.",
              ]
            : [
                "Submit your post URL and pass the checklist.",
                "Views sync every 6 hours via cron.",
                "Once views meet the threshold, you are marked qualified.",
                "Admin confirms and releases your fixed reward.",
              ],
      },
      {
        title: "Requirements",
        bullets: requirements,
      },
    ],
  }
}

export { getListing }
