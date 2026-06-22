import { FaqAccordion } from "@/components/landing/faq-accordion"
import { FadeIn } from "@/components/landing/motion"
import { SectionHeader } from "@/components/landing/primitives"

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 py-24 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <FadeIn className="mb-12">
          <SectionHeader
            label="FAQ"
            title="Questions, answered."
            description="Quick answers for brands and creators."
          />
        </FadeIn>

        <FadeIn delay={0.08}>
          <FaqAccordion />
        </FadeIn>
      </div>
    </section>
  )
}
