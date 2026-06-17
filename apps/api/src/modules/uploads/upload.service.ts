import type { MediaAsset, MediaPurpose, User, UserRole } from "@prisma/client"

import { badRequest, forbidden, notFound, unauthorized } from "../../lib/http-error"
import { prisma } from "../../lib/prisma"
import { readUpload, publicMediaPath, storeUpload } from "./upload.storage"
import { signUploadToken, verifyUploadToken } from "./upload.token"
import type { PrepareUploadInput } from "./upload.schemas"
import {
  assertUploadAllowed,
  extensionForMimeType,
  sanitizeFilename,
  validateUploadMetadata,
} from "./upload.utils"

async function requireActiveUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.status !== "active") throw unauthorized()
  return user
}

function buildStorageKey(assetId: string, purpose: MediaPurpose, ownerId: string, mimeType: string) {
  const extension = extensionForMimeType(mimeType)
  return `${purpose}/${ownerId}/${assetId}.${extension}`
}

function serializeAsset(asset: Pick<MediaAsset, "id" | "purpose" | "status" | "mimeType" | "byteSizeExpected" | "publicUrl">) {
  return {
    id: asset.id,
    purpose: asset.purpose,
    status: asset.status,
    mimeType: asset.mimeType,
    byteSizeExpected: asset.byteSizeExpected,
    publicUrl: asset.publicUrl,
  }
}

async function loadAttachableAsset(userId: string, purpose: MediaPurpose, assetId: string) {
  const asset = await prisma.mediaAsset.findUnique({ where: { id: assetId } })
  if (!asset) throw notFound("Media asset not found.")
  if (asset.ownerId !== userId) throw forbidden("Media asset does not belong to this user.")
  if (asset.purpose !== purpose) throw badRequest("Media asset purpose does not match attachment.")
  if (!["uploaded", "attached"].includes(asset.status)) {
    throw badRequest("Media asset has not been uploaded yet.", "asset_not_uploaded")
  }
  return asset
}

export async function prepareUpload(userId: string, input: PrepareUploadInput) {
  const user = await requireActiveUser(userId)

  if (!assertUploadAllowed(input.purpose, user.role)) {
    throw forbidden("This upload purpose is not allowed for your role.")
  }

  const metadata = validateUploadMetadata({
    purpose: input.purpose,
    mimeType: input.mimeType,
    byteSize: input.byteSize,
  })

  if (!metadata.ok) {
    throw badRequest(
      metadata.reason === "file_too_large"
        ? "File exceeds the allowed size for this upload purpose."
        : "File type is not allowed for this upload purpose.",
      metadata.reason
    )
  }

  const assetId = crypto.randomUUID()
  const asset = await prisma.mediaAsset.create({
    data: {
      id: assetId,
      ownerId: userId,
      purpose: input.purpose,
      status: "pending",
      storageKey: buildStorageKey(assetId, input.purpose, userId, input.mimeType),
      originalFilename: sanitizeFilename(input.filename),
      mimeType: input.mimeType,
      byteSizeExpected: input.byteSize,
    },
  })

  const uploadToken = await signUploadToken({
    assetId: asset.id,
    ownerId: user.id,
    purpose: asset.purpose,
    mimeType: asset.mimeType,
    byteSize: asset.byteSizeExpected,
    role: user.role,
  })

  return {
    asset: serializeAsset(asset),
    upload: {
      method: "PUT",
      url: `/api/uploads/content/${asset.id}`,
      headers: {
        "content-type": asset.mimeType,
        "x-upload-token": uploadToken,
      },
    },
  }
}

export async function uploadAssetContent(
  assetId: string,
  uploadToken: string,
  bytes: Buffer,
  mimeType: string | undefined
) {
  const token = await verifyUploadToken(uploadToken)
  if (token.assetId !== assetId) {
    throw unauthorized("Upload token does not match asset.")
  }

  const asset = await prisma.mediaAsset.findUnique({ where: { id: assetId } })
  if (!asset) throw notFound("Media asset not found.")
  if (asset.status !== "pending") throw conflictUploadState(asset.status)
  if (asset.ownerId !== token.ownerId || asset.purpose !== token.purpose) {
    throw unauthorized("Upload token does not match asset ownership.")
  }
  if (asset.mimeType !== token.mimeType || asset.byteSizeExpected !== token.byteSize) {
    throw unauthorized("Upload token does not match asset metadata.")
  }

  if (mimeType && mimeType !== asset.mimeType) {
    throw badRequest("Content-Type does not match prepared upload.", "content_type_mismatch")
  }
  if (bytes.length !== asset.byteSizeExpected) {
    throw badRequest("Uploaded file size does not match prepared upload.", "file_size_mismatch")
  }

  await storeUpload(asset.storageKey, bytes)

  const updated = await prisma.mediaAsset.update({
    where: { id: assetId },
    data: {
      status: "uploaded",
      byteSizeActual: bytes.length,
      uploadedAt: new Date(),
      publicUrl: publicMediaPath(assetId),
    },
  })

  return serializeAsset(updated)
}

function conflictUploadState(status: MediaAsset["status"]) {
  return badRequest(`Media asset is ${status} and cannot accept a new upload.`, "invalid_asset_state")
}

export async function getMediaResponse(assetId: string) {
  const asset = await prisma.mediaAsset.findUnique({ where: { id: assetId } })
  if (!asset || !["uploaded", "attached"].includes(asset.status)) {
    throw notFound("Media asset not found.")
  }

  let bytes: Buffer
  try {
    bytes = await readUpload(asset.storageKey)
  } catch {
    throw notFound("Media file not found.")
  }
  return {
    bytes,
    mimeType: asset.mimeType,
  }
}

export async function attachCreatorAvatar(userId: string, assetId: string) {
  const user = await requireRole(userId, "creator")
  const asset = await loadAttachableAsset(userId, "creator_avatar", assetId)

  await prisma.$transaction([
    prisma.mediaAsset.update({
      where: { id: asset.id },
      data: { status: "attached", publicUrl: publicMediaPath(asset.id) },
    }),
    prisma.creatorProfile.upsert({
      where: { userId },
      update: {
        avatarAssetId: asset.id,
        avatarUrl: publicMediaPath(asset.id),
      },
      create: {
        userId,
        displayName: user.email?.split("@")[0] ?? "Creator",
        avatarAssetId: asset.id,
        avatarUrl: publicMediaPath(asset.id),
      },
    }),
  ])
}

export async function attachBrandLogo(userId: string, assetId: string) {
  const user = await requireRole(userId, "brand")
  const asset = await loadAttachableAsset(userId, "brand_logo", assetId)

  await prisma.$transaction([
    prisma.mediaAsset.update({
      where: { id: asset.id },
      data: { status: "attached", publicUrl: publicMediaPath(asset.id) },
    }),
    prisma.brandProfile.upsert({
      where: { userId },
      update: {
        logoAssetId: asset.id,
        logoUrl: publicMediaPath(asset.id),
      },
      create: {
        userId,
        brandName: user.email?.split("@")[0] ?? "Brand",
        workEmail: user.email,
        logoAssetId: asset.id,
        logoUrl: publicMediaPath(asset.id),
      },
    }),
  ])
}

export async function attachPortfolioImage(userId: string, portfolioItemId: string, assetId: string) {
  await requireRole(userId, "creator")
  const asset = await loadAttachableAsset(userId, "portfolio_image", assetId)

  const portfolioItem = await prisma.creatorPortfolioItem.findFirst({
    where: { id: portfolioItemId, creatorId: userId },
  })
  if (!portfolioItem) throw notFound("Portfolio item not found.")

  await prisma.$transaction([
    prisma.mediaAsset.update({
      where: { id: asset.id },
      data: { status: "attached", publicUrl: publicMediaPath(asset.id) },
    }),
    prisma.creatorPortfolioItem.update({
      where: { id: portfolioItem.id },
      data: {
        imageAssetId: asset.id,
        thumbnailUrl: publicMediaPath(asset.id),
      },
    }),
  ])
}

async function requireRole(userId: string, role: UserRole): Promise<User> {
  const user = await requireActiveUser(userId)
  if (user.role !== role) {
    throw forbidden(`${role === "brand" ? "Brand" : "Creator"} role required.`)
  }
  return user
}
