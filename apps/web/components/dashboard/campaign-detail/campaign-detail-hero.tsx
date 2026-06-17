import { Globe, MessageCircle, Zap } from "lucide-react"

import { DetailMetaItem } from "@/components/dashboard/campaign-detail/detail-primitives"
import type { ListingDetail } from "@/lib/dashboard/campaign-details"
import { cn } from "@/lib/utils"

const statusLabels = {
  active: "Submissions open",
  closed: "Closed",
  completed: "Completed",
  draft: "Draft",
} as const

const statusDot = {
  active: "bg-emerald-500",
  closed: "bg-amber-500",
  completed: "bg-muted-foreground",
  draft: "bg-muted-foreground",
} as const

type CampaignDetailHeroProps = {
  listing: ListingDetail
  tagline: string
}

export function CampaignDetailHero({ listing, tagline }: CampaignDetailHeroProps) {
  return (
    <header className="border-b border-border bg-card/30 px-4 py-6 sm:px-6 sm:py-7 lg:px-10">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4 sm:gap-5">
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-xl text-xl font-semibold text-white sm:size-[4.75rem]"
            style={{ backgroundColor: listing.brandAccent }}
          >
            {listing.brandInitials}
          </div>

          <div className="min-w-0 space-y-2.5 sm:space-y-3">
            <h1 className="text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-foreground sm:text-[2.125rem]">
              {listing.title}
            </h1>
            <p className="text-base font-medium text-foreground/75">{tagline}</p>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              <DetailMetaItem>
                by <span className="font-medium text-foreground">{listing.brandName}</span>
              </DetailMetaItem>
              <span className="hidden text-muted-foreground/40 sm:inline">·</span>
              <DetailMetaItem>
                <Zap className="size-3.5 text-brand" />
                <span className="capitalize">{listing.type}</span>
              </DetailMetaItem>
              <span className="hidden text-muted-foreground/40 sm:inline">·</span>
              <DetailMetaItem>
                <span className={cn("size-1.5 rounded-full", statusDot[listing.status])} />
                {statusLabels[listing.status]}
              </DetailMetaItem>
              <span className="hidden text-muted-foreground/40 sm:inline">·</span>
              <DetailMetaItem>
                <Globe className="size-3.5" />
                Instagram · {listing.niche}
              </DetailMetaItem>
              <span className="hidden text-muted-foreground/40 sm:inline">·</span>
              <DetailMetaItem>
                <MessageCircle className="size-3.5" />
                {listing.commentCount}
              </DetailMetaItem>
            </div>
          </div>
        </div>

        {listing.participantInitials.length > 0 ? (
          <div className="flex -space-x-2 lg:shrink-0">
            {listing.participantInitials.map((initials) => (
              <span
                key={initials}
                className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold"
              >
                {initials}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  )
}
