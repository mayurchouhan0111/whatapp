import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAIInsights } from '@/lib/reputation/helpers'
import { checkFeatureGate } from '@/lib/billing/limits'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const accountId = profile?.account_id
    if (!accountId) {
      return NextResponse.json({ error: 'Profile is not linked to an account.' }, { status: 403 })
    }

    const reputationEnabled = await checkFeatureGate(accountId, 'reputation')
    if (!reputationEnabled) {
      return NextResponse.json(
        { error: 'Reputation tools are not enabled on your plan. Please upgrade.' },
        { status: 403 },
      )
    }

    const url = new URL(request.url)
    const from = url.searchParams.get('from') ?? undefined
    const to = url.searchParams.get('to') ?? undefined

    const insights = await getAIInsights(supabase, accountId)

    type ReviewMetricRow = {
      rating: number | null
      status: string
      ai_confidence_score: number | null
      ai_model_used: string | null
      response_time_ms: number | null
      created_at: string | null
    }
    let reviews: ReviewMetricRow[] = []
    let reviewsError: { message: string } | null = null
    try {
      let query = supabase
        .from('review_requests')
        .select('rating, status, ai_confidence_score, ai_model_used, response_time_ms, created_at')
        .eq('account_id', accountId)
      if (from) query = query.gte('created_at', from)
      if (to) query = query.lte('created_at', to)
      const result = await query.order('created_at', { ascending: false }).limit(500)
      reviews = result.data ?? []
      reviewsError = result.error
    } catch {
      reviewsError = { message: 'Failed to load review metrics' }
    }

    const rated = reviews.filter((r) => r.rating !== null)
    const avgRating = rated.length
      ? rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length
      : null

    const statusCounts: Record<string, number> = {}
    for (const r of reviews) {
      statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1
    }

    const responded = reviews.filter((r) => ['rated', 'clicked', 'opened'].includes(r.status)).length
    const responseRate = reviews.length ? (responded / reviews.length) * 100 : 0

    const modelCounts: Record<string, number> = {}
    let withConfidence = 0
    let confidenceSum = 0
    const responseTimes: number[] = []
    for (const r of reviews) {
      if (r.ai_model_used) modelCounts[r.ai_model_used] = (modelCounts[r.ai_model_used] ?? 0) + 1
      if (typeof r.ai_confidence_score === 'number') {
        withConfidence += 1
        confidenceSum += r.ai_confidence_score
      }
      if (typeof r.response_time_ms === 'number' && r.response_time_ms > 0) {
        responseTimes.push(r.response_time_ms)
      }
    }

    const sortedTimes = [...responseTimes].sort((a, b) => a - b)
    const p95Time =
      sortedTimes.length > 0
        ? sortedTimes[Math.min(sortedTimes.length - 1, Math.floor(sortedTimes.length * 0.95))]
        : null

    const data = {
      ...insights,
      meta: {
        total_reviews: reviews.length,
        average_rating: avgRating,
        response_rate: responseRate,
        status_counts: statusCounts,
      },
      ai_performance: {
        responses_with_confidence: withConfidence,
        average_confidence: withConfidence ? confidenceSum / withConfidence : null,
        models_used: modelCounts,
        p95_response_time_ms: p95Time,
        sample_size: reviews.length,
      },
      query_error: reviewsError ? String(reviewsError.message ?? '') : null,
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[reputation/analytics] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
