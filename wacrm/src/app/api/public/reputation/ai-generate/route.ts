import { NextResponse } from 'next/server'
import { generateAIPolish } from '@/lib/reputation/helpers'
import { REVIEW_TAGS, type ReviewTag } from '@/types/reputation'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

const VALID_TAGS = new Set(REVIEW_TAGS.map((t) => t.key))

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request: Request) {
  try {
    const rl = checkRateLimit(`reputation-ai-generate:${clientIp(request)}`, RATE_LIMITS.reputationAiPolish)
    if (!rl.success) return rateLimitResponse(rl)

    const body = await request.json()
    const { tags, voiceTranscript } = body as {
      tags: ReviewTag[]
      voiceTranscript?: string
    }

    if (!Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json({ error: 'At least one tag is required.' }, { status: 400 })
    }

    // Only allow known tags so a crafted body can't inject arbitrary
    // instructions into the AI prompt.
    if (!tags.every((t) => VALID_TAGS.has(t))) {
      return NextResponse.json({ error: 'Invalid tag.' }, { status: 400 })
    }

    if (typeof voiceTranscript === 'string' && voiceTranscript.length > 1000) {
      return NextResponse.json({ error: 'Voice transcript is too long.' }, { status: 400 })
    }

    const text = await generateAIPolish(tags, voiceTranscript)

    return NextResponse.json({ data: { text } })
  } catch (error) {
    console.error('[ai-generate] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
