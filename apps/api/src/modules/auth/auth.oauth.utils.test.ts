import { describe, expect, test } from "bun:test"

import { HttpError } from "../../lib/http-error"
import { resolveOAuthLinkUser } from "./auth.oauth.utils"

describe("resolveOAuthLinkUser", () => {
  test("returns existing user when no link intent", () => {
    const existing = { id: "user-b", role: "creator" as const, status: "active" as const }
    expect(resolveOAuthLinkUser(existing, null)).toBe(existing)
  })

  test("returns existing user when link intent matches owner", () => {
    const existing = { id: "user-a", role: "creator" as const, status: "active" as const }
    expect(resolveOAuthLinkUser(existing, "user-a")).toBe(existing)
  })

  test("rejects link when provider account belongs to another user", () => {
    const existing = { id: "user-b", role: "creator" as const, status: "active" as const }

    expect(() => resolveOAuthLinkUser(existing, "user-a")).toThrow(HttpError)
    try {
      resolveOAuthLinkUser(existing, "user-a")
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError)
      expect((error as HttpError).status).toBe(409)
    }
  })
})
