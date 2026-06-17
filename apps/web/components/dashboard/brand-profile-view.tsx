"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  MapPin,
  PencilIcon,
  Share2Icon,
  Star,
  XCircle,
} from "lucide-react"

import { InstagramIcon, XBrandIcon } from "@/components/auth/auth-social-icons"
import { EditBrandProfileDialog } from "@/components/dashboard/edit-brand-profile-dialog"
import { DetailSectionLabel } from "@/components/dashboard/campaign-detail/detail-primitives"
import { Button } from "@/components/ui/button"
import { useMyCampaigns } from "@/hooks/use-campaigns"
import { apiCampaignToBrandItem } from "@/lib/dashboard/campaign-adapter"
import {
  buildBrandProfileFromStored,
  brandProfilePatchFromData,
  formatBrandDate,
  type BrandProfileData,
} from "@/lib/dashboard/brand-profile"
import {
  getBrandProfileState,
  patchBrandProfileState,
} from "@/lib/dashboard/brand-profile-storage"
import type { BrandCampaign } from "@/lib/dashboard/feed-types"
import { LISTING_TYPE_COPY } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

type ProfileTab = "campaigns" | "reviews"

type BrandProfileViewProps = {
  initialTab?: ProfileTab
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const starSize = size === "md" ? "size-4" : "size-3.5"
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            starSize,
            i < Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : i < rating
                ? "fill-amber-400/50 text-amber-400"
                : "fill-muted text-muted"
          )}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

function TrustSignal({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <p className="text-sm font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </p>
    </div>
  )
}

function ActiveCampaignCard({ campaign }: { campaign: BrandCampaign }) {
  const isBounty = campaign.type === "bounty"

  return (
    <Link
      href={`/dashboard/brand/campaigns/${campaign.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-border/80 hover:bg-muted/20"
    >
      <div className="flex items-start gap-4 p-4 sm:p-5">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: campaign.accent }}
        >
          {campaign.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground sm:text-[15px]">
              {campaign.title}
            </h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                isBounty ? "bg-brand-muted text-brand" : "bg-muted text-foreground/75"
              )}
            >
              {campaign.type}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{LISTING_TYPE_COPY[campaign.type]}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">₹{campaign.reward}</span>
            <span>{isBounty ? "Total budget" : "Per creator"}</span>
            <span>
              {campaign.dueInDays > 0 ? `${campaign.dueInDays} days left` : "Closed"}
            </span>
            <span className="capitalize">{campaign.niche}</span>
            <span>{campaign.dueInDays > 0 ? "Submissions open" : "Reviewing"}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function PastCampaignRow({
  campaign,
}: {
  campaign: BrandProfileData["pastCampaigns"][number]
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{campaign.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatBrandDate(campaign.startDate)} – {formatBrandDate(campaign.endDate)}
          <span className="mx-1.5">·</span>
          <span className="capitalize">{campaign.type}</span>
        </p>
      </div>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          campaign.status === "completed"
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            : "bg-muted text-muted-foreground"
        )}
      >
        {campaign.status === "completed" ? (
          <CheckCircle2 className="size-3.5" />
        ) : (
          <XCircle className="size-3.5" />
        )}
        {campaign.status === "completed" ? "Completed" : "Cancelled"}
      </span>
    </div>
  )
}

function ReviewCard({
  review,
  canReply,
}: {
  review: BrandProfileData["reviews"][number]
  canReply: boolean
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  return (
    <article className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground/70">
          {review.creatorInitials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-foreground">{review.creatorName}</p>
            <StarRating rating={review.rating} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {review.campaignTitle} · {formatBrandDate(review.date)}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/85">{review.text}</p>

          {review.reply ? (
            <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
              <p className="text-xs font-medium text-foreground">Brand reply</p>
              <p className="mt-1 text-sm text-muted-foreground">{review.reply}</p>
            </div>
          ) : canReply ? (
            <div className="mt-3">
              {showReplyForm ? (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Write a reply…"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="rounded-full">Post reply</Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setShowReplyForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowReplyForm(true)}
                  className="text-xs font-medium text-brand hover:underline"
                >
                  Reply to review
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export function BrandProfileView({ initialTab = "campaigns" }: BrandProfileViewProps) {
  const campaignsQuery = useMyCampaigns()
  const brandCampaigns = useMemo(
    () => (campaignsQuery.data ?? []).map(apiCampaignToBrandItem),
    [campaignsQuery.data]
  )

  const [profile, setProfile] = useState<BrandProfileData>(() =>
    buildBrandProfileFromStored(getBrandProfileState(), {
      isOwnProfile: true,
      campaigns: [],
    })
  )
  const [tab, setTab] = useState<ProfileTab>(initialTab)
  const [copied, setCopied] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  function syncFromStorage(campaigns = brandCampaigns) {
    const stored = getBrandProfileState()
    setProfile(
      buildBrandProfileFromStored(stored, { isOwnProfile: true, campaigns })
    )
  }

  useEffect(() => {
    syncFromStorage(brandCampaigns)

    function handleUpdate() {
      syncFromStorage(brandCampaigns)
    }

    window.addEventListener("perkley-brand-profile-updated", handleUpdate)
    return () => window.removeEventListener("perkley-brand-profile-updated", handleUpdate)
  }, [brandCampaigns])

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: "campaigns", label: "Campaigns" },
    { id: "reviews", label: "Reviews" },
  ]

  const ratingDisplay =
    profile.trustSignals.reviewCount > 0
      ? `${profile.trustSignals.averageRating}/5`
      : "—"

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  function handleProfileSaved(updates: Partial<BrandProfileData>) {
    const stored = patchBrandProfileState(brandProfilePatchFromData(updates))
    setProfile(
      buildBrandProfileFromStored(stored, {
        isOwnProfile: true,
        campaigns: brandCampaigns,
      })
    )
  }

  return (
    <div className="-mx-4 -mt-6 sm:-mx-6 sm:-mt-8">
      <div className="relative px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(254,108,55,0.06),transparent_45%),radial-gradient(circle_at_85%_0%,rgba(147,197,253,0.06),transparent_40%)]"
        />

        <div className="relative mx-auto max-w-4xl">
          <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-6 sm:px-8 sm:py-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4 sm:gap-5">
                  {profile.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.logoUrl}
                      alt={profile.name}
                      className="size-20 rounded-2xl border border-border object-cover sm:size-24"
                    />
                  ) : (
                    <span
                      className="flex size-20 items-center justify-center rounded-2xl text-2xl font-semibold text-white sm:size-24"
                      style={{ backgroundColor: profile.accent }}
                    >
                      {profile.initials}
                    </span>
                  )}
                  <div className="min-w-0 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                        {profile.name}
                      </h1>
                      {profile.verified ? (
                        <BadgeCheck
                          className="size-5 shrink-0 text-sky-500"
                          aria-label="Verified brand"
                        />
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm capitalize text-muted-foreground">
                      {profile.industry}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setEditOpen(true)}
                  >
                    <PencilIcon data-icon="inline-start" />
                    Edit profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={handleShare}
                  >
                    <Share2Icon data-icon="inline-start" />
                    {copied ? "Copied" : "Share"}
                  </Button>
                </div>
              </div>

              {profile.bio ? (
                <p className="mt-5 text-sm leading-relaxed text-foreground/85">{profile.bio}</p>
              ) : (
                <p className="mt-5 text-sm text-muted-foreground">
                  Add a short bio so creators know what your brand is about.
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                {profile.location ? (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" />
                    {profile.location}
                  </span>
                ) : null}
                {profile.website ? (
                  <a
                    href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-foreground transition-colors hover:text-brand"
                  >
                    <Globe className="size-3.5" />
                    {profile.website.replace(/^https?:\/\//, "")}
                    <ExternalLink className="size-3" />
                  </a>
                ) : null}
              </div>

              {profile.social.instagram || profile.social.twitter ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {profile.social.instagram ? (
                    <a
                      href={`https://instagram.com/${profile.social.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <InstagramIcon className="size-4" monochrome />
                      {profile.social.instagram}
                    </a>
                  ) : null}
                  {profile.social.twitter ? (
                    <a
                      href={`https://x.com/${profile.social.twitter.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <XBrandIcon className="size-3.5 shrink-0" />
                      {profile.social.twitter}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="border-t border-border px-5 py-5 sm:px-8 sm:py-6">
              <DetailSectionLabel className="mb-4">Trust signals</DetailSectionLabel>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
                <TrustSignal
                  label="Member since"
                  value={profile.trustSignals.memberSince}
                  icon={<Calendar className="size-3" />}
                />
                <TrustSignal
                  label="Campaigns run"
                  value={String(profile.trustSignals.totalCampaigns)}
                />
                <TrustSignal
                  label="Completion rate"
                  value={
                    profile.trustSignals.totalCampaigns > 0
                      ? `${profile.trustSignals.completionRate}%`
                      : "—"
                  }
                />
                <TrustSignal
                  label={
                    profile.trustSignals.reviewCount > 0
                      ? `${profile.trustSignals.reviewCount} reviews`
                      : "No reviews yet"
                  }
                  value={ratingDisplay}
                  icon={
                    profile.trustSignals.reviewCount > 0 ? (
                      <StarRating rating={profile.trustSignals.averageRating} />
                    ) : undefined
                  }
                />
                <TrustSignal
                  label="Payout speed"
                  value={profile.trustSignals.payoutTurnaround}
                  icon={<Clock className="size-3" />}
                />
              </div>
            </div>
          </section>

          <div className="mt-8 border-b border-border">
            <div className="flex flex-wrap items-center gap-6">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                    className={cn(
                      "relative pb-3 text-sm font-medium transition-colors",
                      tab === item.id
                        ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-brand"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
            </div>
          </div>

          <div className="mt-6">
            {tab === "campaigns" ? (
              <div className="space-y-8">
                <section className="space-y-4">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Active campaigns</h2>
                    <p className="text-sm text-muted-foreground">
                      Open bounties and campaigns accepting creators
                    </p>
                  </div>
                  {profile.activeCampaigns.length === 0 ? (
                    <EmptyState message="No active campaigns. Launch a bounty or campaign to get started." />
                  ) : (
                    <div className="space-y-3">
                      {profile.activeCampaigns.map((campaign) => (
                        <ActiveCampaignCard key={campaign.id} campaign={campaign} />
                      ))}
                    </div>
                  )}
                </section>

                <section className="space-y-4">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Past campaigns</h2>
                    <p className="text-sm text-muted-foreground">
                      Historical record — completed and cancelled
                    </p>
                  </div>
                  {profile.pastCampaigns.length === 0 ? (
                    <EmptyState message="No past campaigns yet." />
                  ) : (
                    <div className="rounded-2xl border border-border bg-card px-4 sm:px-5">
                      {profile.pastCampaigns.map((campaign) => (
                        <PastCampaignRow key={campaign.id} campaign={campaign} />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            ) : null}

            {tab === "reviews" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Creator reviews</h2>
                    <p className="text-sm text-muted-foreground">
                      Ratings from creators who worked on your campaigns
                    </p>
                  </div>
                  {profile.trustSignals.reviewCount > 0 ? (
                    <div className="flex items-center gap-2 text-sm">
                      <StarRating rating={profile.trustSignals.averageRating} size="md" />
                      <span className="font-semibold tabular-nums text-foreground">
                        {profile.trustSignals.averageRating}
                      </span>
                      <span className="text-muted-foreground">
                        ({profile.trustSignals.reviewCount})
                      </span>
                    </div>
                  ) : null}
                </div>
                {profile.reviews.length === 0 ? (
                  <EmptyState message="No reviews yet. Reviews appear after creators complete campaigns." />
                ) : (
                  <div className="space-y-3">
                    {profile.reviews.map((review) => (
                      <ReviewCard
                        key={review.id}
                        review={review}
                        canReply={profile.isOwnProfile}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <EditBrandProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile}
        onSaved={handleProfileSaved}
      />
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}
