import type { MediaPurpose, UserRole } from "@prisma/client"
import { jwtVerify, SignJWT } from "jose"

import { requireUploadTokenSecret } from "../../lib/env"
import { unauthorized } from "../../lib/http-error"

const encoder = new TextEncoder()
const ttlSeconds = 60 * 15

export type UploadTokenPayload = {
  assetId: string
  ownerId: string
  purpose: MediaPurpose
  mimeType: string
  byteSize: number
  role: UserRole
}

function secretKey() {
  return encoder.encode(requireUploadTokenSecret())
}

export async function signUploadToken(payload: UploadTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.assetId)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secretKey())
}

export async function verifyUploadToken(token: string): Promise<UploadTokenPayload> {
  const { payload } = await jwtVerify(token, secretKey())

  if (
    typeof payload.assetId !== "string" ||
    typeof payload.ownerId !== "string" ||
    typeof payload.purpose !== "string" ||
    typeof payload.mimeType !== "string" ||
    typeof payload.byteSize !== "number" ||
    typeof payload.role !== "string"
  ) {
    throw unauthorized("Invalid upload token.")
  }

  return {
    assetId: payload.assetId,
    ownerId: payload.ownerId,
    purpose: payload.purpose as MediaPurpose,
    mimeType: payload.mimeType,
    byteSize: payload.byteSize,
    role: payload.role as UserRole,
  }
}
