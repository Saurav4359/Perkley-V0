import type { CampaignStatus, UserRole, UserStatus } from "@prisma/client"

export const ADMIN_MANAGEABLE_USER_STATUSES: UserStatus[] = ["active", "suspended", "deleted"]

export function canTransitionUserStatus(current: UserStatus, next: UserStatus) {
  if (current === next) {
    return { ok: false as const, reason: "no_change" as const }
  }
  if (current === "deleted") {
    return { ok: false as const, reason: "user_deleted" as const }
  }
  return { ok: true as const }
}

export function canModerateCampaign(status: CampaignStatus) {
  if (status === "cancelled") {
    return { ok: false as const, reason: "already_cancelled" as const }
  }
  if (status === "completed") {
    return { ok: false as const, reason: "campaign_completed" as const }
  }
  return { ok: true as const }
}

export function normalizePagination(input: { page?: number; pageSize?: number }) {
  const page = Math.max(1, Math.floor(input.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Math.floor(input.pageSize ?? 20)))
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  }
}

export function summarizeUsers(users: Array<{ role: UserRole; status: UserStatus }>) {
  return {
    total: users.length,
    creators: users.filter((user) => user.role === "creator").length,
    brands: users.filter((user) => user.role === "brand").length,
    admins: users.filter((user) => user.role === "admin").length,
    active: users.filter((user) => user.status === "active").length,
    suspended: users.filter((user) => user.status === "suspended").length,
    deleted: users.filter((user) => user.status === "deleted").length,
  }
}

export function summarizeCampaigns(campaigns: Array<{ status: CampaignStatus }>) {
  return {
    total: campaigns.length,
    draft: campaigns.filter((campaign) => campaign.status === "draft").length,
    active: campaigns.filter((campaign) => campaign.status === "active").length,
    archived: campaigns.filter((campaign) => campaign.status === "archived").length,
    completed: campaigns.filter((campaign) => campaign.status === "completed").length,
    cancelled: campaigns.filter((campaign) => campaign.status === "cancelled").length,
  }
}

export function summarizeRevenue(
  escrows: Array<{ amountInr: number; releasedAmountInr: number }>
) {
  const escrowedInr = escrows.reduce((sum, escrow) => sum + escrow.amountInr, 0)
  const releasedInr = escrows.reduce((sum, escrow) => sum + escrow.releasedAmountInr, 0)

  return {
    escrowedInr,
    releasedInr,
    inEscrowInr: Math.max(0, escrowedInr - releasedInr),
  }
}

export function isWhitelistedAdminEmail(email: string | null | undefined, whitelist: string[]) {
  if (!email) return false
  return whitelist.includes(email.trim().toLowerCase())
}
