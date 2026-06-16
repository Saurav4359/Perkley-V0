"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { CheckIcon, XIcon } from "lucide-react"

import { InstagramIcon } from "@/components/auth/auth-social-icons"
import {
  FormField,
  inputClassName,
} from "@/components/dashboard/forms/form-field"
import { getCreatorLocation } from "@/lib/onboarding/instagram-location"
import { ContentTypeSelector } from "@/components/onboarding/content-type-selector"
import { NicheSelector } from "@/components/onboarding/niche-selector"
import { PaymentForm } from "@/components/onboarding/payment-form"
import { Button } from "@/components/ui/button"
import type { PaymentDetails } from "@/lib/onboarding/types"
import { getOnboardingState, patchOnboardingState } from "@/lib/onboarding/storage"
import { cn } from "@/lib/utils"

type EditSection = "about" | "creator" | "payout" | "instagram"

type EditCreatorProfileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

const SECTIONS: { id: EditSection; label: string }[] = [
  { id: "about", label: "About" },
  { id: "creator", label: "Niches & content" },
  { id: "payout", label: "Payout" },
  { id: "instagram", label: "Instagram" },
]

export function EditCreatorProfileDialog({
  open,
  onOpenChange,
  onSaved,
}: EditCreatorProfileDialogProps) {
  const [section, setSection] = useState<EditSection>("about")
  const [displayName, setDisplayName] = useState("Saurav Sharma")
  const [instagramLocation, setInstagramLocation] = useState("Synced from Instagram")
  const [niches, setNiches] = useState<string[]>([])
  const [contentTypes, setContentTypes] = useState<string[]>([])
  const [payment, setPayment] = useState<PaymentDetails | null>(null)
  const [instagramHandle, setInstagramHandle] = useState("@saurav")
  const [instagramFollowers, setInstagramFollowers] = useState<number | null>(null)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [savedSection, setSavedSection] = useState<EditSection | null>(null)

  useEffect(() => {
    if (!open) return

    const state = getOnboardingState()
    setSection("about")
    setDisplayName(state.displayName)
    setInstagramLocation(getCreatorLocation(state.instagram))
    setNiches(state.niches)
    setContentTypes(state.contentTypes)
    setPayment(state.payment)
    setInstagramHandle(state.instagram?.username ?? "@saurav")
    setInstagramFollowers(state.instagram?.followers ?? null)
    setSavedMessage(null)
    setSavedSection(null)
  }, [open])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  if (!open) return null

  function close() {
    onOpenChange(false)
  }

  function showSaved(section: EditSection, message = "Changes saved") {
    setSavedSection(section)
    setSavedMessage(message)
    onSaved()
    window.setTimeout(() => {
      setSavedMessage(null)
      setSavedSection(null)
    }, 2000)
  }

  function saveAbout() {
    if (!displayName.trim()) return
    patchOnboardingState({
      displayName: displayName.trim(),
    })
    showSaved("about")
  }

  function saveCreatorProfile() {
    patchOnboardingState({ niches, contentTypes })
    showSaved("creator")
  }

  function savePayment(next: PaymentDetails) {
    patchOnboardingState({ payment: next })
    setPayment(next)
    showSaved("payout", "Payout details saved")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close edit profile"
        className="absolute inset-0 bg-black/40"
        onClick={close}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-border bg-background shadow-xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <div>
            <h2 id="edit-profile-title" className="text-lg font-semibold text-foreground">
              Edit profile
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Update how brands see you on Perkley.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <nav className="flex gap-1 overflow-x-auto border-b border-border px-4 py-3 sm:w-48 sm:shrink-0 sm:flex-col sm:border-b-0 sm:border-r sm:px-3 sm:py-4">
            {SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                  section === item.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            {section === "about" ? (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-medium text-foreground">About you</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your public name on Perkley. Location comes from Instagram automatically.
                  </p>
                </div>
                <FormField label="Display name">
                  <input
                    className={inputClassName}
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Saurav Sharma"
                  />
                </FormField>
                <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">Location</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{instagramLocation}</p>
                </div>
                <SaveButtonRow
                  label="Save changes"
                  onClick={saveAbout}
                  toastMessage={savedSection === "about" ? savedMessage : null}
                />
              </div>
            ) : null}

            {section === "creator" ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-foreground">Niches</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pick the categories you create content for.
                  </p>
                </div>
                <NicheSelector selected={niches} onChange={setNiches} />
                <div>
                  <h3 className="text-sm font-medium text-foreground">Content types</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    What formats do you usually post?
                  </p>
                </div>
                <ContentTypeSelector selected={contentTypes} onChange={setContentTypes} />
                <SaveButtonRow
                  label="Save changes"
                  onClick={saveCreatorProfile}
                  toastMessage={savedSection === "creator" ? savedMessage : null}
                />
              </div>
            ) : null}

            {section === "payout" ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground">Payout details</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Where we send bounty and campaign earnings after approval.
                  </p>
                </div>
                <PaymentForm
                  embedded
                  initial={payment}
                  submitLabel="Save payout details"
                  onSubmit={savePayment}
                  notice={
                    <SaveToast message={savedSection === "payout" ? savedMessage : null} />
                  }
                />
              </div>
            ) : null}

            {section === "instagram" ? (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-medium text-foreground">Instagram account</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Perkley verifies creators through Instagram. Follower count and account type
                    sync from your connected profile.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-background">
                      <InstagramIcon />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{instagramHandle}</p>
                      <p className="text-sm text-muted-foreground">
                        {instagramFollowers !== null
                          ? `${instagramFollowers.toLocaleString("en-IN")} followers`
                          : "Not connected yet"}
                      </p>
                    </div>
                  </div>
                </div>

                <Button variant="outline" render={<Link href="/onboarding" />}>
                  Reconnect Instagram
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function SaveButtonRow({
  label,
  onClick,
  toastMessage,
}: {
  label: string
  onClick: () => void
  toastMessage: string | null
}) {
  return (
    <div className="relative inline-flex items-center">
      <Button type="button" onClick={onClick}>
        {label}
      </Button>
      <SaveToast message={toastMessage} />
    </div>
  )
}

function SaveToast({ message }: { message: string | null }) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-10 -translate-y-1/2 whitespace-nowrap",
        "transition-all duration-300 ease-out",
        message ? "translate-x-0 opacity-100" : "translate-x-1 opacity-0"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border border-brand/20 bg-brand-muted pl-2 pr-3 py-1.5",
          "text-sm font-medium text-accent-foreground shadow-sm shadow-brand/10",
          !message && "invisible"
        )}
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
          <CheckIcon className="size-3" strokeWidth={2.5} />
        </span>
        <span>{message ?? "Changes saved"}</span>
      </div>
    </div>
  )
}
