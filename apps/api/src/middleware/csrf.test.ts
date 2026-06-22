import { describe, expect, test } from "bun:test"

import { HttpError } from "../lib/http-error"
import { csrfProtection } from "./csrf"

function runCsrf(req: Partial<{ method: string; path: string; headers: Record<string, string> }>) {
  const request = {
    method: req.method ?? "POST",
    path: req.path ?? "/api/campaigns/abc/publish",
    header(name: string) {
      const key = Object.keys(req.headers ?? {}).find(
        (entry) => entry.toLowerCase() === name.toLowerCase()
      )
      return key ? req.headers?.[key] : undefined
    },
  } as never

  let nextArg: unknown
  csrfProtection(request, {} as never, (error?: unknown) => {
    nextArg = error
  })

  return nextArg
}

describe("csrfProtection", () => {
  test("allows safe methods", () => {
    expect(runCsrf({ method: "GET" })).toBeUndefined()
  })

  test("blocks cross-site mutations", () => {
    const error = runCsrf({
      headers: { "sec-fetch-site": "cross-site", "content-type": "application/json" },
    })
    expect(error).toBeInstanceOf(HttpError)
    expect((error as HttpError).status).toBe(403)
  })

  test("allows same-origin json mutations", () => {
    expect(
      runCsrf({
        headers: {
          "sec-fetch-site": "same-origin",
          "content-type": "application/json",
        },
      })
    ).toBeUndefined()
  })

  test("allows trusted client header for non-browser callers", () => {
    expect(
      runCsrf({
        headers: { "x-requested-with": "Perkley" },
      })
    ).toBeUndefined()
  })

  test("allows bearer-authenticated mutations", () => {
    expect(
      runCsrf({
        headers: { authorization: "Bearer token", "sec-fetch-site": "cross-site" },
      })
    ).toBeUndefined()
  })
})
