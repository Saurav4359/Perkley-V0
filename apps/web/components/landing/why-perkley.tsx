import { CheckIcon, XIcon } from "lucide-react"

import { FadeIn, Stagger, StaggerItem } from "@/components/landing/motion"
import { SectionHeader, SurfaceCard } from "@/components/landing/primitives"

const traditional = [
  "Brands choose creators",
  "Follower count matters",
  "Manual management",
]

const perkley = [
  "Performance-driven",
  "Open participation",
  "Transparent rewards",
]

export function WhyPerkleySection() {
  return (
    <section id="why-perkley" className="scroll-mt-20 border-b border-border py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn className="mb-16">
          <SectionHeader
            label="Why Perkley"
            title="Outcomes over outreach."
            description="Replace one-off creator deals with a marketplace where performance decides who wins."
          />
        </FadeIn>

        <Stagger className="grid gap-6 lg:grid-cols-2">
          <StaggerItem>
            <SurfaceCard variant="muted" className="flex h-full flex-col gap-6 p-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Traditional
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">
                  Relationship-first, slow to scale
                </h3>
              </div>
              <ul className="flex flex-col gap-2">
                {traditional.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border">
                      <XIcon className="size-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          </StaggerItem>

          <StaggerItem>
            <SurfaceCard variant="inverse" className="flex h-full flex-col gap-6 p-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand-subtle">
                  Perkley
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">
                  Performance-first, built to scale
                </h3>
              </div>
              <ul className="flex flex-col gap-2">
                {perkley.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                      <CheckIcon className="size-3" />
                    </span>
                    {item}
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
