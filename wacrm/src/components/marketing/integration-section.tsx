import { SectionBadge } from "./section-badge"
import { Link2 } from "lucide-react"

const INTEGRATIONS = [
  "Shopify", "Razorpay", "Zoho", "Freshworks", "Zendesk",
  "Intercom", "HubSpot", "Salesforce", "Slack", "Google Sheets",
  "Mailchimp", "Stripe", "Twilio", "Segment", "Typeform",
  "Shopify", "Razorpay", "Zoho", "Freshworks", "Zendesk",
  "Intercom", "HubSpot", "Salesforce", "Slack", "Google Sheets",
  "Mailchimp", "Stripe", "Twilio", "Segment", "Typeform",
]

export function IntegrationSection() {
  return (
    <section className="border-b border-gray-100 bg-gray-50/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <SectionBadge><Link2 className="h-3 w-3" /> Integrations</SectionBadge>
          <h2 className="text-balance text-3xl font-bold text-gray-900 sm:text-4xl">
            Connect Vbuild CRM with your team&apos;s existing stack
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Connect your tools, connect your teams. With 100+ apps available, your team&apos;s favourite tools are just a click away.
          </p>
        </div>

        <div className="relative mt-12 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-gray-50/30 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-gray-50/30 to-transparent" />
          <div className="flex overflow-hidden">
            <div className="flex animate-marquee items-center gap-4">
              {INTEGRATIONS.map((name, i) => (
                <div
                  key={`${name}-${i}`}
                  className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 text-[9px] font-bold text-emerald-600">
                    {name.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">{name}</span>
                </div>
              ))}
            </div>
            <div className="flex animate-marquee items-center gap-4" aria-hidden="true">
              {INTEGRATIONS.map((name, i) => (
                <div
                  key={`${name}-${i}-dup`}
                  className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 text-[9px] font-bold text-emerald-600">
                    {name.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
