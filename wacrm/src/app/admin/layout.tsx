import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/flows/admin-client'
import { AdminShell } from './admin-shell'

async function checkSuperAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const admin = supabaseAdmin()
  const { data } = await admin
    .from('profiles')
    .select('is_super_admin')
    .eq('user_id', user.id)
    .maybeSingle()

  return data?.is_super_admin === true
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isSuperAdmin = await checkSuperAdmin()
  if (!isSuperAdmin) {
    notFound()
  }

  return <AdminShell>{children}</AdminShell>
}
