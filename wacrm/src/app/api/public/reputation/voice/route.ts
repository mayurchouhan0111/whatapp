import { NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/reputation/helpers'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

const MAX_AUDIO_BYTES = 5 * 1024 * 1024 // 5 MB

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request: Request) {
  try {
    const rl = checkRateLimit(`reputation-voice:${clientIp(request)}`, RATE_LIMITS.reputationVoice)
    if (!rl.success) return rateLimitResponse(rl)

    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required.' }, { status: 400 })
    }

    if (audioFile.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: `Audio file too large. Maximum allowed size is ${Math.round(MAX_AUDIO_BYTES / 1024 / 1024)} MB.` },
        { status: 413 },
      )
    }

    const buffer = await audioFile.arrayBuffer()
    const text = await transcribeAudio(buffer)

    return NextResponse.json({ data: { text } })
  } catch (error) {
    console.error('[voice] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
