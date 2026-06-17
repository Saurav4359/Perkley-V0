import { beforeAll, describe, expect, test } from "bun:test"

process.env.UPLOAD_STORAGE_DIR = "./var/test-uploads"

let storage: typeof import("./upload.storage")

beforeAll(async () => {
  storage = await import("./upload.storage")
})

describe("upload storage helpers", () => {
  test("builds storage and public media paths", () => {
    expect(storage.publicMediaPath("asset-123")).toBe("/api/media/asset-123")
    expect(storage.storagePathForKey("creator_avatar/user/file.png")).toContain(
      "var/test-uploads"
    )
  })
})
