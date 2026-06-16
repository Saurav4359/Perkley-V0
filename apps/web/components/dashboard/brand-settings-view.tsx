"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { BadgeCheck, Clock, Mail, Upload } from "lucide-react"

import {
  SettingsPageShell,
  SettingsSection,
  SettingsToggleRow,
} from "@/components/dashboard/settings-section"
import { PaymentForm } from "@/components/onboarding/payment-form"
import { Button } from "@/components/ui/button"
import {
  getBrandNotificationSettings,
  saveBrandNotificationSettings,
  type BrandNotificationSettings,
} from "@/lib/dashboard/account-settings-storage"
import {
  buildBrandProfileFromStored,
  brandProfilePatchFromData,
  type BrandProfileData,
} from "@/lib/dashboard/brand-profile"
import {
  getBrandOnboardingState,
  notifyBrandOnboardingUpdated,
  saveBrandOnboardingState,
} from "@/lib/brand-onboarding/storage"
import { saveBrandPaymentToState } from "@/lib/brand-onboarding/state"
import {
  getBrandProfileState,
  patchBrandProfileState,
} from "@/lib/dashboard/brand-profile-storage"
import type { PaymentDetails } from "@/lib/onboarding/types"
import { cn } from "@/lib/utils"

export function BrandSettingsView() {
  const [profile, setProfile] = useState<BrandProfileData>(() =>
    buildBrandProfileFromStored(getBrandProfileState(), { isOwnProfile: true })
  )
  const [payment, setPayment] = useState<PaymentDetails | null>(null)
  const [notifications, setNotifications] = useState<BrandNotificationSettings>(
    getBrandNotificationSettings
  )

  function syncFromStorage() {
    const stored = getBrandProfileState()
    setProfile(buildBrandProfileFromStored(stored, { isOwnProfile: true }))
    setPayment(getBrandOnboardingState().payment)
  }

  useEffect(() => {
    syncFromStorage()

    function handleUpdate() {
      syncFromStorage()
    }

    window.addEventListener("perkley-brand-profile-updated", handleUpdate)
    window.addEventListener("perkley-brand-onboarding-updated", handleUpdate)

    return () => {
      window.removeEventListener("perkley-brand-profile-updated", handleUpdate)
      window.removeEventListener("perkley-brand-onboarding-updated", handleUpdate)
    }
  }, [])

  function handleVisibilityChange(visibility: BrandProfileData["visibility"]) {
    const stored = patchBrandProfileState(brandProfilePatchFromData({ visibility }))
    setProfile(buildBrandProfileFromStored(stored, { isOwnProfile: true }))
  }

  function savePayment(next: PaymentDetails) {
    const onboardingState = saveBrandPaymentToState(getBrandOnboardingState(), next)
    saveBrandOnboardingState(onboardingState)
    notifyBrandOnboardingUpdated()
    setPayment(next)
  }

  function updateNotification<K extends keyof BrandNotificationSettings>(
    key: K,
    value: BrandNotificationSettings[K]
  ) {
    const next = { ...notifications, [key]: value }
    setNotifications(next)
    saveBrandNotificationSettings(next)
  }

  return (
    <SettingsPageShell
      title="Settings"
      description="Manage your account, billing, verification, visibility, and notification preferences."
    >
      <SettingsSection
        title="Account"
        description="Work email from signup — used for account access, not shown on your public profile"
      >
        {profile.workEmail ? (
          <p className="inline-flex items-center gap-2 text-sm text-foreground">
            <Mail className="size-4 text-muted-foreground" />
            {profile.workEmail}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No work email on file.</p>
        )}
        <Button variant="outline" size="sm" className="mt-4 rounded-full">
          Change password
        </Button>
      </SettingsSection>

      <SettingsSection
        title="Billing details"
        description="Payment method used to fund bounties and campaigns when creators complete your briefs"
      >
        <PaymentForm
          embedded
          initial={payment}
          submitLabel="Save billing details"
          title="Billing details"
          description="We use this when you launch paid bounties or campaigns."
          onSubmit={savePayment}
        />
      </SettingsSection>

      <SettingsSection
        title="Business verification"
        description="Verify with GST number or registered entity documents to earn the verified badge on your profile"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
              profile.verificationStatus === "verified"
                ? "bg-sky-500/10 text-sky-700 dark:text-sky-400"
                : profile.verificationStatus === "pending"
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {profile.verificationStatus === "verified" ? (
              <BadgeCheck className="size-3.5" />
            ) : profile.verificationStatus === "pending" ? (
              <Clock className="size-3.5" />
            ) : null}
            {profile.verificationStatus === "verified"
              ? "Verified"
              : profile.verificationStatus === "pending"
                ? "Verification pending"
                : "Not verified"}
          </span>
          {profile.verificationStatus !== "verified" ? (
            <Button size="sm" className="gap-1.5 rounded-full">
              <Upload className="size-3.5" />
              Upload documents
            </Button>
          ) : null}
        </div>
        {profile.verificationStatus !== "verified" ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 rounded-full"
            render={<Link href="/brand-onboarding?step=2" />}
          >
            Complete verification steps
          </Button>
        ) : null}
      </SettingsSection>

      <SettingsSection
        title="Profile visibility"
        description="Unlisted profiles are hidden from discovery but campaigns can still be accessed via direct link"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleVisibilityChange("public")}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              profile.visibility === "public"
                ? "border-brand bg-brand-muted text-brand"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            Public
          </button>
          <button
            type="button"
            onClick={() => handleVisibilityChange("unlisted")}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              profile.visibility === "unlisted"
                ? "border-brand bg-brand-muted text-brand"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            Unlisted
          </button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Notifications"
        description="Choose which updates we send to your work email"
      >
        <SettingsToggleRow
          label="New creator submissions"
          hint="When creators submit entries to your bounties or campaigns"
          enabled={notifications.newSubmissions}
          onToggle={() =>
            updateNotification("newSubmissions", !notifications.newSubmissions)
          }
        />
        <SettingsToggleRow
          label="Review reminders"
          hint="Pending reviews and campaign deadlines approaching"
          enabled={notifications.reviewReminders}
          onToggle={() =>
            updateNotification("reviewReminders", !notifications.reviewReminders)
          }
        />
        <SettingsToggleRow
          label="Payout confirmations"
          hint="When winner payouts and campaign settlements are processed"
          enabled={notifications.payoutConfirmations}
          onToggle={() =>
            updateNotification("payoutConfirmations", !notifications.payoutConfirmations)
          }
        />
      </SettingsSection>
    </SettingsPageShell>
  )
}
