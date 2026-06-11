import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FadeIn } from "@/components/landing/motion"
import { SectionHeader, SurfaceCard } from "@/components/landing/primitives"

const faqs = [
  {
    question: "Do I need a minimum follower count?",
    answer: "No.",
  },
  {
    question: "When are you launching?",
    answer: "Coming soon.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 py-24 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <FadeIn className="mb-12">
          <SectionHeader
            label="FAQ"
            title="Questions, answered."
            description="Quick answers for brands and creators joining the waitlist."
          />
        </FadeIn>

        <FadeIn delay={0.08}>
          <SurfaceCard className="overflow-hidden px-1">
            <Accordion className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="px-5 text-left text-base hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-5 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </SurfaceCard>
        </FadeIn>
      </div>
    </section>
  )
}
