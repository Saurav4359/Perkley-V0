import { FadeIn, Stagger, StaggerItem } from "@/components/landing/motion"
import { SectionHeader, SurfaceCard } from "@/components/landing/primitives"

const steps = [
  {
    step: "01",
    title: "Brand creates campaign",
    description: "Set the objective, audience, and timeline in minutes.",
  },
  {
    step: "02",
    title: "Defines reward pool and rules",
    description: "Lock budget in escrow with clear performance criteria.",
  },
  {
    step: "03",
    title: "Creators participate",
    description: "Eligible creators join, create content, and compete openly.",
  },
  {
    step: "04",
    title: "Top performers earn rewards",
    description: "Winners are ranked automatically and paid when the campaign ends.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b border-border py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn className="mb-16">
          <SectionHeader
            label="How it works"
            title="From campaign launch to payout — in four steps."
            description="A simple flow that works for brands launching bounties and creators competing for them."
          />
        </FadeIn>

        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <StaggerItem key={item.step}>
              <SurfaceCard className="flex h-full flex-col gap-4 p-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand">
                  Step {item.step}
                </span>
                <h3 className="text-base font-semibold tracking-tight">{item.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">
                  {item.description}
                </p>
              </SurfaceCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
