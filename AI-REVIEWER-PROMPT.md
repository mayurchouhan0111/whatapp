# PROJECT BRIEF: Review Generation Engine + Real-Flow Hardening
## Handoff Prompt for an Independent AI Reviewer/Implementer

### Role
You are a senior full-stack engineer performing an INDEPENDENT adversarial review of the
"Reputation / Review Engine" feature in this codebase, then implementing any IMPROVEMENTS
I have NOT already flagged or fixed. Do not trust my summary — verify against the code.

### Project & Stack
- Next.js 16 (App Router), TypeScript, Supabase (auth + Postgres), shadcn/ui, Tailwind,
  Vitest. Read `node_modules/next/dist/docs/` for version-specific API changes.
- Repo: `wacrm/` subfolder of this workspace.

### What was already built (Phase 1-3)
1. **AI humanization engine** (`src/lib/reputation/`):
   - `humanizer.ts` — strips robotic phrases, computes a 0-1 human-likeness score.
   - `prompt-templates.ts` — tone-aware prompts w/ repeat-customer context + prompt-injection escaping.
   - `context-builder.ts` — builds customer context from past reviews.
   - `ai-engine.ts` — OpenAI→Gemini→fallback chain, 8s timeouts, confidence on raw output.
2. **API layer**: `/api/reputation/ai-reply` (rate-limited, plan-gated, persists metrics);
   `/api/reputation/analytics`. Migration `048_review_ai_engine.sql`.
3. **UI**: `ai-reply-generator.tsx` "AI Replies" tab wired into the Reputation dashboard.

### The real customer-facing flow (reviewed & hardened)
- Owner adds **staff** → **waiter** collects phone → server sends WhatsApp invite w/ link `/r/[id]`
- Customer rates on a **public page** (`src/app/r/[id]/page.tsx`) → positive = tags/AI polish +
  "Write on Google"; negative = private feedback → automation sends thank-you/recovery + manager alert
- Owner sees inbox, staff analytics, AI insights, loyalty passes.

### Known loopholes — ALREADY FIXED (do not re-report these)
| Area | Fix applied |
|---|---|
| Reward tampering | Rewards come from DB settings via `sanitizeRewardsConfig()`, never client body |
| Infinite/double coupon grant | `click_google` is idempotent — claimed requests return stored coupon |
| Untrusted rating/sentiment | `isValidRating()` (int 1-5); sentiment server-computed via `computeSentiment()` |
| Billing bypass | `checkFeatureGate('reputation')` + `checkPlanLimit('review_requests_per_month')` on requests & staff-collect |
| Unauthenticated credit burn | Per-IP rate limits on voice/ai-generate/staff-collect/qr; 5MB audio cap; tag allow-list |
| WhatsApp spam relay | Rate-limited public collect/qr POSTs |
| UI double-fire | Spin-page no longer re-calls `click_google` |
| N+1 queries | `getStaffAnalytics` batched with single `.in('staff_id')` |
| Broken multi-contact API | `contact_ids` >1 now explicitly rejected |
| Unbounded list | `.limit(500)` on requests GET |
| Dead code | Removed superseded `generateAIReply` |

### YOUR MISSION
1. **Independent review** — walk the real flow end-to-end in the code (staff collect → invite →
   public review page → automation → dashboard). Do NOT limit yourself to what I listed.
2. **Find and IMPLEMENT any improvement I did not mention**, e.g.:
   - Missed edge cases / race conditions in the idempotency guard
   - Gap between plan-limit count and actual rows written
   - Any route still missing rate limits, validation, or feature gates
   - Any test coverage gap in the real flow (routes have thin coverage)
   - Accessibility, XSS (e.g. `dangerouslySetInnerHTML`), open redirect in `google_review_url`
   - DB: missing indexes, constraints, or migration issues (048 vs review_requests columns)
3. **Harden anything you touch** — follow the existing patterns in the repo.
4. **Verify every change**: add tests, then run `npx tsc --noEmit`, `npx vitest run`,
   `npx eslint <changed files>`, and `npm run build`. All must pass before you finish.

### Deliverable
A summary listing: (a) every improvement you found & implemented (with file:line),
(b) anything you deliberately did NOT change and why, (c) verification results.
Flag anything CRITICAL you believe is still broken.

### Quality bar
- No new dependencies without justification.
- Don't change user-visible copy/layout unless it fixes a bug you can point to.
- Match repo conventions; keep changes small and focused.
