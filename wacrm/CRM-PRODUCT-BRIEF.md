# Vbuild CRM — Product Brief for AI Ad Generation

## 1. Product Identity

**Name:** Vbuild CRM
**Tagline:** The #1 WhatsApp Growth Platform
**Tagline (alt):** Close more deals on WhatsApp — Inbox, Pipelines, Broadcasts, Storefront & Automations
**Domain:** vbuildcrm.com
**Type:** WhatsApp Business API CRM — self-hostable, full data ownership
**License:** MIT (free to fork, self-host, customize)

**Positioning Statement:**
An all-in-one WhatsApp CRM that combines shared inbox, sales pipelines, broadcast campaigns, no-code automation flows, an e-commerce storefront, and Google Review management into a single platform — from the first marketing message to final checkout and post-purchase follow-up.

**Pricing Model:** SaaS (hosted) or self-hosted (MIT license):
- Free: ₹0/mo (1 user, 500 contacts)
- Starter: ₹999/mo (3 users, 2.5K contacts)
- Growth: ₹1,999/mo (10 users, 15K contacts) — most popular
- Pro: ₹3,999/mo (25 users, 50K contacts)
- Enterprise: Custom
- Store Only: ₹499/mo (standalone storefront without full CRM)

---

## 2. Target Audience

**Primary:** Indian businesses and entrepreneurs selling via WhatsApp
**Secondary:** Any business using WhatsApp Business API for sales, support, or marketing

**Specific customer profiles:**
- Solo entrepreneurs testing WhatsApp commerce (Free → Starter)
- Retail/physical stores wanting WhatsApp ordering + Google reviews
- E-commerce brands wanting a mobile storefront connected to WhatsApp
- Service businesses (salons, clinics, consultants) using WhatsApp for bookings and follow-ups
- Small sales teams (2-10) needing shared inbox + pipeline management
- High-volume operations (10-25) needing automation, multi-number, API access
- Enterprises wanting white-label, on-premise deployment

**Geographic focus:** India (pricing in INR, UPI payments, Indian business examples)

**Pain points solved:**
- "We manage customer conversations across personal WhatsApp — nothing is organized"
- "We lose leads because messages go to different team members' phones"
- "We can't track which WhatsApp campaigns actually drive sales"
- "Our customers ask to order via WhatsApp but we have no storefront"
- "We want Google reviews but customers never remember to leave them"
- "We need automations but can't afford developers or Zapier"
- "We're paying for 5 separate tools — inbox, CRM, broadcasts, store, reviews"

---

## 3. Full Feature List (by Module)

### Shared Inbox (`/inbox`)
- Multi-agent team inbox on official WhatsApp Business API
- Per-conversation assignment, status (open/closed), internal notes
- Unread conversation badges with counts
- Real-time message syncing
- Conversation history linked to contact profiles

### Contact Management (`/contacts`)
- Rich contact profiles with custom fields and tags
- Full conversation history per contact
- CSV import / export
- Deduplication
- Contact segments for targeted broadcasts

### Sales Pipelines (`/pipelines`)
- Kanban-style deal boards
- Custom pipeline stages (New → Qualified → Demo → Negotiation → Closed Won/Lost)
- Deal values tracked and summed
- Deals linked to WhatsApp conversations
- Team assignment per deal

### Broadcast Campaigns (`/broadcasts`)
- Send campaigns via Meta-approved WhatsApp message templates
- Delivery tracking and read receipts
- Per-recipient variable substitution (name, order details, etc.)
- Scheduled sending
- Campaign analytics (sent, delivered, read, clicked)

### Automations (`/automations`)
- Rule-based triggers: inbound message, new contact, keyword match, schedule
- Actions: send reply, tag contact, assign to agent, webhook call, update deal
- Conditional branches (if/else logic)
- Away messages and auto-replies

### Visual Flow Builder (`/flows` — Beta)
- Drag-and-drop no-code canvas (@xyflow/react)
- Multi-step customer journeys
- No engineering help required
- Pre-built templates for common flows

### WhatsApp Storefront (`/store`)
- Branded mobile-optimized storefront at `/shop/your-brand`
- Product catalog with images, prices, categories
- Bulk CSV import for products
- One-tap WhatsApp ordering (pre-composed order message)
- Order dashboard: status, payment tracking, customer chat
- UPI and COD payment support
- Order-to-deal auto-sync (orders become pipeline deals)

### Reputation Management (`/reputation`)
- QR code check-in posters (printable PDFs)
- Smart gating: positive reviews → Google, negative feedback → private
- Automated WhatsApp follow-ups requesting Google Reviews
- Analytics dashboard: rating distribution, trends, volume
- Google Review deep-linking

### Analytics & Reports
- Revenue tracking
- Top products / best sellers
- Order trends over time
- Response time metrics
- Agent performance stats
- Campaign performance (broadcast delivery/read rates)

### API & Integrations
- Public REST API (`/api/v1`) with scoped, revocable keys
- Meta Click-to-WhatsApp ad integration
- Webhook support for custom integrations
- Claims 100+ integrations: Shopify, Razorpay, Zoho, Freshworks, Zendesk, Intercom, HubSpot, Salesforce, Slack, Google Sheets, Mailchimp, Stripe, Twilio, Segment, Typeform

### Settings & Admin
- WhatsApp number configuration (QR connect, webhook setup)
- Team members with role-based access (Owner / Admin / Agent / Viewer)
- Custom fields and tags management
- Deal currency and pipeline settings
- Appearance / dark mode
- Security: login, 2FA, session management
- Template management for broadcast messages

---

## 4. Key Differentiators vs Competitors

| Differentiator | Vbuild CRM | Typical Competitors |
|---------------|------------|-------------------|
| **WhatsApp-native** | Built for WhatsApp Business API from day one | Chatwoot, Freshdesk, etc. are email-first |
| **Storefront included** | Full e-commerce storefront + order management | Separate Shopify/WooCommerce needed |
| **Google Reviews built-in** | QR check-in + smart gating + automated follow-ups | Separate reputation tool needed |
| **No-code flows** | Visual drag-and-drop flow builder | Zapier/Make needed for automation |
| **Self-hostable** | MIT license, fork and deploy yourself | SaaS-only, vendor lock-in |
| **All-in-one** | Inbox + CRM + Broadcasts + Store + Reviews + Flows | 3-6 separate subscriptions |
| **Pricing (India)** | ₹999–₹3,999/mo | Often $50–$200/mo per tool |
| **UPI payments** | Native UPI QR + COD support | International tools lack UPI |

---

## 5. Quantified Marketing Claims

| Metric | Claim |
|--------|-------|
| Customer Acquisition | 4X Lower CACs |
| Campaign ROI | 3X More ROI |
| Response Rate | 85% Higher |
| Sales Cycle | 30% Shorter |
| Response Speed | 3X Faster |
| Revenue Growth | 20% Increase |
| Support Workload | 40% Reduction |
| FAQ Auto-Resolution | 80% Resolved by AI |
| Resolution Time | 40% Faster |
| Social Proof | 500+ businesses trust Vbuild |
| Rating | 4.6/5 on G2, 4.9/5 site-wide |
| Scale Processed | 10B+ Messages |
| Uptime | 99.9% |
| Countries | 100+ |

---

## 6. Ad Copy Angles & Messaging Hooks

### Angle 1: "Stop Losing WhatsApp Leads"
- Problem: Customer messages buried in personal WhatsApp
- Hook: "Your team is sharing one WhatsApp number. But every conversation is private."
- Message: Shared inbox for your entire team. Assign, track, never drop a lead.

### Angle 2: "Sell Directly on WhatsApp"
- Problem: Customers ask "can I order on WhatsApp?" and you have no answer
- Hook: "Your customers are already on WhatsApp. Now your store is too."
- Message: Launch a mobile storefront connected to your WhatsApp in minutes. Orders come in, you fulfill.

### Angle 3: "Replace 5 Tools with One"
- Problem: Paying for inbox + CRM + broadcasts + store + reviews separately
- Hook: "5 subscriptions. One platform. Zero headaches."
- Message: Inbox, pipelines, broadcasts, storefront, reviews — all in one WhatsApp-native platform.

### Angle 4: "Automate Without Developers"
- Problem: Want automations but can't code
- Hook: "Drag, drop, deploy. No engineering ticket required."
- Message: Visual flow builder. Trigger campaigns, send follow-ups, qualify leads — all without code.

### Angle 5: "Get More Google Reviews Automatically"
- Problem: Customers promise to leave a review but forget
- Hook: "Turn every happy customer into a 5-star Google review."
- Message: QR code check-in + automated WhatsApp follow-ups. Positive reviews go to Google, negative stays private.

### Angle 6: "Built for India, Priced for India"
- Problem: International tools are expensive and don't support UPI
- Hook: "UPI, INR pricing, WhatsApp-native. Built for Indian businesses."
- Message: Everything you need to sell on WhatsApp. Starting at ₹999/mo.

---

## 7. Tone & Voice Guidelines for Ads

- **Professional but warm** — not overly corporate, not too casual
- **Confident but not arrogant** — let the numbers speak
- **Benefit-focused** — lead with what the customer gains, not features
- **Direct** — short sentences, clear value prop
- **Action-oriented** — "Launch your store", "Start your free trial", "Get more reviews"
- **No AI-generated jargon** — avoid "revolutionary", "game-changing", "next-gen"
- **Emphasize WhatsApp-native** — this is the core differentiator

---

## 8. Competitor Landscape (for positioning)

**Direct WhatsApp CRM competitors:**
- WATI, Interakt, ResponseBuddy, AiSensy, BizMagnets

**Indirect (general CRM with WhatsApp):**
- Chatwoot (open source, but email-first)
- Freshsales / Freshdesk (WhatsApp as channel, not core)
- Zoho CRM (WhatsApp integration is add-on)

**Vbuild CRM advantage:**
- More features per dollar (storefront + reviews + flows included)
- Self-hostable option (data control)
- UPI-native payments
- Google Review management built in
- Visual flow builder native (no Zapier needed)

---

## 9. Example Ad Copy Snippets

**Facebook/Instagram ad:**
> "Your customers are on WhatsApp. Your store should be too."
> Launch a mobile storefront, manage orders, and chat with buyers — all inside WhatsApp. No separate app needed.
> Starting at ₹999/mo. Free plan available.

**Google Search ad:**
> WhatsApp CRM for Indian Businesses
> Inbox, Sales Pipeline, Storefront & Broadcasts
> From ₹999/mo — Free Trial Available

**LinkedIn ad:**
> Replace 5 tools with one WhatsApp-native CRM.
> Shared Inbox × Pipelines × Broadcasts × Storefront × Reviews
> Trusted by 500+ businesses. Start free at vbuildcrm.com

**YouTube pre-roll:**
> "Stop copy-pasting customer orders from WhatsApp into your notes app."
> Vbuild CRM turns WhatsApp into your complete sales platform — shared inbox, storefront, automations, and Google reviews in one place. Start free at vbuildcrm.com
