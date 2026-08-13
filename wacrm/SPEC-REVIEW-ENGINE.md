# Spec: Review Generation Engine with Human-Like AI

## Objective

Enhance WACRM's existing review system with a sophisticated AI-powered review generation engine that thinks like a human customer experience manager. The engine will generate personalized, context-aware review responses that feel genuinely human, not robotic.

### User Stories
1. As a business owner, I want AI-generated review responses that sound human and match my brand voice
2. As a business owner, I want a beautiful dashboard to monitor review analytics and AI performance
3. As a customer, I want review responses that feel personal, not mass-produced

### Success Criteria
- AI responses pass blind human detection test (≥80% judged as human-written by 10 test users)
- Review response time <2 seconds (p95)
- Dashboard loads in <1.5 seconds on 4G
- 90% test coverage on new AI logic
- Zero critical bugs in production

## Tech Stack

- **Framework:** Next.js 16.2.6 (App Router) — matches existing codebase
- **Language:** TypeScript (strict mode)
- **Database:** Supabase (PostgreSQL)
- **AI Providers:** OpenAI GPT-4o-mini, Gemini 2.0 Flash (fallback)
- **UI Components:** shadcn v4 + @base-ui/react (matches existing codebase)
- **Styling:** Tailwind CSS v4 (existing hex/rgb color tokens)
- **Testing:** Vitest (existing)
- **State Management:** React hooks + Supabase realtime

## Commands

```bash
# Development
npm run dev

# Build
npm run build

# Test
npm test
npm test -- --coverage

# Lint
npm run lint
npm run lint --fix

# Type Check
npm run typecheck
```

## Project Structure

```
src/
├── app/
│   └── (dashboard)/
│       └── reputation/          # Review management pages
│           ├── page.tsx         # Main dashboard
│           └── analytics/page.tsx
├── components/
│   └── reputation/              # Review-specific components
│       ├── review-dashboard.tsx
│       ├── review-card.tsx
│       ├── ai-response-preview.tsx
│       ├── review-timeline.tsx
│       └── analytics-charts.tsx
├── lib/
│   └── reputation/
│       ├── ai-engine.ts         # Core AI thinking engine (enhances existing helpers.ts)
│       ├── humanizer.ts         # Human-like response post-processing
│       ├── context-builder.ts   # Build customer context for AI
│       └── prompt-templates.ts  # Sophisticated prompts
├── types/
│   └── reputation.ts            # Extended with new types
└── __tests__/
    └── reputation/
        ├── ai-engine.test.ts
        ├── humanizer.test.ts
        └── context-builder.test.ts
```

## Existing Code Integration

**Already exists (DO NOT duplicate):**
- `src/lib/reputation/helpers.ts` — `generateAIReply()`, `generateAIPolish()`, `getAIInsights()`
- `src/lib/services/review-trigger-service.ts` — WhatsApp review request sending
- `src/app/api/reputation/ai-reply/route.ts` — Existing AI reply endpoint
- `src/types/reputation.ts` — `ReputationSettingsV2`, `ReviewRequestV2`, `AIInsights`

**Will enhance:**
- `src/lib/reputation/helpers.ts` — Add humanizer integration to `generateAIReply()`
- `src/types/reputation.ts` — Add `CustomerContext`, `BrandVoice`, `AIResponse` types

## Database Schema Changes

**New columns on `reputation_settings`:**
```sql
ALTER TABLE reputation_settings ADD COLUMN brand_voice JSONB DEFAULT '{"tone": "warm", "style": "professional", "custom_instructions": ""}';
ALTER TABLE reputation_settings ADD COLUMN ai_model_preference TEXT DEFAULT 'auto';
```

**New columns on `review_requests`:**
```sql
ALTER TABLE review_requests ADD COLUMN ai_confidence_score FLOAT;
ALTER TABLE review_requests ADD COLUMN ai_model_used TEXT;
ALTER TABLE review_requests ADD COLUMN response_time_ms INTEGER;
```

## Auth Pattern

All new API routes follow existing pattern:
1. `createClient()` for session-based auth
2. `supabase.auth.getUser()`
3. Profile lookup for `account_id`
4. Check `checkPlanLimit('review_requests_per_month')` before AI calls

## Rate Limiting

**Known limitation:** In-memory rate limiter doesn't work on Vercel serverless.
**Mitigation:** Use existing `checkRateLimit()` for development; document that production deployment needs Upstash/Redis for distributed rate limiting.

## Code Style

```typescript
// Naming: camelCase for functions/variables, PascalCase for types/components
// Imports: @/ aliases, grouped by external → internal
// Functions: Pure functions preferred, side effects isolated
// Types: Explicit return types on exported functions

export async function generateHumanResponse(
  context: CustomerContext,
  review: ReviewRequestV2,
  brandVoice: BrandVoice
): Promise<AIResponse> {
  const prompt = buildContextualPrompt(context, review, brandVoice);
  const rawResponse = await callAI(prompt);
  return humanizeResponse(rawResponse, brandVoice);
}
```

## Testing Strategy

- **Framework:** Vitest (already configured)
- **Unit Tests:** All AI logic functions (80% of tests)
- **Integration Tests:** API endpoints, database operations (15%)
- **E2E Tests:** Critical user flows (5%)
- **Coverage Target:** 90% on new code

## Boundaries

- **Always:** Run tests before commits, validate inputs, check billing limits
- **Ask First:** Database schema changes, new AI provider integrations
- **Never:** Commit API keys, skip tests, modify vendor directories

---

# Implementation Plan

## Phase 1: Core AI Engine (Foundation)

### Task 1: Extend Types
**Description:** Add new types to `reputation.ts` for CustomerContext, BrandVoice, AIResponse.

**Acceptance Criteria:**
- [ ] `CustomerContext` type with customer history, preferences, past reviews
- [ ] `BrandVoice` type with tone, style, custom instructions
- [ ] `AIResponse` type with text, confidence_score, model_used, response_time_ms
- [ ] All types extend existing `ReputationSettingsV2` and `ReviewRequestV2`

**Files:**
- `src/types/reputation.ts` (modify)

**Verification:**
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Existing tests still pass

---

### Task 2: Build Context Builder
**Description:** Create a module that builds rich customer context from CRM data for AI-powered responses.

**Acceptance Criteria:**
- [ ] Extracts customer history from existing `review_requests` table
- [ ] Includes business context from `reputation_settings`
- [ ] Handles missing data gracefully (null checks)
- [ ] Returns structured `CustomerContext` object

**Files:**
- `src/lib/reputation/context-builder.ts`
- `src/__tests__/reputation/context-builder.test.ts`

**Verification:**
- [ ] Unit tests pass: `npm test -- --grep "context-builder"`
- [ ] TypeScript compiles without errors

---

### Task 3: Build Prompt Templates
**Description:** Create sophisticated prompt templates that make AI responses sound genuinely human.

**Acceptance Criteria:**
- [ ] Multiple prompt styles based on `BrandVoice.tone`
- [ ] Context-aware prompts that reference customer history
- [ ] Handles edge cases (empty reviews, angry customers, spam)
- [ ] Prompts reference business name and past positive reviews

**Files:**
- `src/lib/reputation/prompt-templates.ts`
- `src/__tests__/reputation/prompt-templates.test.ts`

**Verification:**
- [ ] Unit tests pass: `npm test -- --grep "prompt-templates"`
- [ ] Prompts generate coherent output in tests

---

### Task 4: Build Humanizer Module
**Description:** Transform raw AI output into natural, human-sounding responses.

**Acceptance Criteria:**
- [ ] Removes robotic patterns (defined list: excessive exclamation marks, "Dear Valued Customer", "We apologize for the inconvenience", "Thank you for your feedback")
- [ ] Adds natural variations (sentence length, word choice)
- [ ] Preserves brand voice while sounding human
- [ ] Returns confidence score based on pattern detection

**Files:**
- `src/lib/reputation/humanizer.ts`
- `src/__tests__/reputation/humanizer.test.ts`

**Verification:**
- [ ] Unit tests pass: `npm test -- --grep "humanizer"`
- [ ] Output passes pattern detection tests

---

### Task 5: Build AI Engine Orchestrator
**Description:** Main engine that enhances existing `generateAIReply()` with humanization.

**Acceptance Criteria:**
- [ ] Calls existing `generateAIReply()` then applies humanizer
- [ ] Handles fallback when AI providers fail (OpenAI → Gemini → static fallback)
- [ ] Logs performance metrics to console
- [ ] Checks billing limit before AI call

**Files:**
- `src/lib/reputation/ai-engine.ts`
- `src/__tests__/reputation/ai-engine.test.ts`

**Verification:**
- [ ] Unit tests pass: `npm test -- --grep "ai-engine"`
- [ ] Integration test with mock AI provider passes

---

## Checkpoint: Core AI Engine
- [ ] All unit tests pass
- [ ] AI generates human-like responses in test scenarios
- [ ] Fallback logic works when AI is unavailable
- [ ] Ready for UI integration

---

## Phase 2: API Layer

### Task 6: Enhance Existing AI Reply Endpoint
**Description:** Update `/api/reputation/ai-reply` to use new AI engine with humanization.

**Acceptance Criteria:**
- [ ] Uses new `ai-engine.ts` instead of direct `generateAIReply()` call
- [ ] Returns `{ reply, confidence_score }` (extends existing `{ reply }` contract)
- [ ] Maintains backward compatibility (existing `reply` field still works)
- [ ] Checks billing limit before AI call

**Files:**
- `src/app/api/reputation/ai-reply/route.ts` (modify)
- `src/__tests__/api/ai-reply.test.ts`

**Verification:**
- [ ] Integration tests pass
- [ ] API returns valid responses
- [ ] Existing tests still pass

---

### Task 7: Build Review Analytics API
**Description:** API endpoint for fetching review analytics with AI performance metrics.

**Acceptance Criteria:**
- [ ] GET `/api/reputation/analytics` returns aggregated data
- [ ] Includes sentiment trends, response rates, AI performance
- [ ] Supports date range filtering
- [ ] Checks auth and billing limits

**Files:**
- `src/app/api/reputation/analytics/route.ts`
- `src/__tests__/api/reputation-analytics.test.ts`

**Verification:**
- [ ] Integration tests pass
- [ ] Response time <500ms for 1000 reviews

---

## Checkpoint: API Layer
- [ ] All API tests pass
- [ ] APIs handle edge cases (empty data, invalid input)
- [ ] Billing limits enforced
- [ ] Ready for UI integration

---

## Phase 3: UI Components

### Task 8: Build Review Dashboard
**Description:** Main dashboard showing review overview, AI performance, and recent activity.

**Acceptance Criteria:**
- [ ] Shows total reviews, average rating, response rate
- [ ] Displays AI response quality metrics (confidence scores)
- [ ] Real-time updates via Supabase realtime channel `review_updates`
- [ ] Responsive design (mobile-first)
- [ ] Uses existing shadcn v4 components

**Files:**
- `src/components/reputation/review-dashboard.tsx`
- `src/app/(dashboard)/reputation/page.tsx`

**Verification:**
- [ ] Component renders correctly
- [ ] Responsive on all breakpoints
- [ ] Accessibility score ≥90

---

### Task 9: Build AI Response Preview
**Description:** Live preview of AI-generated responses with editing capabilities.

**Acceptance Criteria:**
- [ ] Shows AI response in real-time
- [ ] Allows manual editing before sending
- [ ] Displays confidence score
- [ ] Supports multiple response variations

**Files:**
- `src/components/reputation/ai-response-preview.tsx`

**Verification:**
- [ ] Component updates in real-time
- [ ] Edit functionality works
- [ ] Keyboard accessible

---

### Task 10: Build Review Timeline
**Description:** Visual timeline of review activity with sentiment analysis.

**Acceptance Criteria:**
- [ ] Shows reviews chronologically
- [ ] Color-coded by sentiment (positive/neutral/negative)
- [ ] Filterable by date, rating, sentiment
- [ ] Infinite scroll for performance

**Files:**
- `src/components/reputation/review-timeline.tsx`

**Verification:**
- [ ] Timeline renders 1000+ reviews smoothly
- [ ] Filters work correctly
- [ ] Performance <100ms for filter changes

---

## Checkpoint: UI Components
- [ ] All components render correctly
- [ ] Accessibility audit passes
- [ ] Performance metrics meet targets
- [ ] Ready for integration testing

---

## Phase 4: Integration & Polish

### Task 11: Integrate with Existing Review System
**Description:** Connect new AI engine with existing review system.

**Acceptance Criteria:**
- [ ] New AI engine available for review responses (not requests)
- [ ] Maintains backward compatibility with existing API
- [ ] No changes to `review-trigger-service.ts` (it sends requests, not responses)
- [ ] Existing tests still pass

**Files:**
- `src/lib/reputation/ai-engine.ts` (integrate with helpers.ts)

**Verification:**
- [ ] Existing tests still pass
- [ ] New AI responses are better than old ones

---

### Task 12: Add Comprehensive Tests
**Description:** Complete test suite for all new functionality.

**Acceptance Criteria:**
- [ ] 90% code coverage on new code
- [ ] All edge cases covered
- [ ] Integration tests for API endpoints
- [ ] No flaky tests

**Files:**
- `src/__tests__/reputation/*.test.ts`
- `src/__tests__/api/*.test.ts`

**Verification:**
- [ ] `npm test -- --coverage` shows 90%+
- [ ] All tests pass

---

## Checkpoint: Complete
- [ ] All acceptance criteria met
- [ ] All tests pass
- [ ] Performance targets met
- [ ] Ready for code review

---

# Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI provider rate limits | High | Implement fallback providers, cache responses |
| AI responses sound robotic | High | Extensive humanizer testing, pattern detection |
| Rate limiting on Vercel | Medium | Document limitation, suggest Upstash for production |
| Breaking existing functionality | Medium | Comprehensive test suite, gradual rollout |
| Billing limit bypass | High | Check limits before every AI call |

---

# Next Steps

1. Review and approve this spec
2. Begin Phase 1: Core AI Engine
3. Run doubt-driven development cycle on Phase 1
4. Proceed through phases with checkpoints

---

*Status: v2 - Corrected after doubt-driven review*