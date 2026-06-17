import { beforeAll, describe, expect, test } from "bun:test"
import { randomBytes } from "node:crypto"

process.env.OAUTH_TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64")

let secrets: typeof import("./secrets")

beforeAll(async () => {
  secrets = await import("./secrets")
})

describe("secret encryption", () => {
  test("encrypts and decrypts secret values", () => {
    const encrypted = secrets.encryptSecret("oauth-token")

    expect(encrypted).toStartWith("v1.")
    expect(encrypted).not.toContain("oauth-token")
    expect(secrets.decryptSecret(encrypted)).toBe("oauth-token")
  })

  test("keeps empty values nullable", () => {
    expect(secrets.encryptSecret(null)).toBeNull()
    expect(secrets.decryptSecret(null)).toBeNull()
  })
})
