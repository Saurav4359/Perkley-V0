import { describe, expect, test } from "bun:test"

import { HttpError } from "../lib/http-error"
import { requireRoles } from "./rbac"

describe("rbac middleware", () => {
  test("allows users with an accepted role", async () => {
    const middleware = requireRoles("brand", "admin")
    const req = {
      auth: {
        id: "user-1",
        role: "brand",
        email: "brand@example.com",
      },
    } as never
    let nextValue: unknown

    middleware(req, {} as never, (value?: unknown) => {
      nextValue = value
    })

    expect(nextValue).toBeUndefined()
  })

  test("rejects users without an accepted role", async () => {
    const middleware = requireRoles("brand")
    const req = {
      auth: {
        id: "user-1",
        role: "creator",
        email: "creator@example.com",
      },
    } as never
    let nextValue: unknown

    middleware(req, {} as never, (value?: unknown) => {
      nextValue = value
    })

    expect(nextValue).toBeInstanceOf(HttpError)
    expect((nextValue as HttpError).status).toBe(403)
  })

  test("rejects missing sessions as unauthenticated", async () => {
    const middleware = requireRoles("brand")
    let nextValue: unknown

    middleware({} as never, {} as never, (value?: unknown) => {
      nextValue = value
    })

    expect(nextValue).toBeInstanceOf(HttpError)
    expect((nextValue as HttpError).status).toBe(401)
  })
})
