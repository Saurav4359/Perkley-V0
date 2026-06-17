"use client"

import { CreatorProfileView } from "@/components/dashboard/creator-profile-view"
import { useCreatorStats } from "@/hooks/use-dashboard"
import { useCreatorProfile } from "@/hooks/use-profile"
import { useCreatorSubmissions } from "@/hooks/use-submissions"
import { apiCreatorProfileToViewData } from "@/lib/dashboard/creator-profile-adapter"

export function CreatorProfilePageClient() {
  const profileQuery = useCreatorProfile()
  const statsQuery = useCreatorStats()
  const submissionsQuery = useCreatorSubmissions()

  if (profileQuery.isLoading) {
    return (
      <div className="rounded-[1.15rem] border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
        Loading profile…
      </div>
    )
  }

  if (!profileQuery.data) {
    return (
      <div className="rounded-[1.15rem] border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
        Couldn&apos;t load your profile. Please try again.
      </div>
    )
  }

  const profile = apiCreatorProfileToViewData(
    profileQuery.data,
    statsQuery.data,
    submissionsQuery.data ?? []
  )

  return <CreatorProfileView profile={profile} />
}
