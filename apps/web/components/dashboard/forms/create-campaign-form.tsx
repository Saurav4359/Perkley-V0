"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import {
  FormField,
  SelectInput,
  inputClassName,
  textareaClassName,
} from "@/components/dashboard/forms/form-field"
import { buttonVariants } from "@/components/ui/button"
import { CONTENT_TYPES, NICHES } from "@/lib/dashboard/types"
import { calcCampaignBudget, formatInr } from "@/lib/dashboard/utils"
import { cn } from "@/lib/utils"

export function CreateCampaignForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [niche, setNiche] = useState("tech")
  const [contentType, setContentType] = useState("reel")
  const [minFollowers, setMinFollowers] = useState("3000")
  const [hashtag, setHashtag] = useState("")
  const [mention, setMention] = useState("")
  const [minViews, setMinViews] = useState("10000")
  const [fixedReward, setFixedReward] = useState("5000")
  const [maxCreators, setMaxCreators] = useState("20")
  const [deadline, setDeadline] = useState("")
  const [paid, setPaid] = useState(false)

  const totalBudget = useMemo(
    () => calcCampaignBudget(Number(fixedReward) || 0, Number(maxCreators) || 0),
    [fixedReward, maxCreators]
  )

  function handlePay(event: React.FormEvent) {
    event.preventDefault()
    setPaid(true)
  }

  if (paid) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
        <p className="text-lg font-semibold text-foreground">Campaign published</p>
        <p className="text-sm text-muted-foreground">
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
    <form onSubmit={handlePay} className="space-y-8">
      <section className="grid gap-5 md:grid-cols-2">
        <FormField label="Title" className="md:col-span-2">
          <input className={inputClassName} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </FormField>
        <FormField label="Description" className="md:col-span-2">
          <textarea
            className={textareaClassName}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Niche">
          <SelectInput
            value={niche}
            onChange={setNiche}
            options={NICHES.filter((n) => n.id !== "all").map((n) => ({
              value: n.id,
              label: n.label,
            }))}
          />
        </FormField>
        <FormField label="Platform">
          <SelectInput value="instagram" onChange={() => {}} options={[{ value: "instagram", label: "Instagram" }]} />
        </FormField>
        <FormField label="Content type">
          <SelectInput
            value={contentType}
            onChange={setContentType}
            options={CONTENT_TYPES.map((t) => ({ value: t.id, label: t.label }))}
          />
        </FormField>
        <FormField label="Min followers required">
          <input
            className={inputClassName}
            type="number"
            value={minFollowers}
            onChange={(e) => setMinFollowers(e.target.value)}
            required
          />
        </FormField>
        <FormField label="Required hashtag">
          <input className={inputClassName} value={hashtag} onChange={(e) => setHashtag(e.target.value)} required />
        </FormField>
        <FormField label="Required mention">
          <input className={inputClassName} value={mention} onChange={(e) => setMention(e.target.value)} required />
        </FormField>
        <FormField label="Minimum views threshold" hint="Creator must hit this to qualify">
          <input className={inputClassName} type="number" value={minViews} onChange={(e) => setMinViews(e.target.value)} />
        </FormField>
        <FormField label="Fixed reward per creator (₹)">
          <input
            className={inputClassName}
            type="number"
            value={fixedReward}
            onChange={(e) => setFixedReward(e.target.value)}
          />
        </FormField>
        <FormField label="Max creators you will pay">
          <input
            className={inputClassName}
            type="number"
            value={maxCreators}
            onChange={(e) => setMaxCreators(e.target.value)}
          />
        </FormField>
        <FormField label="Deadline date">
          <input className={inputClassName} type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </FormField>
      </section>

      <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
        <span className="text-sm text-muted-foreground">Total budget (reward × max creators)</span>
        <span className="text-lg font-bold tabular-nums text-foreground">₹{formatInr(totalBudget)}</span>
      </div>

      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "inline-flex h-11 w-full rounded-lg bg-brand text-white hover:bg-brand/90 sm:w-auto sm:px-8"
        )}
      >
        Pay ₹{formatInr(totalBudget)} via Razorpay
        <ArrowUpRight className="size-4" />
      </button>
    </form>
  )
}
