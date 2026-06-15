import { calcEngagementScore } from "@/lib/dashboard/utils"
import type {
  BountyListing,
  CampaignListing,
  LeaderboardEntry,
  Listing,
  Submission,
} from "@/lib/dashboard/types"

export const LISTINGS: Listing[] = [
  {
    id: "b1",
    type: "bounty",
    brandName: "Northline Skincare",
    brandInitials: "NS",
    brandAccent: "#FE6C37",
    title: "Vitamin C launch reel sprint",
    description:
      "Create an authentic Instagram Reel showcasing our new vitamin C serum. Focus on texture, glow, and morning routine — no medical claims.",
    niche: "lifestyle",
    platform: "instagram",
    contentType: "reel",
    minFollowers: 5000,
    requiredHashtag: "#NorthlineGlow",
    requiredMention: "@northlineskincare",
    deadline: "2026-06-20",
    status: "active",
    dueInDays: 7,
    prizeStructure: { first: 25000, second: 15000, third: 10000, top20Each: 2500 },
    totalBudget: 100000,
    competingCount: 48,
  },
  {
    id: "c1",
    type: "campaign",
    brandName: "VaultPay",
    brandInitials: "VP",
    brandAccent: "#0A0A0A",
    title: "UPI demo reel — flat payout",
    description:
      "Post a Reel walking through a real UPI payment flow with VaultPay. Hit the view threshold and get paid a fixed amount.",
    niche: "tech",
    platform: "instagram",
    contentType: "reel",
    minFollowers: 3000,
    requiredHashtag: "#VaultPayDemo",
    requiredMention: "@vaultpay.in",
    deadline: "2026-06-25",
    status: "active",
    dueInDays: 12,
    minViewsThreshold: 10000,
    fixedReward: 5000,
    maxCreators: 20,
    spotsLeft: 6,
    totalBudget: 100000,
  },
  {
    id: "b2",
    type: "bounty",
    brandName: "PulseFit",
    brandInitials: "PF",
    brandAccent: "#059669",
    title: "Summer shred challenge",
    description:
      "Show your workout routine featuring PulseFit resistance bands. Compete for the prize pool — top engagement wins.",
    niche: "fitness",
    platform: "instagram",
    contentType: "reel",
    minFollowers: 8000,
    requiredHashtag: "#PulseFitSummer",
    requiredMention: "@pulsefit.india",
    deadline: "2026-06-18",
    status: "active",
    dueInDays: 5,
    prizeStructure: { first: 30000, second: 18000, third: 12000, top20Each: 3000 },
    totalBudget: 120000,
    competingCount: 62,
  },
  {
    id: "c2",
    type: "campaign",
    brandName: "Masala Box",
    brandInitials: "MB",
    brandAccent: "#DC2626",
    title: "Recipe reel with meal kit",
    description:
      "Film a recipe Reel using Masala Box ingredients. Minimum 8K views to qualify for the fixed payout.",
    niche: "food",
    platform: "instagram",
    contentType: "reel",
    minFollowers: 2000,
    requiredHashtag: "#MasalaBoxAtHome",
    requiredMention: "@masalabox",
    deadline: "2026-07-01",
    status: "active",
    dueInDays: 18,
    minViewsThreshold: 8000,
    fixedReward: 3500,
    maxCreators: 30,
    spotsLeft: 14,
    totalBudget: 105000,
  },
  {
    id: "b3",
    type: "bounty",
    brandName: "Thread & Co",
    brandInitials: "TC",
    brandAccent: "#6366F1",
    title: "Monsoon drop lookbook",
    description:
      "Style our monsoon collection in a carousel or Reel. Best styling and engagement wins from the prize pool.",
    niche: "fashion",
    platform: "instagram",
    contentType: "post",
    minFollowers: 10000,
    requiredHashtag: "#ThreadMonsoon",
    requiredMention: "@threadandco",
    deadline: "2026-05-30",
    status: "completed",
    dueInDays: 0,
    prizeStructure: { first: 20000, second: 12000, third: 8000, top20Each: 2000 },
    totalBudget: 80000,
    competingCount: 35,
  },
  {
    id: "c3",
    type: "campaign",
    brandName: "Glow Studio",
    brandInitials: "GS",
    brandAccent: "#DB2777",
    title: "Studio tour Story series",
    description:
      "Post an Instagram Story walkthrough of our studio. Flat reward once you hit 5K story views.",
    niche: "lifestyle",
    platform: "instagram",
    contentType: "story",
    minFollowers: 1500,
    requiredHashtag: "#GlowStudioTour",
    requiredMention: "@glowstudio.in",
    deadline: "2026-06-15",
    status: "closed",
    dueInDays: 2,
    minViewsThreshold: 5000,
    fixedReward: 2000,
    maxCreators: 15,
    spotsLeft: 0,
    totalBudget: 30000,
  },
]

export const SUBMISSIONS: Submission[] = [
  {
    id: "s1",
    listingId: "b1",
    listingTitle: "Vitamin C launch reel sprint",
    listingType: "bounty",
    creatorId: "cr1",
    creatorName: "Maya Chen",
    creatorInitials: "MC",
    creatorFollowers: 42000,
    postUrl: "https://instagram.com/p/example1",
    views: 84200,
    likes: 6200,
    comments: 412,
    engagementScore: calcEngagementScore(84200, 6200, 412),
    status: "competing",
    submittedAt: "2026-06-08T10:00:00Z",
    lastSyncedAt: "2026-06-13T06:00:00Z",
  },
  {
    id: "s2",
    listingId: "b1",
    listingTitle: "Vitamin C launch reel sprint",
    listingType: "bounty",
    creatorId: "cr2",
    creatorName: "Jordan Okoye",
    creatorInitials: "JO",
    creatorFollowers: 28500,
    postUrl: "https://instagram.com/p/example2",
    views: 62100,
    likes: 5100,
    comments: 288,
    engagementScore: calcEngagementScore(62100, 5100, 288),
    status: "competing",
    submittedAt: "2026-06-09T14:30:00Z",
    lastSyncedAt: "2026-06-13T06:00:00Z",
  },
  {
    id: "s3",
    listingId: "b1",
    listingTitle: "Vitamin C launch reel sprint",
    listingType: "bounty",
    creatorId: "cr3",
    creatorName: "Priya Shah",
    creatorInitials: "PS",
    creatorFollowers: 51200,
    postUrl: "https://instagram.com/p/example3",
    views: 95800,
    likes: 7400,
    comments: 520,
    engagementScore: calcEngagementScore(95800, 7400, 520),
    status: "competing",
    submittedAt: "2026-06-07T09:15:00Z",
    lastSyncedAt: "2026-06-13T06:00:00Z",
  },
  {
    id: "s4",
    listingId: "c1",
    listingTitle: "UPI demo reel — flat payout",
    listingType: "campaign",
    creatorId: "cr1",
    creatorName: "Maya Chen",
    creatorInitials: "MC",
    creatorFollowers: 42000,
    postUrl: "https://instagram.com/p/example4",
    views: 12400,
    likes: 890,
    comments: 64,
    engagementScore: calcEngagementScore(12400, 890, 64),
    status: "qualified",
    submittedAt: "2026-06-10T11:00:00Z",
    lastSyncedAt: "2026-06-13T06:00:00Z",
  },
  {
    id: "s5",
    listingId: "c1",
    listingTitle: "UPI demo reel — flat payout",
    listingType: "campaign",
    creatorId: "cr4",
    creatorName: "Alex Rivera",
    creatorInitials: "AR",
    creatorFollowers: 8900,
    postUrl: "https://instagram.com/p/example5",
    views: 4200,
    likes: 310,
    comments: 18,
    engagementScore: calcEngagementScore(4200, 310, 18),
    status: "under_review",
    submittedAt: "2026-06-11T16:45:00Z",
    lastSyncedAt: "2026-06-13T06:00:00Z",
  },
  {
    id: "s6",
    listingId: "c2",
    listingTitle: "Recipe reel with meal kit",
    listingType: "campaign",
    creatorId: "cr1",
    creatorName: "Maya Chen",
    creatorInitials: "MC",
    creatorFollowers: 42000,
    postUrl: "https://instagram.com/p/example6",
    views: 18200,
    likes: 1400,
    comments: 92,
    engagementScore: calcEngagementScore(18200, 1400, 92),
    status: "paid",
    submittedAt: "2026-06-01T08:00:00Z",
    lastSyncedAt: "2026-06-13T06:00:00Z",
  },
  {
    id: "s7",
    listingId: "b2",
    listingTitle: "Summer shred challenge",
    listingType: "bounty",
    creatorId: "cr1",
    creatorName: "Maya Chen",
    creatorInitials: "MC",
    creatorFollowers: 42000,
    postUrl: "https://instagram.com/p/example7",
    views: 31000,
    likes: 2800,
    comments: 156,
    engagementScore: calcEngagementScore(31000, 2800, 156),
    status: "competing",
    submittedAt: "2026-06-12T07:20:00Z",
    lastSyncedAt: "2026-06-13T06:00:00Z",
  },
  {
    id: "s8",
    listingId: "c1",
    listingTitle: "UPI demo reel — flat payout",
    listingType: "campaign",
    creatorId: "cr5",
    creatorName: "Sam Lee",
    creatorInitials: "SL",
    creatorFollowers: 6200,
    postUrl: "https://instagram.com/p/example8",
    views: 2100,
    likes: 180,
    comments: 9,
    engagementScore: calcEngagementScore(2100, 180, 9),
    status: "not_qualified",
    submittedAt: "2026-06-09T19:00:00Z",
    lastSyncedAt: "2026-06-13T06:00:00Z",
  },
]

const CURRENT_CREATOR_ID = "cr1"

export function getListing(id: string) {
  return LISTINGS.find((item) => item.id === id)
}

export function getListingsByType(type?: "bounty" | "campaign" | "all") {
  if (!type || type === "all") return LISTINGS
  return LISTINGS.filter((item) => item.type === type)
}

export function getSubmissionsForListing(listingId: string) {
  return SUBMISSIONS.filter((item) => item.listingId === listingId)
}

export function getCreatorSubmissions(creatorId = CURRENT_CREATOR_ID) {
  return SUBMISSIONS.filter((item) => item.creatorId === creatorId)
}

export function buildLeaderboard(listingId: string): LeaderboardEntry[] {
  return getSubmissionsForListing(listingId)
    .filter((item) => item.listingType === "bounty")
    .sort((a, b) => {
      if (b.engagementScore !== a.engagementScore) {
        return b.engagementScore - a.engagementScore
      }
      if (b.views !== a.views) return b.views - a.views
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    })
    .map((item, index) => ({
      rank: index + 1,
      creatorId: item.creatorId,
      creatorName: item.creatorName,
      creatorInitials: item.creatorInitials,
      followers: item.creatorFollowers,
      views: item.views,
      likes: item.likes,
      comments: item.comments,
      score: item.engagementScore,
      submissionId: item.id,
    }))
}

export function getPendingAdminSubmissions() {
  return SUBMISSIONS.filter((item) =>
    ["submitted", "under_review", "qualified", "won"].includes(item.status)
  )
}

export { CURRENT_CREATOR_ID }
