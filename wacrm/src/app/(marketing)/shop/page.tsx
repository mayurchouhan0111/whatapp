import type { Metadata } from "next"
import { Header } from "@/components/marketing/header"
import { Footer } from "@/components/marketing/footer"
import { ShopHero } from "@/components/marketing/shop-hero"
import { ShopTrustBar } from "@/components/marketing/shop-trust-bar"
import { PremiumWorkflowSection } from "@/components/marketing/premium-workflow-section"
import { PremiumFeaturesSection } from "@/components/marketing/premium-features-section"
import { ShopShowcase } from "@/components/marketing/shop-showcase"
import { ShopStats } from "@/components/marketing/shop-stats"
import { ShopTestimonials } from "@/components/marketing/shop-testimonials"
import { ShopPricing } from "@/components/marketing/shop-pricing"
import { ShopCTA } from "@/components/marketing/shop-cta"

export const metadata: Metadata = {
  title: "WhatsApp Storefront — Sell Directly on WhatsApp | Vbuild CRM",
  description: "Launch a mobile-optimized storefront connected to your WhatsApp. Customers browse, cart, and order in under 30 seconds. No app download, no account creation.",
}

export default function ShopPage() {
  return (
    <>
      <Header />
      <main>
        <ShopHero />
        <ShopTrustBar />
        <PremiumWorkflowSection />
          <PremiumFeaturesSection />
        <ShopShowcase />
        <ShopStats />
        <ShopTestimonials />
        <ShopPricing />
        <ShopCTA />
      </main>
      <Footer />
    </>
  )
}
