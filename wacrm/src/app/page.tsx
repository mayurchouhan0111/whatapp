import { Header } from "@/components/marketing/header"
import { HeroSection } from "@/components/marketing/hero-section"
import { StatsSection } from "@/components/marketing/stats-section"
import { FeaturesSection } from "@/components/marketing/features-section"
import { WhySection } from "@/components/marketing/why-section"
import { PricingSection } from "@/components/marketing/pricing-section"
import { CTASection } from "@/components/marketing/cta-section"
import { Footer } from "@/components/marketing/footer"

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <WhySection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
