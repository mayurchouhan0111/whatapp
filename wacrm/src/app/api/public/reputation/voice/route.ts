import { NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/reputation/helpers'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required.' }, { status: 400 })
    }

    const buffer = await audioFile.arrayBuffer()
    const text = await transcribeAudio(buffer)

    return NextResponse.json({ data: { text } })
  } catch (error) {
    console.error('[voice] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
