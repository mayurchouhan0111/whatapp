'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function provisionMockWorkspace(planId: string) {
  try {
    const cookieStore = await cookies()
    // Regular auth client to get the current user
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {}
        }
      }
    )

    const { data: { user } } = await supabaseAuth.auth.getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Service role client to bypass RLS and call the secure RPC
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {}
        }
      }
    )

    // Call the RPC to provision the workspace
    // The user's name is used for the workspace name if available
    const accountName = user.user_metadata?.full_name 
      ? `${user.user_metadata.full_name}'s Workspace` 
      : 'My Workspace'

    const { data, error } = await supabaseAdmin.rpc('provision_workspace', {
      p_user_id: user.id,
      p_plan_id: planId,
      p_account_name: accountName,
      p_stripe_subscription_id: 'mock_sub_' + Math.random().toString(36).substring(7)
    })

    if (error) {
      console.error('RPC Error:', error)
      return { error: error.message }
    }

    return { success: true, accountId: data }
  } catch (err: any) {
    console.error('Provisioning exception:', err)
    return { error: err.message || 'An unexpected error occurred' }
  }
}
