import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

import { requireOAuthTokenEncryptionKey } from "./env"

const algorithm = "aes-256-gcm"

export function encryptSecret(value: string | null | undefined) {
  if (!value) return null

  const iv = randomBytes(12)
  const cipher = createCipheriv(algorithm, requireOAuthTokenEncryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString(
    "base64url"
  )}`
}

export function decryptSecret(value: string | null | undefined) {
  if (!value) return null

  const [version, encodedIv, encodedTag, encodedCiphertext] = value.split(".")
  if (version !== "v1" || !encodedIv || !encodedTag || !encodedCiphertext) {
    throw new Error("Invalid encrypted secret format")
  }

  const decipher = createDecipheriv(
    algorithm,
    requireOAuthTokenEncryptionKey(),
    Buffer.from(encodedIv, "base64url")
  )
  decipher.setAuthTag(Buffer.from(encodedTag, "base64url"))

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, "base64url")),
    decipher.final(),
  ])

  return plaintext.toString("utf8")
}
