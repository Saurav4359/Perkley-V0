import { apiFetch } from "@/lib/api/client"

export type SubmissionStatus =
  | "submitted"
  | "competing"
  | "under_review"
  | "qualified"
  | "won"
  | "paid"
  | "not_qualified"
  | "rejected"

export type SubmissionCreator = {
  id: string
  displayName: string
  instagramHandle: string | null
  avatarUrl: string | null
  followersCount: number | null
}

export type BrandSubmission = {
  id: string
  applicationId: string | null
  campaignId: string
  creatorId: string
  postUrl: string
  note: string | null
  platform: string
  platformMediaId: string | null
  status: SubmissionStatus
  validationResult: unknown
  views: number
  likes: number
  comments: number
  engagementScore: number
  rejectionReason: string | null
  validatedAt: string | null
  reviewedAt: string | null
  reviewedBy: string | null
  createdAt: string
  updatedAt: string
  creator: SubmissionCreator
  campaign: {
    id: string
    title: string
    type: string
    contentType: string
    status: string
    deadline: string
  }
}

export type CreatorSubmission = {
  id: string
  campaignId: string
  postUrl: string
  note: string | null
  status: SubmissionStatus
  views: number
  likes: number
  comments: number
  engagementScore: number
  rejectionReason: string | null
  validatedAt: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
  campaign?: {
    id: string
    title: string
    type: string
    status: string
    deadline: string
    brandName: string
    brandLogoUrl: string | null
  }
}

export type CreateSubmissionInput = {
  postUrl: string
  note?: string
}

export type UpdateSubmissionInput = {
  postUrl?: string
  note?: string
}

export async function createSubmission(
  campaignId: string,
  input: CreateSubmissionInput
): Promise<BrandSubmission> {
  const { submission } = await apiFetch<{ submission: BrandSubmission }>(
    `/api/campaigns/${campaignId}/submissions`,
    { method: "POST", body: input }
  )
  return submission
}

export async function getMyCampaignSubmission(
  campaignId: string
): Promise<CreatorSubmission | null> {
  const { submission } = await apiFetch<{ submission: CreatorSubmission | null }>(
    `/api/campaigns/${campaignId}/submissions/mine`
  )
  return submission
}

export async function updateMyCampaignSubmission(
  campaignId: string,
  input: UpdateSubmissionInput
): Promise<CreatorSubmission> {
  const { submission } = await apiFetch<{ submission: CreatorSubmission }>(
    `/api/campaigns/${campaignId}/submissions/mine`,
    { method: "PATCH", body: input }
  )
  return submission
}

export async function listCampaignSubmissions(
  campaignId: string,
  status?: SubmissionStatus
): Promise<BrandSubmission[]> {
  const query = status ? `?status=${status}` : ""
  const { submissions } = await apiFetch<{ submissions: BrandSubmission[] }>(
    `/api/campaigns/${campaignId}/submissions${query}`
  )
  return submissions
}

export async function approveSubmission(
  campaignId: string,
  submissionId: string
): Promise<BrandSubmission> {
  const { submission } = await apiFetch<{ submission: BrandSubmission }>(
    `/api/campaigns/${campaignId}/submissions/${submissionId}/approve`,
    { method: "POST" }
  )
  return submission
}

export async function rejectSubmission(
  campaignId: string,
  submissionId: string,
  reason: string
): Promise<BrandSubmission> {
  const { submission } = await apiFetch<{ submission: BrandSubmission }>(
    `/api/campaigns/${campaignId}/submissions/${submissionId}/reject`,
    { method: "POST", body: { reason } }
  )
  return submission
}

export async function listCreatorSubmissions(
  status?: SubmissionStatus
): Promise<CreatorSubmission[]> {
  const query = status ? `?status=${status}` : ""
  const { submissions } = await apiFetch<{ submissions: CreatorSubmission[] }>(
    `/api/creator/submissions${query}`
  )
  return submissions
}
