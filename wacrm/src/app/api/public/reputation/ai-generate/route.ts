import { NextResponse } from 'next/server'
import { generateAIPolish } from '@/lib/reputation/helpers'
import type { ReviewTag } from '@/types/reputation'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tags, voiceTranscript } = body as {
      tags: ReviewTag[]
      voiceTranscript?: string
    }

    if (!Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json({ error: 'At least one tag is required.' }, { status: 400 })
    }

    const text = await generateAIPolish(tags, voiceTranscript)

    return NextResponse.json({ data: { text } })
  } catch (error) {
    console.error('[ai-generate] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
