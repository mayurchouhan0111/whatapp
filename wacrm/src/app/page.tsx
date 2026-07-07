import { Header } from "@/components/marketing/header"
import { HeroSection } from "@/components/marketing/hero-section"
import { TrustBar } from "@/components/marketing/trust-bar"
import { FeaturesSection } from "@/components/marketing/features-section"
import { ProductShowcase } from "@/components/marketing/product-showcase"
import { StatsSection } from "@/components/marketing/stats-section"
import { TestimonialsSection } from "@/components/marketing/testimonials-section"
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
        <TrustBar />
        <FeaturesSection />
        <ProductShowcase />
        <StatsSection />
        <TestimonialsSection />
        <WhySection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
