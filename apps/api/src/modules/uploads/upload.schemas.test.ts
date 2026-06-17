import { describe, expect, test } from "bun:test"

import { prepareUploadSchema } from "./upload.schemas"

describe("upload schemas", () => {
  test("accepts valid upload preparation input", () => {
    const parsed = prepareUploadSchema.parse({
      purpose: "brand_logo",
      filename: "logo.png",
      mimeType: "image/png",
      byteSize: 2048,
    })

    expect(parsed.mimeType).toBe("image/png")
  })

  test("rejects oversized upload preparation input", () => {
    const result = prepareUploadSchema.safeParse({
      purpose: "portfolio_image",
      filename: "photo.jpg",
      mimeType: "image/jpeg",
      byteSize: 20 * 1024 * 1024,
    })

    expect(result.success).toBe(false)
  })
})
