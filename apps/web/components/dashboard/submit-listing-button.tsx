"use client"

import { useState } from "react"
import { ArrowUpRight, BadgeCheck } from "lucide-react"

import { SubmitListingDialog } from "@/components/dashboard/submit-listing-dialog"
import { buttonVariants } from "@/components/ui/button"
import { useListingSubmission } from "@/hooks/use-listing-submission"
import type { Listing } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

type SubmitListingButtonProps = {
  listing: Listing
  className?: string
  size?: "default" | "lg"
}

export function SubmitListingButton({
  listing,
  className,
  size = "lg",
}: SubmitListingButtonProps) {
  const [open, setOpen] = useState(false)
  const { hasSubmitted } = useListingSubmission(listing.id)
  const isActive = listing.status === "active"

  if (!isActive) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          buttonVariants({ size }),
          "h-11 w-full rounded-lg",
          hasSubmitted
            ? "border border-emerald-500/25 bg-emerald-500/5 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
            : "bg-brand text-white hover:bg-brand/90",
          className
        )}
      >
        {hasSubmitted ? (
          <>
            <BadgeCheck className="size-4" />
            Submitted
          </>
        ) : (
          <>
            Submit now
            <ArrowUpRight className="size-4" />
          </>
        )}
      </button>

      <SubmitListingDialog listing={listing} open={open} onOpenChange={setOpen} />
    </>
  )
}
