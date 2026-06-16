"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { BadgeCheck, Clock, Mail } from "lucide-react"

import { InstagramIcon } from "@/components/auth/auth-social-icons"
import {
  SettingsPageShell,
  SettingsSection,
  SettingsToggleRow,
} from "@/components/dashboard/settings-section"
import { PaymentForm } from "@/components/onboarding/payment-form"
import { Button } from "@/components/ui/button"
import {
  getCreatorNotificationSettings,
  saveCreatorNotificationSettings,
  type CreatorNotificationSettings,
} from "@/lib/dashboard/account-settings-storage"
import type { PaymentDetails } from "@/lib/onboarding/types"
import { getOnboardingState, patchOnboardingState } from "@/lib/onboarding/storage"
import { cn } from "@/lib/utils"

export function CreatorSettingsView() {
  const [payment, setPayment] = useState<PaymentDetails | null>(null)
  const [instagramHandle, setInstagramHandle] = useState<string | null>(null)
  const [instagramFollowers, setInstagramFollowers] = useState<number | null>(null)
  const [instagramVerified, setInstagramVerified] = useState(false)
  const [notifications, setNotifications] = useState<CreatorNotificationSettings>(
    getCreatorNotificationSettings
  )

  useEffect(() => {
    const state = getOnboardingState()
    setPayment(state.payment)
    setInstagramHandle(state.instagram?.username ?? null)
    setInstagramFollowers(state.instagram?.followers ?? null)
    setInstagramVerified(
      Boolean(state.instagram?.isProfessionalAccount && state.creatorVerified)
    )
  }, [])

  function savePayment(next: PaymentDetails) {
    patchOnboardingState({ payment: next })
    setPayment(next)
  }

  function updateNotification<K extends keyof CreatorNotificationSettings>(
    key: K,
    value: CreatorNotificationSettings[K]
  ) {
    const next = { ...notifications, [key]: value }
    setNotifications(next)
    saveCreatorNotificationSettings(next)
  }

  return (
    <SettingsPageShell
      title="Settings"
      description="Manage your login, payout details, connected accounts, and notification preferences."
    >
      <SettingsSection
        title="Account"
        description="Login email used to access Perkley — not shown on your public profile"
      >
        <p className="inline-flex items-center gap-2 text-sm text-foreground">
          <Mail className="size-4 text-muted-foreground" />
          you@example.com
        </p>
        <Button variant="outline" size="sm" className="mt-4 rounded-full">
          Change password
        </Button>
      </SettingsSection>

      <SettingsSection
        title="Payout details"
        description="Where we send bounty and campaign earnings after your submission is approved"
      >
        <PaymentForm
          embedded
          initial={payment}
          submitLabel="Save payout details"
          onSubmit={savePayment}
        />
      </SettingsSection>

      <SettingsSection
        title="Connected accounts"
        description="Instagram is used to verify your creator profile and sync follower stats"
      >
        <div className="rounded-2xl border border-border bg-muted/20 p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-background">
              <InstagramIcon />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {instagramHandle ?? "Instagram not connected"}
              </p>
              <p className="text-sm text-muted-foreground">
                {instagramFollowers !== null
                  ? `${instagramFollowers.toLocaleString("en-IN")} followers`
                  : "Connect to participate in listings"}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                instagramVerified
                  ? "bg-sky-500/10 text-sky-700 dark:text-sky-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {instagramVerified ? (
                <BadgeCheck className="size-3.5" />
              ) : (
                <Clock className="size-3.5" />
              )}
              {instagramVerified ? "Verified" : "Not verified"}
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="mt-4 rounded-full" render={<Link href="/onboarding" />}>
          {instagramHandle ? "Manage Instagram connection" : "Connect Instagram"}
        </Button>
      </SettingsSection>

      <SettingsSection
        title="Notifications"
        description="Choose which updates we send to your account email"
      >
        <SettingsToggleRow
          label="Campaign & bounty updates"
          hint="New listings, deadline reminders, and campaign status changes"
          enabled={notifications.campaignUpdates}
          onToggle={() =>
            updateNotification("campaignUpdates", !notifications.campaignUpdates)
          }
        />
        <SettingsToggleRow
          label="Submission status"
          hint="When your entry is reviewed, qualified, or paid out"
          enabled={notifications.submissionStatus}
          onToggle={() =>
            updateNotification("submissionStatus", !notifications.submissionStatus)
          }
        />
        <SettingsToggleRow
          label="Payout & earnings alerts"
          hint="Payment confirmations and wallet balance updates"
          enabled={notifications.payoutAlerts}
          onToggle={() => updateNotification("payoutAlerts", !notifications.payoutAlerts)}
        />
      </SettingsSection>
    </SettingsPageShell>
  )
}
