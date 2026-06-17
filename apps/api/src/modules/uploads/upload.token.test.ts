import { beforeAll, describe, expect, test } from "bun:test"

process.env.UPLOAD_TOKEN_SECRET = "upload-secret-with-at-least-thirty-two-chars"

let uploadToken: typeof import("./upload.token")

beforeAll(async () => {
  uploadToken = await import("./upload.token")
})

describe("upload token", () => {
  test("signs and verifies upload tokens", async () => {
    const token = await uploadToken.signUploadToken({
      assetId: "7d2165aa-34b1-4941-95c6-dfd8c29123a7",
      ownerId: "4dd5ec0b-bfea-42fa-b19c-c6935ac7cce8",
      purpose: "creator_avatar",
      mimeType: "image/png",
      byteSize: 1024,
      role: "creator",
    })

    const verified = await uploadToken.verifyUploadToken(token)
    expect(verified.assetId).toBe("7d2165aa-34b1-4941-95c6-dfd8c29123a7")
    expect(verified.purpose).toBe("creator_avatar")
  })
})
