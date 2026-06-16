"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { PencilIcon, PlusIcon, Share2Icon } from "lucide-react"

import { InstagramIcon } from "@/components/auth/auth-social-icons"
import { EditCreatorProfileDialog } from "@/components/dashboard/edit-creator-profile-dialog"
import { Button } from "@/components/ui/button"
import type { CreatorProfileData } from "@/lib/dashboard/creator-profile"
import { formatProfileEarnings } from "@/lib/dashboard/creator-profile"
import { getCreatorLocation } from "@/lib/onboarding/instagram-location"
import { getOnboardingState, loadOnboardingState } from "@/lib/onboarding/storage"
import { cn } from "@/lib/utils"

type ProfileTab = "submissions" | "activity"

type CreatorProfileViewProps = {
  profile: CreatorProfileData
}

function ProfileAvatar({
  name,
  initial,
  imageUrl,
}: {
  name: string
  initial: string
  imageUrl: string
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        className="size-20 rounded-full border border-border object-cover sm:size-24"
      />
    )
  }

  return (
    <span className="flex size-20 items-center justify-center rounded-full border border-border bg-brand text-2xl font-semibold text-white sm:size-24">
      {initial}
    </span>
  )
}

function formatCount(value: number) {
  return value.toLocaleString("en-IN")
}

export function CreatorProfileView({ profile: initialProfile }: CreatorProfileViewProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [instagramFollowers, setInstagramFollowers] = useState<number | null>(8540)
  const [instagramCategory, setInstagramCategory] = useState<string | null>("Education")
  const [tab, setTab] = useState<ProfileTab>("activity")
  const [copied, setCopied] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  function syncFromStorage() {
    const onboarding = loadOnboardingState() ?? getOnboardingState()
    const skills =
      onboarding.niches.length > 0
        ? onboarding.niches
        : onboarding.contentTypes.length > 0
          ? onboarding.contentTypes
          : initialProfile.skills

    setProfile((current) => ({
      ...current,
      displayName: onboarding.displayName,
      location: getCreatorLocation(onboarding.instagram),
      handle: onboarding.instagram?.username ?? current.handle,
      profileImageUrl: onboarding.instagram?.profileImageUrl ?? current.profileImageUrl,
      avatarInitial: onboarding.displayName.slice(0, 1).toUpperCase(),
      skills,
    }))

    if (onboarding.instagram) {
      setInstagramFollowers(onboarding.instagram.followers)
      setInstagramCategory(onboarding.instagram.category)
    }
  }

  useEffect(() => {
    syncFromStorage()
  }, [])

  const handle = profile.handle.startsWith("@") ? profile.handle : `@${profile.handle}`
  const instagramUrl = `https://instagram.com/${handle.replace("@", "")}`

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

  return (
    <div className="-mx-4 -mt-6 sm:-mx-6 sm:-mt-8">
      <div className="relative px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(254,108,55,0.07),transparent_45%),radial-gradient(circle_at_85%_0%,rgba(147,197,253,0.08),transparent_40%)]"
        />

        <div className="relative mx-auto max-w-4xl">
          <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-6 sm:px-8 sm:py-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4 sm:gap-5">
                  <ProfileAvatar
                    name={profile.displayName}
                    initial={profile.avatarInitial}
                    imageUrl={profile.profileImageUrl}
                  />
                  <div className="min-w-0 pt-1">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                      {profile.displayName}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">{handle}</p>
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
            </div>

            <div className="grid gap-6 px-5 py-6 sm:grid-cols-[1fr_auto] sm:items-end sm:px-8 sm:py-7">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Details</p>
                  <p className="mt-2 text-sm text-foreground/80">{profile.location}</p>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-brand"
                  >
                    <InstagramIcon />
                    {handle}
                  </a>
                  {instagramFollowers !== null ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatCount(instagramFollowers)} followers
                      {instagramCategory ? ` · ${instagramCategory}` : null}
                    </p>
                  ) : null}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Skills</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground/70"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:items-end">
                <div className="flex flex-wrap gap-6 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold tabular-nums text-foreground">
                      {formatProfileEarnings(profile.stats.earnedInr)}
                    </p>
                    <p className="text-xs text-muted-foreground">Earned</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold tabular-nums text-foreground">
                      {profile.stats.submissions}
                    </p>
                    <p className="text-xs text-muted-foreground">Submissions</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold tabular-nums text-foreground">
                      {profile.stats.won}
                    </p>
                    <p className="text-xs text-muted-foreground">Won</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8 border-b border-border">
            <div className="flex flex-wrap items-center gap-6">
              {(
                [
                  { id: "submissions", label: "Submissions" },
                  { id: "activity", label: "Activity" },
                ] as const
              ).map((item) => (
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

              {tab === "submissions" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-2 ml-auto rounded-full"
                  render={<Link href="/dashboard/work" />}
                >
                  <PlusIcon data-icon="inline-start" />
                  Add
                </Button>
              ) : null}
            </div>
          </div>

          <div className="mt-6">
            {tab === "activity" ? (
              <div className="space-y-4">
                {profile.activity.length === 0 ? (
                  <EmptyState message="No activity yet. Submit to a bounty or campaign to build your feed." />
                ) : (
                  profile.activity.map((item) => (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-border bg-card"
                    >
                      <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                          {profile.avatarInitial}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-foreground">
                            <span className="font-medium">{profile.displayName}</span>{" "}
                            <span className="text-muted-foreground">{item.action}</span>
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{item.timeAgo}</p>
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/campaigns/${item.listingId}`}
                        className="block border-t border-border px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5"
                      >
                        <div
                          className="overflow-hidden rounded-xl border border-border bg-muted/30"
                          style={{
                            backgroundColor: `${item.accent}08`,
                            borderColor: `${item.accent}20`,
                          }}
                        >
                          <div className="flex min-h-36 items-end p-5 sm:min-h-40">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">
                                {item.action.includes("bounty") ? "Bounty" : "Campaign"}
                              </p>
                              <p className="mt-1 max-w-xl text-base font-semibold text-foreground sm:text-lg">
                                {item.listingTitle}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))
                )}
              </div>
            ) : null}

            {tab === "submissions" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {profile.activity.length === 0 ? (
                  <EmptyState message="No submissions yet. Join a bounty or campaign from the dashboard." />
                ) : (
                  profile.activity.map((item) => (
                    <Link
                      key={item.id}
                      href={`/dashboard/campaigns/${item.listingId}`}
                      className="group overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-border hover:bg-muted/20"
                    >
                      <div
                        className="min-h-32 border-b border-border p-5"
                        style={{ backgroundColor: `${item.accent}0a` }}
                      >
                        <p className="text-xs font-medium text-muted-foreground">Submission</p>
                        <p className="mt-2 text-base font-semibold text-foreground">
                          {item.listingTitle}
                        </p>
                      </div>
                      <div className="px-4 py-3 text-xs text-muted-foreground">
                        Updated {item.timeAgo}
                      </div>
                    </Link>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <EditCreatorProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={syncFromStorage}
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
