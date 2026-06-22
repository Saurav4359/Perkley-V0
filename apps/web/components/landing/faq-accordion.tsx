"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { SurfaceCard } from "@/components/landing/primitives"

const faqs = [
  {
    question: "Do I need a minimum follower count?",
    answer: "No.",
  },
  {
    question: "When are you launching?",
    answer: "Coming soon.",
  },
] as const

export function FaqAccordion() {
  return (
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
  )
}
