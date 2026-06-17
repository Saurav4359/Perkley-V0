import { describe, expect, test } from "bun:test"

import {
  createSubmissionSchema,
  creatorSubmissionsQuerySchema,
  rejectSubmissionSchema,
  updateSubmissionSchema,
} from "./submission.schemas"

describe("submission schemas", () => {
  test("accepts create submission input", () => {
    expect(
      createSubmissionSchema.parse({
        postUrl: "https://instagram.com/reel/abc123",
        note: "Ready for review",
      })
    ).toEqual({
      postUrl: "https://instagram.com/reel/abc123",
      note: "Ready for review",
    })
  })

  test("requires at least one update field", () => {
    expect(() => updateSubmissionSchema.parse({})).toThrow()
    expect(updateSubmissionSchema.parse({ postUrl: "https://instagram.com/p/abc" })).toEqual({
      postUrl: "https://instagram.com/p/abc",
    })
  })

  test("accepts reject reason", () => {
    expect(rejectSubmissionSchema.parse({ reason: "Missing required hashtag" })).toEqual({
      reason: "Missing required hashtag",
    })
  })

  test("accepts optional creator submission filters", () => {
    expect(creatorSubmissionsQuerySchema.parse({ status: "competing" })).toEqual({
      status: "competing",
    })
  })
})
