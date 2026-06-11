"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2Icon, Loader2Icon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FadeIn } from "@/components/landing/motion"
import { SectionLabel, SurfaceCard } from "@/components/landing/primitives"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  type WaitlistRole,
  brandWaitlistSchema,
  creatorWaitlistSchema,
} from "@/lib/validations/waitlist"
import {
  WAITLIST_OPEN_EVENT,
  parseWaitlistRole,
  scrollToWaitlist,
  focusWaitlistForm,
} from "@/lib/waitlist-navigation"
import { cn } from "@/lib/utils"

type FormStatus = "idle" | "loading" | "success" | "error"

const brandFormSchema = brandWaitlistSchema.omit({ role: true })
const creatorFormSchema = creatorWaitlistSchema.omit({ role: true })

type BrandFormValues = z.infer<typeof brandFormSchema>
type CreatorFormValues = z.infer<typeof creatorFormSchema>

const followerOptions = [
  "Under 5k",
  "5k – 25k",
  "25k – 100k",
  "100k – 500k",
  "500k+",
]

function getInitialRole(): WaitlistRole {
  if (typeof window === "undefined") return "brand"

  return parseWaitlistRole(window.location.search, window.location.hash) ?? "brand"
}

export function WaitlistSection() {
  const [role, setRole] = useState<WaitlistRole>("brand")
  const [status, setStatus] = useState<FormStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const brandForm = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
    },
  })

  const creatorForm = useForm<CreatorFormValues>({
    resolver: zodResolver(creatorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      instagram: "",
      niche: "",
      followers: "",
    },
  })

  useEffect(() => {
    const syncFromUrl = () => {
      const parsedRole = parseWaitlistRole(
        window.location.search,
        window.location.hash
      )
      if (parsedRole) setRole(parsedRole)

      if (window.location.hash.startsWith("#waitlist")) {
        scrollToWaitlist()
      }
    }

    const handleOpen = (event: Event) => {
      const custom = event as CustomEvent<{ role: WaitlistRole | null }>
      if (custom.detail?.role) {
        setRole(custom.detail.role)
        setStatus("idle")
        setErrorMessage(null)
      }
      focusWaitlistForm()
    }

    syncFromUrl()
    window.addEventListener(WAITLIST_OPEN_EVENT, handleOpen)
    window.addEventListener("hashchange", syncFromUrl)
    window.addEventListener("popstate", syncFromUrl)

    return () => {
      window.removeEventListener(WAITLIST_OPEN_EVENT, handleOpen)
      window.removeEventListener("hashchange", syncFromUrl)
      window.removeEventListener("popstate", syncFromUrl)
    }
  }, [])

  async function submit(values: BrandFormValues | CreatorFormValues) {
    setStatus("loading")
    setErrorMessage(null)

    const payload =
      role === "brand"
        ? { role: "brand" as const, ...(values as BrandFormValues) }
        : { role: "creator" as const, ...(values as CreatorFormValues) }

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to join the waitlist")
      }

      setStatus("success")
      toast.success("You're on the waitlist!")
      if (role === "brand") brandForm.reset()
      else creatorForm.reset()
    } catch (error) {
      setStatus("error")
      const message =
        error instanceof Error ? error.message : "Something went wrong"
      setErrorMessage(message)
      toast.error(message)
    }
  }

  return (
    <section
      id="waitlist"
      className="relative scroll-mt-20 overflow-hidden border-y border-border bg-[#0a0a0a] py-20 text-background sm:py-24"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,rgba(254,108,55,0.14),transparent_72%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn className="mb-12 max-w-2xl">
          <SectionLabel className="text-brand-subtle">Waitlist</SectionLabel>
          <h2 className="font-display text-3xl tracking-tight text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
            Get early access.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
            Separate waitlists for brands and creators. Tell us who you are and
            we&apos;ll reach out when the next cohort opens.
          </p>
        </FadeIn>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <FadeIn delay={0.06}>
            <SurfaceCard
              variant="inverse"
              className="flex h-full flex-col gap-6 border-white/10 p-6 sm:p-7"
            >
              <div className="flex flex-col gap-3">
                <p
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.18em]",
                    role === "creator" ? "text-brand-subtle" : "text-white/50"
                  )}
                >
                  {role === "brand" ? "For brands" : "For creators"}
                </p>
                <h3 className="text-2xl font-semibold tracking-tight">
                  {role === "brand"
                    ? "Launch campaigns without the manual grind."
                    : "Compete on performance, not connections."}
                </h3>
                <p className="text-sm leading-relaxed text-white/70">
                  {role === "brand"
                    ? "Be first to launch bounty-style campaigns with escrow, live leaderboards, and outcome-based payouts."
                    : "Get early access to open campaigns where great content can beat big audiences."}
                </p>
              </div>

              <ul className="flex flex-col gap-2">
                {(role === "brand"
                  ? [
                      "Priority access to the brand dashboard",
                      "Founding brand pricing at launch",
                      "Campaign setup support",
                    ]
                  : [
                      "Early campaign invites by niche",
                      "No minimum follower requirement",
                      "Transparent leaderboard rewards",
                    ]
                ).map((item) => (
                  <li
                    key={item}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="overflow-hidden border-border bg-card text-foreground shadow-[0_24px_64px_rgba(0,0,0,0.12)]">
              <CardHeader className="gap-4 border-b border-border pb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Join the waitlist</CardTitle>
                    <CardDescription>
                      Choose your path and we&apos;ll save your spot.
                    </CardDescription>
                  </div>
                  <ToggleGroup
                    value={[role]}
                    onValueChange={(values) => {
                      const nextRole = values[0]
                      if (nextRole === "brand" || nextRole === "creator") {
                        setRole(nextRole)
                        setStatus("idle")
                        setErrorMessage(null)
                      }
                    }}
                    variant="outline"
                    className="w-full rounded-full border-border bg-muted/40 p-1 sm:w-auto"
                  >
                    <ToggleGroupItem
                      value="brand"
                      className="flex-1 rounded-full px-5 data-[state=on]:bg-foreground data-[state=on]:text-background"
                    >
                      Brand
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="creator"
                      className="flex-1 rounded-full px-5 data-[state=on]:border-brand data-[state=on]:bg-brand data-[state=on]:text-white"
                    >
                      Creator
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {status === "success" ? (
                  <div className="flex flex-col items-center gap-4 py-8 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                      <CheckCircle2Icon className="size-6" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-semibold">You&apos;re on the list</h3>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Thanks for joining. Check your inbox for a confirmation
                        email and early access updates.
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setStatus("idle")}>
                      Submit another response
                    </Button>
                  </div>
                ) : role === "brand" ? (
                  <form
                    onSubmit={brandForm.handleSubmit(submit)}
                    className="flex flex-col gap-6"
                  >
                    <FieldGroup>
                      <Field data-invalid={!!brandForm.formState.errors.name}>
                        <FieldLabel htmlFor="brand-name">Name</FieldLabel>
                        <Input
                          id="brand-name"
                          aria-invalid={!!brandForm.formState.errors.name}
                          {...brandForm.register("name")}
                        />
                        <FieldError errors={[brandForm.formState.errors.name]} />
                      </Field>

                      <Field data-invalid={!!brandForm.formState.errors.company}>
                        <FieldLabel htmlFor="brand-company">Company</FieldLabel>
                        <Input
                          id="brand-company"
                          aria-invalid={!!brandForm.formState.errors.company}
                          {...brandForm.register("company")}
                        />
                        <FieldError errors={[brandForm.formState.errors.company]} />
                      </Field>

                      <Field data-invalid={!!brandForm.formState.errors.email}>
                        <FieldLabel htmlFor="brand-email">Work Email</FieldLabel>
                        <Input
                          id="brand-email"
                          type="email"
                          autoComplete="email"
                          aria-invalid={!!brandForm.formState.errors.email}
                          {...brandForm.register("email")}
                        />
                        <FieldDescription>
                          Use your company email address.
                        </FieldDescription>
                        <FieldError errors={[brandForm.formState.errors.email]} />
                      </Field>
                    </FieldGroup>

                    {errorMessage && (
                      <p className="text-sm text-destructive">{errorMessage}</p>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2Icon className="animate-spin" data-icon="inline-start" />
                          Joining waitlist...
                        </>
                      ) : (
                        "Join as Brand"
                      )}
                    </Button>
                  </form>
                ) : (
                  <form
                    onSubmit={creatorForm.handleSubmit(submit)}
                    className="flex flex-col gap-6"
                  >
                    <FieldGroup>
                      <Field data-invalid={!!creatorForm.formState.errors.name}>
                        <FieldLabel htmlFor="creator-name">Name</FieldLabel>
                        <Input
                          id="creator-name"
                          aria-invalid={!!creatorForm.formState.errors.name}
                          {...creatorForm.register("name")}
                        />
                        <FieldError errors={[creatorForm.formState.errors.name]} />
                      </Field>

                      <Field data-invalid={!!creatorForm.formState.errors.email}>
                        <FieldLabel htmlFor="creator-email">Email</FieldLabel>
                        <Input
                          id="creator-email"
                          type="email"
                          autoComplete="email"
                          aria-invalid={!!creatorForm.formState.errors.email}
                          {...creatorForm.register("email")}
                        />
                        <FieldError errors={[creatorForm.formState.errors.email]} />
                      </Field>

                      <Field data-invalid={!!creatorForm.formState.errors.instagram}>
                        <FieldLabel htmlFor="creator-instagram">
                          Instagram Handle
                        </FieldLabel>
                        <Input
                          id="creator-instagram"
                          placeholder="@username"
                          aria-invalid={!!creatorForm.formState.errors.instagram}
                          {...creatorForm.register("instagram")}
                        />
                        <FieldError
                          errors={[creatorForm.formState.errors.instagram]}
                        />
                      </Field>

                      <Field data-invalid={!!creatorForm.formState.errors.niche}>
                        <FieldLabel htmlFor="creator-niche">Niche</FieldLabel>
                        <Input
                          id="creator-niche"
                          placeholder="Fitness, beauty, tech..."
                          aria-invalid={!!creatorForm.formState.errors.niche}
                          {...creatorForm.register("niche")}
                        />
                        <FieldError errors={[creatorForm.formState.errors.niche]} />
                      </Field>

                      <Field data-invalid={!!creatorForm.formState.errors.followers}>
                        <FieldLabel htmlFor="creator-followers">Followers</FieldLabel>
                        <Select
                          value={creatorForm.watch("followers")}
                          onValueChange={(value) =>
                            creatorForm.setValue("followers", value ?? "", {
                              shouldValidate: true,
                            })
                          }
                        >
                          <SelectTrigger id="creator-followers" className="w-full">
                            <SelectValue placeholder="Select follower range" />
                          </SelectTrigger>
                          <SelectContent>
                            {followerOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldError
                          errors={[creatorForm.formState.errors.followers]}
                        />
                      </Field>
                    </FieldGroup>

                    {errorMessage && (
                      <p className="text-sm text-destructive">{errorMessage}</p>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full rounded-full bg-brand text-white hover:bg-brand/90"
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2Icon className="animate-spin" data-icon="inline-start" />
                          Joining waitlist...
                        </>
                      ) : (
                        "Join as Creator"
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
