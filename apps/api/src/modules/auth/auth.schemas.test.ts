import { describe, expect, test } from "bun:test"

import {
  oauthCallbackQuerySchema,
  oauthStartQuerySchema,
  signinSchema,
  signupSchema,
} from "./auth.schemas"

describe("auth schemas", () => {
  test("normalizes signup email and accepts creator signup", () => {
    const parsed = signupSchema.parse({
      role: "creator",
      email: "SAURAV@EXAMPLE.COM",
      password: "password123",
      displayName: " Saurav ",
    })

    expect(parsed.email).toBe("saurav@example.com")
    expect(parsed.displayName).toBe("Saurav")
  })

  test("requires brand name for brand signup", () => {
    const parsed = signupSchema.safeParse({
      role: "brand",
      email: "brand@example.com",
      password: "password123",
    })

    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues.some((issue) => issue.path.join(".") === "brandName")).toBe(
        true
      )
    }
  })

  test("normalizes signin email", () => {
    const parsed = signinSchema.parse({
      email: "USER@EXAMPLE.COM",
      password: "password123",
    })

    expect(parsed.email).toBe("user@example.com")
  })

  test("defaults oauth role and accepts internal redirect paths", () => {
    const parsed = oauthStartQuerySchema.parse({
      redirectTo: "/dashboard",
    })

    expect(parsed.role).toBe("creator")
    expect(parsed.redirectTo).toBe("/dashboard")
  })

  test("rejects protocol-relative oauth redirects", () => {
    const parsed = oauthStartQuerySchema.safeParse({
      redirectTo: "//evil.example/phish",
    })

    expect(parsed.success).toBe(false)
  })

  test("accepts oauth callback errors without a code", () => {
    const parsed = oauthCallbackQuerySchema.parse({
      error: "access_denied",
      error_description: "User denied access",
    })

    expect(parsed.error).toBe("access_denied")
  })
})
