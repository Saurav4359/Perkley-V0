import type { Prisma } from "@prisma/client"

import { badRequest, notFound } from "../../lib/http-error"
import { prisma } from "../../lib/prisma"
import type {
  ListCampaignsQuery,
  ListPaymentsQuery,
  ListProfilesQuery,
  ListUsersQuery,
} from "./admin.schemas"
import {
  canModerateCampaign,
  canTransitionUserStatus,
  normalizePagination,
  summarizeCampaigns,
  summarizeRevenue,
  summarizeUsers,
} from "./admin.utils"

export async function listUsers(query: ListUsersQuery) {
  const { skip, take, page, pageSize } = normalizePagination(query)

  const where: Prisma.UserWhereInput = {
    role: query.role,
    status: query.status,
    ...(query.q
      ? { email: { contains: query.q, mode: "insensitive" } }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        creatorProfile: { select: { displayName: true } },
        brandProfile: { select: { brandName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ])

  return {
    page,
    pageSize,
    total,
    users: items.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      name: user.creatorProfile?.displayName ?? user.brandProfile?.brandName ?? null,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    })),
  }
}

export async function updateUserStatus(
  userId: string,
  status: "active" | "suspended" | "deleted"
) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw notFound("User not found.")

  const decision = canTransitionUserStatus(user.status, status)
  if (!decision.ok) {
    throw badRequest(`Cannot change user status: ${decision.reason}.`, decision.reason)
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, status: true, role: true, email: true },
  })

  return { user: updated }
}

export async function listCreators(query: ListProfilesQuery) {
  const { skip, take, page, pageSize } = normalizePagination(query)

  const where: Prisma.CreatorProfileWhereInput = {
    verificationStatus: query.verificationStatus,
  }

  const [items, total] = await Promise.all([
    prisma.creatorProfile.findMany({
      where,
      select: {
        userId: true,
        displayName: true,
        instagramHandle: true,
        followersCount: true,
        verificationStatus: true,
        trustScore: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.creatorProfile.count({ where }),
  ])

  return {
    page,
    pageSize,
    total,
    creators: items.map((creator) => ({
      userId: creator.userId,
      displayName: creator.displayName,
      instagramHandle: creator.instagramHandle,
      followersCount: creator.followersCount,
      verificationStatus: creator.verificationStatus,
      trustScore: Number(creator.trustScore),
      createdAt: creator.createdAt.toISOString(),
    })),
  }
}

export async function setCreatorVerification(
  userId: string,
  verificationStatus: "none" | "pending" | "verified" | "rejected"
) {
  const creator = await prisma.creatorProfile.findUnique({ where: { userId } })
  if (!creator) throw notFound("Creator profile not found.")

  const updated = await prisma.creatorProfile.update({
    where: { userId },
    data: { verificationStatus },
    select: { userId: true, verificationStatus: true },
  })

  return { creator: updated }
}

export async function listBrands(query: ListProfilesQuery) {
  const { skip, take, page, pageSize } = normalizePagination(query)

  const where: Prisma.BrandProfileWhereInput = {
    verificationStatus: query.verificationStatus,
  }

  const [items, total] = await Promise.all([
    prisma.brandProfile.findMany({
      where,
      select: {
        userId: true,
        brandName: true,
        website: true,
        industry: true,
        verificationStatus: true,
        trustScore: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.brandProfile.count({ where }),
  ])

  return {
    page,
    pageSize,
    total,
    brands: items.map((brand) => ({
      userId: brand.userId,
      brandName: brand.brandName,
      website: brand.website,
      industry: brand.industry,
      verificationStatus: brand.verificationStatus,
      trustScore: Number(brand.trustScore),
      createdAt: brand.createdAt.toISOString(),
    })),
  }
}

export async function setBrandVerification(
  userId: string,
  verificationStatus: "none" | "pending" | "verified" | "rejected"
) {
  const brand = await prisma.brandProfile.findUnique({ where: { userId } })
  if (!brand) throw notFound("Brand profile not found.")

  const updated = await prisma.brandProfile.update({
    where: { userId },
    data: { verificationStatus },
    select: { userId: true, verificationStatus: true },
  })

  return { brand: updated }
}

export async function listCampaigns(query: ListCampaignsQuery) {
  const { skip, take, page, pageSize } = normalizePagination(query)

  const where: Prisma.CampaignWhereInput = {
    status: query.status,
    type: query.type,
  }

  const [items, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        totalBudget: true,
        deadline: true,
        createdAt: true,
        brand: {
          select: { id: true, brandProfile: { select: { brandName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.campaign.count({ where }),
  ])

  return {
    page,
    pageSize,
    total,
    campaigns: items.map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      type: campaign.type,
      status: campaign.status,
      totalBudget: campaign.totalBudget,
      brandId: campaign.brand.id,
      brandName: campaign.brand.brandProfile?.brandName ?? "Brand",
      deadline: campaign.deadline.toISOString(),
      createdAt: campaign.createdAt.toISOString(),
    })),
  }
}

export async function moderateCampaign(campaignId: string, reason?: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } })
  if (!campaign) throw notFound("Campaign not found.")

  const decision = canModerateCampaign(campaign.status)
  if (!decision.ok) {
    throw badRequest(`Cannot moderate campaign: ${decision.reason}.`, decision.reason)
  }

  const updated = await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: "cancelled",
      archivedAt: new Date(),
    },
    select: { id: true, status: true },
  })

  return { campaign: updated, reason: reason ?? null }
}

export async function listPayments(query: ListPaymentsQuery) {
  const { skip, take, page, pageSize } = normalizePagination(query)

  const where: Prisma.EscrowTransactionWhereInput = {
    status: query.status,
  }

  const [items, total] = await Promise.all([
    prisma.escrowTransaction.findMany({
      where,
      select: {
        id: true,
        campaignId: true,
        brandId: true,
        amountInr: true,
        releasedAmountInr: true,
        status: true,
        createdAt: true,
        campaign: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.escrowTransaction.count({ where }),
  ])

  return {
    page,
    pageSize,
    total,
    payments: items.map((escrow) => ({
      id: escrow.id,
      campaignId: escrow.campaignId,
      campaignTitle: escrow.campaign.title,
      brandId: escrow.brandId,
      amountInr: escrow.amountInr,
      releasedAmountInr: escrow.releasedAmountInr,
      status: escrow.status,
      createdAt: escrow.createdAt.toISOString(),
    })),
  }
}

export async function getPlatformReport() {
  const [users, campaigns, escrows, submissions, payoutAgg] = await Promise.all([
    prisma.user.findMany({ select: { role: true, status: true } }),
    prisma.campaign.findMany({ select: { status: true } }),
    prisma.escrowTransaction.findMany({
      select: { amountInr: true, releasedAmountInr: true },
    }),
    prisma.campaignSubmission.count(),
    prisma.payout.aggregate({
      _sum: { amountInr: true },
      _count: true,
      where: { status: "paid" },
    }),
  ])

  return {
    users: summarizeUsers(users),
    campaigns: summarizeCampaigns(campaigns),
    revenue: summarizeRevenue(escrows),
    submissions: { total: submissions },
    payouts: {
      paidCount: payoutAgg._count,
      paidAmountInr: payoutAgg._sum.amountInr ?? 0,
    },
  }
}
