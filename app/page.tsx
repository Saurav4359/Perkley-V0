import { AudienceStrip } from "@/components/landing/audience-strip"
import { SiteFooter } from "@/components/landing/footer"
import { FaqSection } from "@/components/landing/faq"
import { HeroSection } from "@/components/landing/hero"
import { HowItWorksSection } from "@/components/landing/how-it-works"
import { SiteHeader } from "@/components/landing/header"
import { ProblemSection } from "@/components/landing/problem"
import { WhyPerkleySection } from "@/components/landing/why-perkley"
import { WaitlistSection } from "@/components/waitlist-form"

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <WaitlistSection />
        <AudienceStrip />
        <ProblemSection />
        <HowItWorksSection />
        <WhyPerkleySection />
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  )
}
