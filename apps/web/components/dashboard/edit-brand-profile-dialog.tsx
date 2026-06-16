"use client"

import { useEffect, useState } from "react"
import { XIcon } from "lucide-react"
import {
  FormField,
  inputClassName,
  SelectInput,
  textareaClassName,
} from "@/components/dashboard/forms/form-field"
import { Button } from "@/components/ui/button"
import type { BrandProfileData } from "@/lib/dashboard/brand-profile"
import { brandProfilePatchFromData } from "@/lib/dashboard/brand-profile"
import { brandInitialsFromName, patchBrandProfileState } from "@/lib/dashboard/brand-profile-storage"
import type { Niche } from "@/lib/dashboard/types"
import { NICHES } from "@/lib/dashboard/types"
import { cn } from "@/lib/utils"

type EditSection = "identity" | "links" | "media"

type EditBrandProfileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: BrandProfileData
  onSaved: (updates: Partial<BrandProfileData>) => void
}

const SECTIONS: { id: EditSection; label: string }[] = [
  { id: "identity", label: "Identity" },
  { id: "links", label: "Links" },
  { id: "media", label: "Logo" },
]

const NICHE_OPTIONS = NICHES.filter((n) => n.id !== "all").map((item) => ({
  value: item.id,
  label: item.label,
}))

const SECTION_COPY: Record<
  EditSection,
  { title: string; description: string }
> = {
  identity: {
    title: "Brand identity",
    description: "How creators see your brand on Perkley — name, category, and bio.",
  },
  links: {
    title: "Links & contact",
    description: "Website and social handles shown on your public profile.",
  },
  media: {
    title: "Brand logo",
    description: "Square logo displayed on your profile and campaigns.",
  },
}

export function EditBrandProfileDialog({
  open,
  onOpenChange,
  profile,
  onSaved,
}: EditBrandProfileDialogProps) {
  const [section, setSection] = useState<EditSection>("identity")
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio)
  const [industry, setIndustry] = useState<Niche>(profile.industry)
  const [location, setLocation] = useState(profile.location)
  const [website, setWebsite] = useState(profile.website ?? "")
  const [workEmail, setWorkEmail] = useState(profile.workEmail ?? "")
  const [instagram, setInstagram] = useState(profile.social.instagram ?? "")
  const [twitter, setTwitter] = useState(profile.social.twitter ?? "")

  useEffect(() => {
    if (!open) return
    setSection("identity")
    setName(profile.name)
    setBio(profile.bio)
    setIndustry(profile.industry)
    setLocation(profile.location)
    setWebsite(profile.website ?? "")
    setWorkEmail(profile.workEmail ?? "")
    setInstagram(profile.social.instagram ?? "")
    setTwitter(profile.social.twitter ?? "")
  }, [open, profile])

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

  function handleSave() {
    if (!name.trim()) return

    const updates: Partial<BrandProfileData> = {
      name: name.trim(),
      bio: bio.trim(),
      industry,
      location: location.trim(),
      website: website.trim() || undefined,
      workEmail: workEmail.trim() || undefined,
      social: {
        instagram: instagram.trim() || undefined,
        twitter: twitter.trim() || undefined,
      },
    }
    const stored = patchBrandProfileState(brandProfilePatchFromData(updates))
    onSaved({
      ...updates,
      initials: brandInitialsFromName(stored.name),
      accent: stored.accent,
    })
    close()
  }

  const sectionCopy = SECTION_COPY[section]

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
        aria-labelledby="edit-brand-profile-title"
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-border bg-background shadow-xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <div>
            <h2 id="edit-brand-profile-title" className="text-lg font-semibold text-foreground">
              Edit brand profile
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Update how creators see your brand on Perkley.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-4" strokeWidth={2} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          <nav
            className="flex gap-1 overflow-x-auto border-b border-border px-4 py-3 sm:w-44 sm:shrink-0 sm:flex-col sm:border-b-0 sm:border-r sm:px-3 sm:py-4"
          >
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

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <div className="mb-5">
              <h3 className="text-sm font-medium text-foreground">{sectionCopy.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{sectionCopy.description}</p>
            </div>

            {section === "identity" ? (
              <div className="space-y-5">
                <FormField label="Brand name">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Acme Inc."
                    className={inputClassName}
                  />
                </FormField>
                <FormField label="Industry">
                  <SelectInput
                    value={industry}
                    onChange={(value) => setIndustry(value as Niche)}
                    options={NICHE_OPTIONS}
                  />
                </FormField>
                <FormField label="Location (HQ)">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Mumbai, Maharashtra"
                    className={inputClassName}
                  />
                </FormField>
                <FormField label="Short bio" hint="Max 280 characters">
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell creators what your brand is about…"
                    maxLength={280}
                    className={cn(textareaClassName, "min-h-[120px] resize-none")}
                  />
                </FormField>
              </div>
            ) : null}

            {section === "links" ? (
              <div className="space-y-5">
                <FormField label="Work email" hint="Private — not shown on public profile">
                  <input
                    type="email"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    placeholder="hello@acme.com"
                    className={inputClassName}
                  />
                </FormField>
                <FormField label="Website">
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourbrand.com"
                    className={inputClassName}
                  />
                </FormField>
                <FormField label="Instagram">
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@yourhandle"
                    className={inputClassName}
                  />
                </FormField>
                <FormField label="X">
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="@yourhandle"
                    className={inputClassName}
                  />
                </FormField>
              </div>
            ) : null}

            {section === "media" ? (
              <div className="space-y-5">
                <FormField label="Logo">
                  <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/20 p-4">
                    <span
                      className="flex size-16 shrink-0 items-center justify-center rounded-xl text-lg font-semibold text-white"
                      style={{ backgroundColor: profile.accent }}
                    >
                      {profile.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">
                        Recommended size 400×400. Upload coming soon.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 rounded-full"
                        type="button"
                        disabled
                      >
                        Upload logo
                      </Button>
                    </div>
                  </div>
                </FormField>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
              <Button type="button" className="rounded-full" onClick={handleSave}>
                Save changes
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={close}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
