import { Building2Icon, SparklesIcon } from "lucide-react"

import { FadeIn, Stagger, StaggerItem } from "@/components/landing/motion"
import {
  AudienceTag,
  SectionHeader,
  SurfaceCard,
} from "@/components/landing/primitives"

const brandProblems = [
  "Finding creators is time-consuming",
  "Negotiating individually is inefficient",
  "Performance is unpredictable",
]

const creatorProblems = [
  "Brand deals are difficult to access",
  "Small creators are often overlooked",
  "Opportunities are limited",
]

export function ProblemSection() {
  return (
    <section id="problem" className="scroll-mt-20 border-b border-border py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn className="mb-16">
          <SectionHeader
            label="The problem"
            title="Influencer marketing is broken on both sides."
            description="Brands waste time on manual outreach. Creators get locked out by follower counts and relationships."
          />
        </FadeIn>

        <Stagger className="grid gap-6 md:grid-cols-2">
          <StaggerItem>
            <SurfaceCard className="h-full p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <AudienceTag variant="brand">For brands</AudienceTag>
                  <h3 className="text-xl font-semibold tracking-tight">
                    Outreach doesn&apos;t scale
                  </h3>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted/40">
                  <Building2Icon className="size-4" />
                </div>
              </div>
              <p className="mb-6 text-sm leading-7 text-muted-foreground">
                Manual creator discovery, DMs, contracts, and tracking slow
                teams down when outcomes matter most.
              </p>
              <ul className="flex flex-col gap-2">
                {brandProblems.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
                  >
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          </StaggerItem>

          <StaggerItem>
            <SurfaceCard className="h-full p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <AudienceTag variant="creator">For creators</AudienceTag>
                  <h3 className="text-xl font-semibold tracking-tight">
                    Talent gets overlooked
                  </h3>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted/40">
                  <SparklesIcon className="size-4" />
                </div>
              </div>
              <p className="mb-6 text-sm leading-7 text-muted-foreground">
                Great content often loses to audience size. Small creators rarely
                get a fair shot at brand budgets.
              </p>
              <ul className="flex flex-col gap-2">
                {creatorProblems.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
                  >
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  )
}
