import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { syncAccountPlanLimits, type PlanTier } from "@/lib/billing/limits"

export async function POST(req: Request) {
  try {
    const { plan } = await req.json()
    const cookieStore = await cookies()

    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const rawTier = String(plan || 'free').toLowerCase().trim()
    const validTiers: PlanTier[] = ['free', 'starter', 'growth', 'pro', 'enterprise']
    const planTier: PlanTier = validTiers.includes(rawTier as PlanTier) ? (rawTier as PlanTier) : 'free'
    const titleTier = planTier.charAt(0).toUpperCase() + planTier.slice(1)

    // Look up matching plan by name in saas_plans
    let planId: string | null = null
    const { data: directMatch } = await supabaseAuth
      .from("saas_plans")
      .select("id")
      .ilike("name", titleTier)
      .limit(1)

    if (directMatch && directMatch.length > 0) {
      planId = directMatch[0].id
    } else {
      // Fallback candidates if exact tier name isn't seeded
      const fallbackNames: Record<PlanTier, string[]> = {
        free: ['Free', 'Starter'],
        starter: ['Starter', 'Free'],
        growth: ['Growth', 'Pro', 'Starter'],
        pro: ['Pro', 'Growth', 'Enterprise'],
        enterprise: ['Enterprise', 'Pro'],
      }
      for (const candidate of fallbackNames[planTier]) {
        const { data: candidateMatch } = await supabaseAuth
          .from("saas_plans")
          .select("id")
          .ilike("name", candidate)
          .limit(1)
        if (candidateMatch && candidateMatch.length > 0) {
          planId = candidateMatch[0].id
          break
        }
      }
    }

    if (!planId) {
      return NextResponse.json({ error: "Plan not found" }, { status: 400 })
    }

    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const accountName = user.user_metadata?.full_name
      ? `${user.user_metadata.full_name}'s Workspace`
      : "My Workspace"

    const { data: accountId, error: rpcError } = await supabaseAdmin.rpc("provision_workspace", {
      p_user_id: user.id,
      p_plan_id: planId,
      p_account_name: accountName,
      p_stripe_subscription_id: "manual_sub_" + Math.random().toString(36).substring(7),
    })

    if (rpcError) {
      console.error("Provision RPC error:", rpcError)
      return NextResponse.json({ error: rpcError.message }, { status: 500 })
    }

    // Synchronize account limits & feature gates in accounts table
    if (accountId) {
      try {
        await syncAccountPlanLimits(accountId, planTier)
      } catch (syncErr: unknown) {
        console.error("Account limit sync warning:", syncErr)
      }
    }

    return NextResponse.json({ success: true, accountId })
  } catch (err: unknown) {
    console.error("Provision error:", err)
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unexpected error" }, { status: 500 })
  }
}