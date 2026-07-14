import { Header } from "@/components/marketing/header"
import { HeroSection } from "@/components/marketing/hero-section"
import { TrustBar } from "@/components/marketing/trust-bar"
import { ChannelSection } from "@/components/marketing/channel-section"
import { AISection } from "@/components/marketing/ai-section"

import { ReputationSection } from "@/components/marketing/reputation-section"
import { MarketingSection } from "@/components/marketing/marketing-section"
import { SalesSection } from "@/components/marketing/sales-section"
import { SupportSection } from "@/components/marketing/support-section"

import { StatsSection } from "@/components/marketing/stats-section"
import { TestimonialsSection } from "@/components/marketing/testimonials-section"
import { PricingSection } from "@/components/marketing/pricing-section"
import { CTASection } from "@/components/marketing/cta-section"
import { Footer } from "@/components/marketing/footer"

export default function LandingPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <HeroSection />
        <TrustBar />
        <ChannelSection />

        <AISection />
        <ReputationSection />
        <MarketingSection />
        <SalesSection />
        <SupportSection />

        <StatsSection />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
