import { AudienceStrip } from "@/components/landing/audience-strip"
import { FaqSection } from "@/components/landing/faq"
import { HeroSection } from "@/components/landing/hero"
import { HeroShowcaseSection } from "@/components/landing/hero-showcase"
import { HowItWorksSection } from "@/components/landing/how-it-works"
import { SiteHeader } from "@/components/landing/header"
import { ProblemSection } from "@/components/landing/problem"
import { WhyPerkleySection } from "@/components/landing/why-perkley"

export function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="dark:border-b dark:border-white/10">
        <HeroSection />
        <HeroShowcaseSection />
        <AudienceStrip />
        <ProblemSection />
        <HowItWorksSection />
        <WhyPerkleySection />
        <FaqSection />
      </main>
    </>
  )
}
