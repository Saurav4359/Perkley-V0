"use client"

import { useState } from "react"
import { ArrowUpRight, Check } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import type { Listing } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

type SubmitPostFormProps = {
  listing: Listing
  onSubmitted?: () => void
}

const checklistItems = [
  "Post is public",
  "Hashtag included",
  "Mention included",
  "Product visible",
] as const

export function SubmitPostForm({ listing, onSubmitted }: SubmitPostFormProps) {
  const [postUrl, setPostUrl] = useState("")
  const [checks, setChecks] = useState<Record<(typeof checklistItems)[number], boolean>>({
    "Post is public": false,
    "Hashtag included": false,
    "Mention included": false,
    "Product visible": false,
  })
  const [submitted, setSubmitted] = useState(false)

  const allChecked = checklistItems.every((item) => checks[item])
  const canSubmit = postUrl.trim().length > 0 && allChecked && listing.status === "active"

  function toggleCheck(item: (typeof checklistItems)[number]) {
    setChecks((current) => ({ ...current, [item]: !current[item] }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    setSubmitted(true)
    onSubmitted?.()
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <p className="font-medium text-foreground">Submission received</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {listing.type === "bounty"
            ? "You are now competing on the leaderboard. Rankings update every 6 hours."
            : "We will sync your views every 6 hours. You qualify once you hit the view threshold."}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border p-5">
      <div>
        <h2 className="text-[15px] font-semibold text-foreground">Submit your post</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste your public Instagram {listing.contentType} URL. Required:{" "}
          {listing.requiredHashtag} and {listing.requiredMention}.
        </p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-foreground">Instagram post URL</span>
        <input
          type="url"
          value={postUrl}
          onChange={(event) => setPostUrl(event.target.value)}
          placeholder="https://instagram.com/p/..."
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
        />
      </label>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Confirm checklist</p>
        {checklistItems.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => toggleCheck(item)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
              checks[item]
                ? "border-brand/30 bg-brand-muted/40 text-foreground"
                : "border-border text-muted-foreground hover:bg-muted/40"
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded border",
                checks[item] ? "border-brand bg-brand text-white" : "border-border bg-background"
              )}
            >
              {checks[item] ? <Check className="size-3" /> : null}
            </span>
            {item}
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-lg bg-brand text-white hover:bg-brand/90 disabled:opacity-50"
        )}
      >
        Submit entry
        <ArrowUpRight className="size-4" />
      </button>
    </form>
  )
}
