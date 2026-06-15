"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Camera,
  Flame,
  ImageIcon,
  Users,
} from "lucide-react"

import {
  CharCounter,
  FormField,
  InputWithIcon,
  SelectInput,
  inputClassName,
  textareaClassName,
} from "@/components/dashboard/forms/form-field"
import { buttonVariants } from "@/components/ui/button"
import { CONTENT_TYPES, NICHES } from "@/lib/dashboard/types"
import { calcBountyBudget, formatInr } from "@/lib/dashboard/utils"
import { cn } from "@/lib/utils"

const TITLE_MAX = 80
const DESCRIPTION_MAX = 500

const FOLLOWER_OPTIONS = [
  { value: "1000", label: "1,000" },
  { value: "5000", label: "5,000" },
  { value: "10000", label: "10,000" },
  { value: "25000", label: "25,000" },
  { value: "50000", label: "50,000" },
]

const NICHE_ICONS: Record<string, React.ReactNode> = {
  fitness: <Flame className="size-4 text-orange-500" strokeWidth={2.25} />,
  tech: <Flame className="size-4 text-sky-500" strokeWidth={2.25} />,
  fashion: <Flame className="size-4 text-pink-500" strokeWidth={2.25} />,
  food: <Flame className="size-4 text-amber-500" strokeWidth={2.25} />,
  lifestyle: <Flame className="size-4 text-brand" strokeWidth={2.25} />,
}

export function CreateBountyForm() {
  const [step, setStep] = useState<1 | 2>(1)
  const [title, setTitle] = useState("Vitamin C launch reel sprint")
  const [description, setDescription] = useState("")
  const [niche, setNiche] = useState("lifestyle")
  const [contentType, setContentType] = useState("post")
  const [minFollowers, setMinFollowers] = useState("5000")
  const [hashtag, setHashtag] = useState("")
  const [mention, setMention] = useState("")
  const [deadline, setDeadline] = useState("")
  const [first, setFirst] = useState("25000")
  const [second, setSecond] = useState("15000")
  const [third, setThird] = useState("10000")
  const [top20, setTop20] = useState("2500")
  const [paid, setPaid] = useState(false)

  const totalBudget = useMemo(
    () =>
      calcBountyBudget({
        first: Number(first) || 0,
        second: Number(second) || 0,
        third: Number(third) || 0,
        top20Each: Number(top20) || 0,
      }),
    [first, second, third, top20]
  )

  function handlePay(event: React.FormEvent) {
    event.preventDefault()
    setPaid(true)
  }

  function handleContinue(event: React.FormEvent) {
    event.preventDefault()
    setStep(2)
  }

  if (paid) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
        <p className="text-lg font-semibold text-foreground">Bounty published</p>
        <p className="mt-2 text-sm text-muted-foreground">
          ₹{formatInr(totalBudget)} paid upfront via Razorpay (mock). Status: active.
        </p>
        <Link
          href="/dashboard/brand/campaigns"
          className={cn(buttonVariants(), "mt-6 inline-flex rounded-full bg-brand text-white hover:bg-brand/90")}
        >
          Back to campaigns
        </Link>
      </div>
    )
  }

  return (
    <form
      onSubmit={step === 1 ? handleContinue : handlePay}
      noValidate
      className="space-y-8"
    >
      {step === 1 ? (
        <>
          <section className="grid gap-5 md:grid-cols-2">
            <FormField label="Title" className="md:col-span-2">
              <div className="relative">
                <input
                  className={cn(inputClassName, "pr-16")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
                  placeholder="Vitamin C launch reel sprint"
                  maxLength={TITLE_MAX}
                />
                <CharCounter
                  current={title.length}
                  max={TITLE_MAX}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                />
              </div>
            </FormField>

            <FormField label="Description" className="md:col-span-2">
              <div className="relative">
                <textarea
                  className={cn(textareaClassName, "pb-8")}
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value.slice(0, DESCRIPTION_MAX))
                  }
                  placeholder="Describe what creators should make..."
                  maxLength={DESCRIPTION_MAX}
                />
                <CharCounter
                  current={description.length}
                  max={DESCRIPTION_MAX}
                  className="absolute bottom-3 right-3.5"
                />
              </div>
            </FormField>

            <FormField label="Niche">
              <SelectInput
                value={niche}
                onChange={setNiche}
                icon={NICHE_ICONS[niche]}
                options={NICHES.filter((n) => n.id !== "all").map((n) => ({
                  value: n.id,
                  label: n.label,
                }))}
              />
            </FormField>

            <FormField label="Platform">
              <SelectInput
                value="instagram"
                onChange={() => {}}
                icon={<Camera className="size-4" strokeWidth={2.25} />}
                options={[{ value: "instagram", label: "Instagram" }]}
              />
            </FormField>

            <FormField label="Content type">
              <SelectInput
                value={contentType}
                onChange={setContentType}
                icon={<ImageIcon className="size-4" strokeWidth={2.25} />}
                options={CONTENT_TYPES.map((t) => ({ value: t.id, label: t.label }))}
              />
            </FormField>

            <FormField label="Min followers required">
              <SelectInput
                value={minFollowers}
                onChange={setMinFollowers}
                icon={<Users className="size-4" strokeWidth={2.25} />}
                options={FOLLOWER_OPTIONS}
              />
            </FormField>

            <FormField label="Required hashtag">
              <input
                className={inputClassName}
                value={hashtag}
                onChange={(e) => setHashtag(e.target.value)}
                placeholder="#YourBrand"
              />
            </FormField>

            <FormField label="Required mention">
              <input
                className={inputClassName}
                value={mention}
                onChange={(e) => setMention(e.target.value)}
                placeholder="@yourbrand"
              />
            </FormField>

            <FormField label="Deadline date" className="md:col-span-2">
              <InputWithIcon
                type="date"
                icon={<Calendar className="size-4" strokeWidth={2.25} />}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </FormField>
          </section>

          <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-4 border-t border-border/60 bg-background/90 px-4 py-5 backdrop-blur-md sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-start gap-3 rounded-xl border border-brand/15 bg-brand-muted/40 px-4 py-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                !
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Top performers are selected by engagement score. Tiebreaker: views, then
                submission time.
              </p>
            </div>

            <button
              type="submit"
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brand/90"
              )}
            >
              Continue to prize pool
              <ArrowRight className="size-4" strokeWidth={2.5} />
            </button>
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to details
          </button>

          <section className="space-y-5 rounded-2xl border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Prize structure
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Top performers win from the pool. Tiebreaker: views, then submission time.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="1st place (₹)">
                <input
                  className={inputClassName}
                  type="number"
                  value={first}
                  onChange={(e) => setFirst(e.target.value)}
                />
              </FormField>
              <FormField label="2nd place (₹)">
                <input
                  className={inputClassName}
                  type="number"
                  value={second}
                  onChange={(e) => setSecond(e.target.value)}
                />
              </FormField>
              <FormField label="3rd place (₹)">
                <input
                  className={inputClassName}
                  type="number"
                  value={third}
                  onChange={(e) => setThird(e.target.value)}
                />
              </FormField>
              <FormField label="Top 20 — each (₹)" hint="Ranks 4–23">
                <input
                  className={inputClassName}
                  type="number"
                  value={top20}
                  onChange={(e) => setTop20(e.target.value)}
                />
              </FormField>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3.5">
              <span className="text-sm text-muted-foreground">Total budget (auto-calculated)</span>
              <span className="text-lg font-bold tabular-nums text-foreground">
                ₹{formatInr(totalBudget)}
              </span>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-brand/90"
              )}
            >
              Pay ₹{formatInr(totalBudget)} via Razorpay
              <ArrowRight className="size-4" strokeWidth={2.5} />
            </button>
          </div>
        </>
      )}
    </form>
  )
}
