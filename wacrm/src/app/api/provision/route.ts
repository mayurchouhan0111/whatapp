import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    let { plan } = await req.json()
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

    // Map pricing page plan names to actual DB plan names
    // The DB currently only has Free / Starter / Pro plans seeded.
    const planNameMap: Record<string, string> = {
      free: 'Free',
      starter: 'Starter',
      growth: 'Pro',
      pro: 'Pro',
      enterprise: 'Pro',
    }
    plan = planNameMap[String(plan).toLowerCase()] ?? plan

    // Look up the plan by name from saas_plans
    const { data: plans, error: planError } = await supabaseAuth
      .from("saas_plans")
      .select("id")
      .ilike("name", plan)

    if (planError || !plans || plans.length === 0) {
      return NextResponse.json({ error: "Plan not found" }, { status: 400 })
    }

    const planId = plans[0].id

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

    const { data, error } = await supabaseAdmin.rpc("provision_workspace", {
      p_user_id: user.id,
      p_plan_id: planId,
      p_account_name: accountName,
      p_stripe_subscription_id: "manual_sub_" + Math.random().toString(36).substring(7),
    })

    if (error) {
      console.error("Provision RPC error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, accountId: data })
  } catch (err: any) {
    console.error("Provision error:", err)
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 })
  }
}