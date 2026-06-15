export type ListingType = "bounty" | "campaign"

export type Niche = "fitness" | "tech" | "fashion" | "food" | "lifestyle"

export type ContentType = "reel" | "post" | "story"

export type Platform = "instagram"

export type ListingStatus = "active" | "closed" | "completed" | "draft"

export type PrizeStructure = {
  first: number
  second: number
  third: number
  top20Each: number
}

export type BaseListing = {
  id: string
  brandName: string
  brandInitials: string
  brandAccent: string
  title: string
  description: string
  niche: Niche
  platform: Platform
  contentType: ContentType
  minFollowers: number
  requiredHashtag: string
  requiredMention: string
  deadline: string
  status: ListingStatus
  dueInDays: number
}

export type BountyListing = BaseListing & {
  type: "bounty"
  prizeStructure: PrizeStructure
  totalBudget: number
  competingCount: number
}

export type CampaignListing = BaseListing & {
  type: "campaign"
  minViewsThreshold: number
  fixedReward: number
  maxCreators: number
  spotsLeft: number
  totalBudget: number
}

export type Listing = BountyListing | CampaignListing

export type SubmissionStatus =
  | "submitted"
  | "competing"
  | "under_review"
  | "qualified"
  | "won"
  | "paid"
  | "not_qualified"
  | "rejected"

export type Submission = {
  id: string
  listingId: string
  listingTitle: string
  listingType: ListingType
  creatorId: string
  creatorName: string
  creatorInitials: string
  creatorFollowers: number
  postUrl: string
  views: number
  likes: number
  comments: number
  engagementScore: number
  status: SubmissionStatus
  submittedAt: string
  lastSyncedAt: string
}

export type LeaderboardEntry = {
  rank: number
  creatorId: string
  creatorName: string
  creatorInitials: string
  followers: number
  views: number
  likes: number
  comments: number
  score: number
  submissionId: string
}

export const NICHES: { id: Niche | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fitness", label: "Fitness" },
  { id: "tech", label: "Tech" },
  { id: "fashion", label: "Fashion" },
  { id: "food", label: "Food" },
  { id: "lifestyle", label: "Lifestyle" },
]

export const CONTENT_TYPES: { id: ContentType; label: string }[] = [
  { id: "reel", label: "Reel" },
  { id: "post", label: "Post" },
  { id: "story", label: "Story" },
]

export const LISTING_TYPE_COPY: Record<ListingType, string> = {
  bounty: "Compete. Best content wins.",
  campaign: "Complete. Hit the goal. Get paid.",
}
