import type { Metadata } from "next"
import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import { ReviewsHero } from "@/components/marketing/reviews-hero"
import { ReviewsTrustBar } from "@/components/marketing/reviews-trust-bar"
import { PremiumWorkflowSection } from "@/components/marketing/premium-workflow-section"
import { PremiumFeaturesSection } from "@/components/marketing/premium-features-section"
import { ReviewsHowItWorks } from "@/components/marketing/reviews-how-it-works"
import { ReviewsFeatures } from "@/components/marketing/reviews-features"
import { ReviewsShowcase } from "@/components/marketing/reviews-showcase"
import { ReviewsStats } from "@/components/marketing/reviews-stats"
import { ReviewsTestimonials } from "@/components/marketing/reviews-testimonials"
import { ReviewsPricing } from "@/components/marketing/reviews-pricing"
import { ReviewsCTA } from "@/components/marketing/reviews-cta"

export const metadata: Metadata = {
  title: "Google Review Collection — Automate Reviews | Vbuild CRM",
  description: "Collect Google Reviews automatically with QR posters and WhatsApp notifications. Get notified instantly when customers leave reviews. No app download required.",
}

export default function ReviewsPage() {
  return (
    <>
      <Header />
      <main>
        <ReviewsHero />
        <ReviewsTrustBar />
        <PremiumWorkflowSection />
        <PremiumFeaturesSection />
        <ReviewsHowItWorks />
        <ReviewsFeatures />
        <ReviewsShowcase />
        <ReviewsStats />
        <ReviewsTestimonials />
        <ReviewsPricing />
        <ReviewsCTA />
      </main>
      <Footer />
    </>
  )
}
