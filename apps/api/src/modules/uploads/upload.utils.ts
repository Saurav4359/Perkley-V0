import type { MediaPurpose, UserRole } from "@prisma/client"

export type UploadRule = {
  allowedRoles: UserRole[]
  maxBytes: number
  mimeTypes: string[]
}

const mb = 1024 * 1024

export const uploadRules: Record<MediaPurpose, UploadRule> = {
  brand_logo: {
    allowedRoles: ["brand"],
    maxBytes: 3 * mb,
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
  },
  creator_avatar: {
    allowedRoles: ["creator"],
    maxBytes: 3 * mb,
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
  },
  portfolio_image: {
    allowedRoles: ["creator"],
    maxBytes: 8 * mb,
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
  },
}

export function assertUploadAllowed(purpose: MediaPurpose, role: UserRole) {
  return uploadRules[purpose].allowedRoles.includes(role)
}

export function validateUploadMetadata(input: {
  purpose: MediaPurpose
  mimeType: string
  byteSize: number
}) {
  const rule = uploadRules[input.purpose]

  if (!rule.mimeTypes.includes(input.mimeType)) {
    return { ok: false as const, reason: "unsupported_mime_type" }
  }

  if (input.byteSize > rule.maxBytes) {
    return { ok: false as const, reason: "file_too_large" }
  }

  return { ok: true as const }
}

export function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 120)
}

export function extensionForMimeType(mimeType: string) {
  switch (mimeType) {
    case "image/png":
      return "png"
    case "image/jpeg":
      return "jpg"
    case "image/webp":
      return "webp"
    default:
      return "bin"
  }
}
