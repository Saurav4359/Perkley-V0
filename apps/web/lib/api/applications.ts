import { apiFetch } from "@/lib/api/client"

export type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn"

export type ApplicationCreator = {
  id: string
  displayName: string
  instagramHandle: string | null
  avatarUrl: string | null
  followersCount: number | null
  verificationStatus: string
}

export type BrandApplication = {
  id: string
  campaignId: string
  creatorId: string
  status: ApplicationStatus
  message: string | null
  reviewedAt: string | null
  reviewedBy: string | null
  createdAt: string
  updatedAt: string
  creator: ApplicationCreator
}

export type CreatorApplication = {
  id: string
  campaignId: string
  status: ApplicationStatus
  message: string | null
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
  campaign: {
    id: string
    title: string
    type: string
    status: string
    deadline: string
    brandName: string
    brandLogoUrl: string | null
  }
}

export async function applyToCampaign(
  campaignId: string,
  message?: string
): Promise<BrandApplication> {
  const { application } = await apiFetch<{ application: BrandApplication }>(
    `/api/campaigns/${campaignId}/apply`,
    { method: "POST", body: message ? { message } : {} }
  )
  return application
}

export async function withdrawApplication(
  campaignId: string
): Promise<BrandApplication> {
  const { application } = await apiFetch<{ application: BrandApplication }>(
    `/api/campaigns/${campaignId}/apply`,
    { method: "DELETE" }
  )
  return application
}

export async function listCampaignApplications(
  campaignId: string,
  status?: ApplicationStatus
): Promise<BrandApplication[]> {
  const query = status ? `?status=${status}` : ""
  const { applications } = await apiFetch<{ applications: BrandApplication[] }>(
    `/api/campaigns/${campaignId}/applications${query}`
  )
  return applications
}

export async function acceptApplication(
  campaignId: string,
  applicationId: string
): Promise<BrandApplication> {
  const { application } = await apiFetch<{ application: BrandApplication }>(
    `/api/campaigns/${campaignId}/applications/${applicationId}/accept`,
    { method: "POST" }
  )
  return application
}

export async function rejectApplication(
  campaignId: string,
  applicationId: string
): Promise<BrandApplication> {
  const { application } = await apiFetch<{ application: BrandApplication }>(
    `/api/campaigns/${campaignId}/applications/${applicationId}/reject`,
    { method: "POST" }
  )
  return application
}

export async function listCreatorApplications(
  status?: ApplicationStatus
): Promise<CreatorApplication[]> {
  const query = status ? `?status=${status}` : ""
  const { applications } = await apiFetch<{ applications: CreatorApplication[] }>(
    `/api/creator/applications${query}`
  )
  return applications
}
