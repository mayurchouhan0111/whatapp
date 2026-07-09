import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { SectionBadge } from "./section-badge"
import { HelpCircle } from "lucide-react"

const FAQS = [
  {
    q: "What is Vbuild CRM?",
    a: "Vbuild CRM is a WhatsApp-native CRM platform built on the official WhatsApp Business API. It gives you a shared inbox for team collaboration, pipeline deal tracking, broadcast campaigns, smart automations, and a WhatsApp Storefront — all from a single dashboard.",
  },
  {
    q: "How does Vbuild CRM help my business?",
    a: "Vbuild CRM centralizes all your WhatsApp sales and support conversations into one organized workspace. Your team can collaborate in real-time, track deals through a visual pipeline, send targeted broadcasts, and automate follow-ups — leading to faster responses, higher close rates, and more revenue from WhatsApp.",
  },
  {
    q: "Can I use my existing WhatsApp number?",
    a: "Yes. Vbuild CRM uses the official WhatsApp Business API, which requires a dedicated business phone number. You can use your existing business number if it's not already registered with WhatsApp Business. The setup process takes about 5 minutes.",
  },
  {
    q: "Do I need technical knowledge to use it?",
    a: "Not at all. Vbuild CRM is designed for non-technical teams. The interface is intuitive, the automations are no-code (visual flow builder), and the storefront sets up in minutes. We also provide comprehensive documentation and email support.",
  },
  {
    q: "Can I track multiple products or services?",
    a: "Absolutely. The pipeline system lets you create multiple pipelines for different products, services, or teams. Each pipeline can have custom stages, deal values, and assigned agents. The Storefront supports unlimited products with categories, search, and inventory tracking.",
  },
  {
    q: "Is my data safe with Vbuild CRM?",
    a: "Security is foundational to Vbuild CRM. Your data is self-hosted on your own Supabase instance — full data ownership. All tokens are AES-256-GCM encrypted, every database table has Row-Level Security, webhooks are HMAC-verified, and the platform includes rate limiting and CSP headers.",
  },
  {
    q: "Does Vbuild CRM offer a free trial?",
    a: "Yes. Start with the Free plan — includes 1 user, 500 contacts, and 500 conversations per month, plus access to the shared inbox and pipeline. Upgrade when you grow. All paid plans include a 14-day free trial with no credit card required.",
  },
]

export function FAQSection() {
  return (
    <section className="border-b border-border/40">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionBadge><HelpCircle className="h-3 w-3" /> FAQ</SectionBadge>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Here are some quick answers to help you understand how Vbuild CRM powers your WhatsApp sales.
          </p>
        </div>

        <div className="mt-12">
          <Accordion className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} className="border-border/30 py-1">
                <AccordionTrigger className="py-3.5 text-base font-medium text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
