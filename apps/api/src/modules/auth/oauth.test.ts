import { beforeAll, describe, expect, mock, test } from "bun:test"
import { randomBytes } from "node:crypto"

process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/perkley"
process.env.JWT_SECRET = "test-secret-with-at-least-thirty-two-chars"
process.env.OAUTH_TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64")
process.env.SESSION_COOKIE_NAME = "perkley_test_session"
process.env.GOOGLE_CLIENT_ID = "google-client-id"
process.env.GOOGLE_CLIENT_SECRET = "google-client-secret"
process.env.GOOGLE_REDIRECT_URI = "http://localhost:3001/api/auth/oauth/google/callback"
process.env.INSTAGRAM_CLIENT_ID = "instagram-client-id"
process.env.INSTAGRAM_CLIENT_SECRET = "instagram-client-secret"
process.env.INSTAGRAM_REDIRECT_URI =
  "http://localhost:3001/api/auth/oauth/instagram/callback"

let oauth: typeof import("./oauth")

beforeAll(async () => {
  oauth = await import("./oauth")
})

describe("oauth helpers", () => {
  test("hashes oauth state deterministically without storing raw state", () => {
    const first = oauth.hashOAuthState("state-value")
    const second = oauth.hashOAuthState("state-value")
    const third = oauth.hashOAuthState("other-state")

    expect(first).toBe(second)
    expect(first).not.toBe("state-value")
    expect(first).not.toBe(third)
  })

  test("builds google authorization url with expected security params", async () => {
    const url = new URL(await oauth.getGoogleAuthorizationUrl("state-123"))

    expect(url.origin).toBe("https://accounts.google.com")
    expect(url.searchParams.get("response_type")).toBe("code")
    expect(url.searchParams.get("scope")).toContain("openid")
    expect(url.searchParams.get("state")).toBe("state-123")
  })

  test("builds instagram authorization url with state", async () => {
    const url = new URL(await oauth.getInstagramAuthorizationUrl("state-456"))

    expect(url.origin).toBe("https://api.instagram.com")
    expect(url.searchParams.get("response_type")).toBe("code")
    expect(url.searchParams.get("scope")).toContain("user_profile")
    expect(url.searchParams.get("state")).toBe("state-456")
  })

  test("consumes oauth state with an atomic single-use update", async () => {
    const future = new Date(Date.now() + 60_000)
    const findUnique = mock(async () => ({
      stateHash: oauth.hashOAuthState("state-to-consume"),
      provider: "google",
      role: "creator",
      userId: null,
      redirectTo: "/dashboard",
      codeVerifier: null,
      expiresAt: future,
      consumedAt: null,
      createdAt: new Date(),
    }))
    const updateMany = mock(async () => ({ count: 1 }))

    const originalFindUnique = oauth.oauthStateStore.findUnique
    const originalUpdateMany = oauth.oauthStateStore.updateMany
    oauth.oauthStateStore.findUnique = findUnique as never
    oauth.oauthStateStore.updateMany = updateMany as never

    try {
      const state = await oauth.consumeOAuthState("google", "state-to-consume")

      expect(state.redirectTo).toBe("/dashboard")
      expect(updateMany).toHaveBeenCalledTimes(1)
      const [updateManyArgs] = updateMany.mock.calls[0] as unknown as [
        { where: { consumedAt: null; expiresAt: { gt: Date } } },
      ]
      expect(updateManyArgs.where.consumedAt).toBeNull()
      expect(updateManyArgs.where.expiresAt.gt).toBeInstanceOf(Date)
    } finally {
      oauth.oauthStateStore.findUnique = originalFindUnique
      oauth.oauthStateStore.updateMany = originalUpdateMany
    }
  })
})
