import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/flows/admin-client'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = supabaseAdmin()

    if (!id) {
      return NextResponse.json({ error: 'Missing request ID.' }, { status: 400 })
    }

    // Fetch review request
    const { data: reviewRequest, error: reqErr } = await db
      .from('review_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (reqErr || !reviewRequest) {
      return NextResponse.json({ error: 'Review request not found.' }, { status: 404 })
    }

    // Fetch business name (from account)
    const { data: account } = await db
      .from('accounts')
      .select('name')
      .eq('id', reviewRequest.account_id)
      .single()

    // Fetch reputation settings
    const { data: settings } = await db
      .from('reputation_settings')
      .select('*')
      .eq('account_id', reviewRequest.account_id)
      .single()

    // Fetch contact details
    const { data: contact } = await db
      .from('contacts')
      .select('name')
      .eq('id', reviewRequest.contact_id)
      .single()

    // Log the "opened" event if it is in "sent" status
    if (reviewRequest.status === 'sent') {
      await db
        .from('review_requests')
        .update({
          status: 'opened',
          opened_at: new Date().toISOString(),
        })
        .eq('id', id)
    }

    return NextResponse.json({
      data: {
        id: reviewRequest.id,
        businessName: account?.name || 'our business',
        contactName: contact?.name || 'Customer',
        googleReviewUrl: settings?.google_review_url || '',
        gateReviews: settings?.gate_reviews !== false,
        reviewThreshold: settings?.review_threshold ?? 4,
        status: reviewRequest.status === 'sent' ? 'opened' : reviewRequest.status,
        rating: reviewRequest.rating,
      },
    })
  } catch (error) {
    console.error('[public/reputation/GET] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = supabaseAdmin()

    if (!id) {
      return NextResponse.json({ error: 'Missing request ID.' }, { status: 400 })
    }

    // Verify request exists
    const { data: reviewRequest, error: reqErr } = await db
      .from('review_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (reqErr || !reviewRequest) {
      return NextResponse.json({ error: 'Review request not found.' }, { status: 404 })
    }

    const body = await request.json()
    const { rating, feedback, action } = body

    if (action === 'click_google') {
      // User clicked the Google review link
      await db
        .from('review_requests')
        .update({
          status: 'clicked',
          rating: rating || 5, // Default to 5 if positive click
          clicked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      return NextResponse.json({ success: true })
    }

    if (action === 'submit_feedback') {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'Valid rating (1-5) is required.' }, { status: 400 })
      }

      // Update feedback in db
      await db
        .from('review_requests')
        .update({
          status: 'rated',
          rating,
          feedback: feedback || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      // Add feedback details to contact notes in CRM
      const starsStr = '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
      const noteContent = `[Google Review Page] Star Rating: ${rating}/5 ${starsStr}\nPrivate Feedback comments: "${feedback || '(None)'}"`
      
      await db.from('contact_notes').insert({
        contact_id: reviewRequest.contact_id,
        account_id: reviewRequest.account_id,
        note_text: noteContent,
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action parameter.' }, { status: 400 })
  } catch (error) {
    console.error('[public/reputation/PUT] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
