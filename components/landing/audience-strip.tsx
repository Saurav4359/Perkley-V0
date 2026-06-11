import { BriefcaseBusinessIcon, SparklesIcon } from "lucide-react"

import { FadeIn, Stagger, StaggerItem } from "@/components/landing/motion"
import { AudienceTag, MetricChip, SurfaceCard } from "@/components/landing/primitives"

const audiences = [
  {
    variant: "brand" as const,
    icon: BriefcaseBusinessIcon,
    title: "Built for growth teams",
    description:
      "Launch one campaign, unlock hundreds of creators, and pay for outcomes — not outreach.",
    points: ["Escrow-backed budgets", "Live performance tracking", "Less manual ops"],
  },
  {
    variant: "creator" as const,
    icon: SparklesIcon,
    title: "Built for ambitious creators",
    description:
      "Compete on content quality and results. Small audiences can win when performance leads.",
    points: ["Open participation", "Transparent rankings", "Fair reward pools"],
  },
]

export function AudienceStrip() {
  return (
    <section className="border-b border-border bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Stagger className="grid gap-6 md:grid-cols-2">
          {audiences.map((item) => (
            <StaggerItem key={item.variant}>
              <SurfaceCard variant="muted" className="h-full p-7">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <AudienceTag variant={item.variant}>
                    {item.variant === "brand" ? "Brands" : "Creators"}
                  </AudienceTag>
                  <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-background">
                    <item.icon className="size-4" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {item.description}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {item.points.map((point) => (
                    <li key={point}>
                      <MetricChip>{point}</MetricChip>
                    </li>
                  ))}
                </ul>
              </SurfaceCard>
            </StaggerItem>
          ))}
        </Stagger>

        <FadeIn className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            One marketplace. Two sides. Performance at the center.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
