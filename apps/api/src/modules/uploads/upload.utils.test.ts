import { describe, expect, test } from "bun:test"

import {
  assertUploadAllowed,
  extensionForMimeType,
  sanitizeFilename,
  validateUploadMetadata,
} from "./upload.utils"

describe("upload utilities", () => {
  test("checks role access by purpose", () => {
    expect(assertUploadAllowed("brand_logo", "brand")).toBe(true)
    expect(assertUploadAllowed("brand_logo", "creator")).toBe(false)
  })

  test("validates mime type and size", () => {
    expect(
      validateUploadMetadata({
        purpose: "creator_avatar",
        mimeType: "image/png",
        byteSize: 1024,
      })
    ).toEqual({ ok: true })

    expect(
      validateUploadMetadata({
        purpose: "creator_avatar",
        mimeType: "application/pdf",
        byteSize: 1024,
      })
    ).toEqual({ ok: false, reason: "unsupported_mime_type" })
  })

  test("sanitizes filenames and maps mime extensions", () => {
    expect(sanitizeFilename("my evil file!!.png")).toBe("my-evil-file-.png")
    expect(extensionForMimeType("image/webp")).toBe("webp")
  })
})
