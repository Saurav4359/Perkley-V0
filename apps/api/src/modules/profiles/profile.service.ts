import { Prisma } from "@prisma/client"

import { forbidden, unauthorized } from "../../lib/http-error"
import { prisma } from "../../lib/prisma"
import { encryptSecret } from "../../lib/secrets"
import { publicUser } from "../auth/auth.service"
import type {
  CreatePortfolioItemInput,
  UpdateBrandProfileInput,
  UpdateCreatorProfileInput,
  UpdateUserInput,
  UpsertPaymentDetailsInput,
} from "./profile.schemas"
import {
  accountLast4,
  calculateBrandProfileCompletion,
  calculateCreatorProfileCompletion,
  maskAccountNumber,
  maskUpiId,
  normalizeInstagramHandle,
} from "./profile.utils"

type JsonRecord = Record<string, unknown>

function asJsonRecord(value: Prisma.JsonValue | null | undefined): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as JsonRecord
}

async function requireUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      creatorProfile: true,
      brandProfile: true,
    },
  })

  if (!user || user.status !== "active") throw unauthorized()
  return user
}

function defaultDisplayName(email?: string | null) {
  return email?.split("@")[0] ?? "Creator"
}

export async function getMe(userId: string) {
  const user = await requireUser(userId)
  return publicUser(user)
}

export async function updateMe(userId: string, input: UpdateUserInput) {
  const user = await requireUser(userId)

  if (user.role === "creator" && input.displayName) {
    await prisma.creatorProfile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: input.displayName,
      },
      update: {
        displayName: input.displayName,
      },
    })
  }

  if (user.role === "brand" && input.brandName) {
    await prisma.brandProfile.upsert({
      where: { userId },
      create: {
        userId,
        brandName: input.brandName,
      },
      update: {
        brandName: input.brandName,
      },
    })
  }

  return getMe(userId)
}

function serializePayoutMethod(method: {
  id: string
  type: "upi" | "bank"
  upiIdEncrypted: string | null
  upiIdMasked: string | null
  accountNumberLast4: string | null
  verificationStatus: string
  isDefault: boolean
  createdAt: Date
}) {
  return {
    id: method.id,
    type: method.type,
    upiIdMasked: method.type === "upi" ? method.upiIdMasked : null,
    accountNumberMasked:
      method.type === "bank" ? maskAccountNumber(method.accountNumberLast4) : null,
    verificationStatus: method.verificationStatus,
    isDefault: method.isDefault,
    createdAt: method.createdAt,
  }
}

function serializeCreatorProfile(profile: Awaited<ReturnType<typeof loadCreatorProfile>>) {
  return {
    userId: profile.userId,
    displayName: profile.displayName,
    instagramHandle: profile.instagramHandle,
    avatarUrl: profile.avatarUrl,
    followersCount: profile.followersCount,
    averageViews: profile.averageViews,
    averageLikes: profile.averageLikes,
    location: profile.location,
    niches: profile.niches,
    contentTypes: profile.contentTypes,
    verificationStatus: profile.verificationStatus,
    trustScore: Number(profile.trustScore),
    completion: calculateCreatorProfileCompletion({
      ...profile,
      payoutMethodCount: profile.payoutMethods.length,
      portfolioItemCount: profile.portfolioItems.length,
    }),
    payoutMethod: profile.payoutMethods[0]
      ? serializePayoutMethod(profile.payoutMethods[0])
      : null,
    portfolioCount: profile.portfolioItems.length,
    updatedAt: profile.updatedAt,
  }
}

async function loadCreatorProfile(userId: string) {
  const user = await requireUser(userId)
  if (user.role !== "creator") throw forbidden("Creator profile requires creator role.")

  await prisma.creatorProfile.upsert({
    where: { userId },
    create: {
      userId,
      displayName: defaultDisplayName(user.email),
    },
    update: {},
  })

  return prisma.creatorProfile.findUniqueOrThrow({
    where: { userId },
    include: {
      payoutMethods: {
        where: { isDefault: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      portfolioItems: {
        select: { id: true },
      },
    },
  })
}

export async function getCreatorProfile(userId: string) {
  return serializeCreatorProfile(await loadCreatorProfile(userId))
}

export async function updateCreatorProfile(
  userId: string,
  input: UpdateCreatorProfileInput
) {
  await loadCreatorProfile(userId)

  const updated = await prisma.creatorProfile.update({
    where: { userId },
    data: {
      displayName: input.displayName,
      instagramHandle:
        input.instagramHandle !== undefined
          ? normalizeInstagramHandle(input.instagramHandle)
          : undefined,
      location: input.location,
      niches: input.niches,
      contentTypes: input.contentTypes,
    },
    include: {
      payoutMethods: {
        where: { isDefault: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      portfolioItems: {
        select: { id: true },
      },
    },
  })

  return serializeCreatorProfile(updated)
}

export async function saveCreatorPaymentDetails(
  userId: string,
  input: UpsertPaymentDetailsInput
) {
  await loadCreatorProfile(userId)

  return prisma.$transaction(async (tx) => {
    await tx.creatorPayoutMethod.updateMany({
      where: { creatorId: userId, isDefault: true },
      data: { isDefault: false },
    })

    const method =
      input.type === "upi"
        ? await tx.creatorPayoutMethod.create({
            data: {
              creatorId: userId,
              type: "upi",
              upiIdEncrypted: encryptSecret(input.upiId),
              upiIdMasked: maskUpiId(input.upiId),
              isDefault: true,
            },
          })
        : await tx.creatorPayoutMethod.create({
            data: {
              creatorId: userId,
              type: "bank",
              accountHolderEnc: encryptSecret(input.accountHolder),
              accountNumberEnc: encryptSecret(input.accountNumber),
              accountNumberLast4: accountLast4(input.accountNumber),
              ifscEncrypted: encryptSecret(input.ifsc),
              isDefault: true,
            },
          })

    return serializePayoutMethod(method)
  })
}

function serializePortfolioItem(item: {
  id: string
  title: string
  url: string
  platform: string
  contentType: string
  thumbnailUrl: string | null
  metrics: Prisma.JsonValue
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: item.id,
    title: item.title,
    url: item.url,
    platform: item.platform,
    contentType: item.contentType,
    thumbnailUrl: item.thumbnailUrl,
    metrics: asJsonRecord(item.metrics),
    sortOrder: item.sortOrder,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

export async function listCreatorPortfolio(userId: string) {
  await loadCreatorProfile(userId)

  const items = await prisma.creatorPortfolioItem.findMany({
    where: { creatorId: userId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })

  return items.map(serializePortfolioItem)
}

export async function createCreatorPortfolioItem(
  userId: string,
  input: CreatePortfolioItemInput
) {
  await loadCreatorProfile(userId)

  const item = await prisma.creatorPortfolioItem.create({
    data: {
      creatorId: userId,
      title: input.title,
      url: input.url,
      platform: input.platform,
      contentType: input.contentType,
      thumbnailUrl: input.thumbnailUrl,
      metrics: input.metrics as Prisma.InputJsonObject,
      sortOrder: input.sortOrder,
    },
  })

  return serializePortfolioItem(item)
}

export async function deleteCreatorPortfolioItem(userId: string, itemId: string) {
  await loadCreatorProfile(userId)

  const deleted = await prisma.creatorPortfolioItem.deleteMany({
    where: {
      id: itemId,
      creatorId: userId,
    },
  })

  if (deleted.count !== 1) {
    throw forbidden("Portfolio item not found.")
  }
}

function serializeBrandProfile(profile: Awaited<ReturnType<typeof loadBrandProfile>>) {
  const socialLinks = asJsonRecord(profile.socialLinks)

  return {
    userId: profile.userId,
    brandName: profile.brandName,
    bio: profile.bio,
    industry: profile.industry,
    website: profile.website,
    workEmail: profile.workEmail,
    logoUrl: profile.logoUrl,
    socialLinks,
    verificationStatus: profile.verificationStatus,
    visibility: profile.visibility,
    trustScore: Number(profile.trustScore),
    completion: calculateBrandProfileCompletion({
      ...profile,
      socialLinks,
    }),
    updatedAt: profile.updatedAt,
  }
}

async function loadBrandProfile(userId: string) {
  const user = await requireUser(userId)
  if (user.role !== "brand") throw forbidden("Brand profile requires brand role.")

  return prisma.brandProfile.upsert({
    where: { userId },
    create: {
      userId,
      brandName: user.email?.split("@")[0] ?? "Brand",
      workEmail: user.email,
    },
    update: {},
  })
}

export async function getBrandProfile(userId: string) {
  return serializeBrandProfile(await loadBrandProfile(userId))
}

export async function updateBrandProfile(userId: string, input: UpdateBrandProfileInput) {
  await loadBrandProfile(userId)

  const updated = await prisma.brandProfile.update({
    where: { userId },
    data: {
      brandName: input.brandName,
      bio: input.bio,
      industry: input.industry,
      website: input.website,
      workEmail: input.workEmail,
      logoUrl: input.logoUrl,
      socialLinks: input.socialLinks as Prisma.InputJsonObject | undefined,
      visibility: input.visibility,
    },
  })

  return serializeBrandProfile(updated)
}
