import { apiFetch } from "@/lib/api/client"

export type UserRole = "creator" | "brand" | "admin"
export type UserStatus = "active" | "suspended" | "deleted"
export type VerificationStatus = "none" | "pending" | "verified" | "rejected"
export type AdminCampaignStatus =
  | "draft"
  | "active"
  | "archived"
  | "completed"
  | "cancelled"
export type AdminEscrowStatus =
  | "pending"
  | "funded"
  | "released"
  | "refunded"
  | "failed"

export type Paginated<T> = {
  page: number
  pageSize: number
  total: number
} & T

export type AdminUser = {
  id: string
  email: string
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  name: string | null
  lastLoginAt: string | null
  createdAt: string
}

export type AdminCreator = {
  userId: string
  displayName: string | null
  instagramHandle: string | null
  followersCount: number
  verificationStatus: VerificationStatus
  trustScore: number
  createdAt: string
}

export type AdminBrand = {
  userId: string
  brandName: string | null
  website: string | null
  industry: string | null
  verificationStatus: VerificationStatus
  trustScore: number
  createdAt: string
}

export type AdminCampaign = {
  id: string
  title: string
  type: "bounty" | "campaign"
  status: AdminCampaignStatus
  totalBudget: number
  brandId: string
  brandName: string
  deadline: string
  createdAt: string
}

export type AdminPayment = {
  id: string
  campaignId: string
  campaignTitle: string
  brandId: string
  amountInr: number
  releasedAmountInr: number
  status: AdminEscrowStatus
  createdAt: string
}

export type PlatformReport = {
  users: {
    total: number
    creators: number
    brands: number
    admins: number
    active: number
    suspended: number
    deleted: number
  }
  campaigns: {
    total: number
    draft: number
    active: number
    archived: number
    completed: number
    cancelled: number
  }
  revenue: {
    escrowedInr: number
    releasedInr: number
    inEscrowInr: number
  }
  submissions: { total: number }
  payouts: { paidCount: number; paidAmountInr: number }
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ""
}

export async function fetchAdminUsers(params: {
  page?: number
  pageSize?: number
  role?: UserRole
  status?: UserStatus
  q?: string
}): Promise<Paginated<{ users: AdminUser[] }>> {
  return apiFetch(`/api/admin/users${buildQuery(params)}`)
}

export async function updateUserStatus(
  id: string,
  status: UserStatus
): Promise<{ user: { id: string; status: UserStatus; role: UserRole; email: string } }> {
  return apiFetch(`/api/admin/users/${id}/status`, {
    method: "PATCH",
    body: { status },
  })
}

export async function fetchAdminCreators(params: {
  page?: number
  pageSize?: number
  verificationStatus?: VerificationStatus
}): Promise<Paginated<{ creators: AdminCreator[] }>> {
  return apiFetch(`/api/admin/creators${buildQuery(params)}`)
}

export async function setCreatorVerification(
  id: string,
  verificationStatus: VerificationStatus
): Promise<{ creator: { userId: string; verificationStatus: VerificationStatus } }> {
  return apiFetch(`/api/admin/creators/${id}/verification`, {
    method: "PATCH",
    body: { verificationStatus },
  })
}

export async function fetchAdminBrands(params: {
  page?: number
  pageSize?: number
  verificationStatus?: VerificationStatus
}): Promise<Paginated<{ brands: AdminBrand[] }>> {
  return apiFetch(`/api/admin/brands${buildQuery(params)}`)
}

export async function setBrandVerification(
  id: string,
  verificationStatus: VerificationStatus
): Promise<{ brand: { userId: string; verificationStatus: VerificationStatus } }> {
  return apiFetch(`/api/admin/brands/${id}/verification`, {
    method: "PATCH",
    body: { verificationStatus },
  })
}

export async function fetchAdminCampaigns(params: {
  page?: number
  pageSize?: number
  status?: AdminCampaignStatus
  type?: "bounty" | "campaign"
}): Promise<Paginated<{ campaigns: AdminCampaign[] }>> {
  return apiFetch(`/api/admin/campaigns${buildQuery(params)}`)
}

export async function moderateCampaign(
  id: string,
  reason?: string
): Promise<{ campaign: { id: string; status: AdminCampaignStatus }; reason: string | null }> {
  return apiFetch(`/api/admin/campaigns/${id}/moderate`, {
    method: "POST",
    body: { action: "cancel", reason },
  })
}

export async function fetchAdminPayments(params: {
  page?: number
  pageSize?: number
  status?: AdminEscrowStatus
}): Promise<Paginated<{ payments: AdminPayment[] }>> {
  return apiFetch(`/api/admin/payments${buildQuery(params)}`)
}

export async function fetchPlatformReport(): Promise<PlatformReport> {
  const { report } = await apiFetch<{ report: PlatformReport }>("/api/admin/reports")
  return report
}
