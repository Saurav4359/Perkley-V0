import { beforeAll, describe, expect, test } from "bun:test"
import { randomBytes } from "node:crypto"

process.env.JWT_SECRET = "test-secret-with-at-least-thirty-two-chars"
process.env.OAUTH_TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64")
process.env.SESSION_COOKIE_NAME = "perkley_test_session"

let session: typeof import("./session")

beforeAll(async () => {
  session = await import("./session")
})

describe("session tokens", () => {
  test("signs and verifies a session token", async () => {
    const token = await session.signSession({
      id: "6a757691-8245-48fc-9b32-80295c1eb5c3",
      role: "creator",
      email: "creator@example.com",
    })

    const verified = await session.verifySessionToken(token)

    expect(verified).toEqual({
      id: "6a757691-8245-48fc-9b32-80295c1eb5c3",
      role: "creator",
      email: "creator@example.com",
    })
  })

  test("returns null for invalid optional sessions", async () => {
    const req = {
      header: () => "Bearer invalid-token",
      cookies: {},
    } as never

    await expect(session.getOptionalSession(req)).resolves.toBeNull()
  })

  test("rejects session tokens with an invalid role", async () => {
    const token = await new (await import("jose")).SignJWT({
      role: "owner",
      email: "owner@example.com",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("6a757691-8245-48fc-9b32-80295c1eb5c3")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(process.env.JWT_SECRET!))

    await expect(session.verifySessionToken(token)).rejects.toThrow()
  })
})
