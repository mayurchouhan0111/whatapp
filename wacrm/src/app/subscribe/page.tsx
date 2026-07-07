import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PricingCards } from './pricing-cards'

export default async function PricingPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (_) {}
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?returnTo=/pricing')
  }

  // Fetch available plans from the database
  const { data: plans, error } = await supabase
    .from('saas_plans')
    .select('*')
    .order('price', { ascending: true })

  if (error || !plans) {
    console.error('Error fetching plans:', error)
    return <div>Error loading plans. Please try again later.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-20 px-4">
      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
          Choose Your Plan
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          Your account has been created successfully! Please purchase a plan to unlock the CRM, Store, and Marketing tools.
        </p>
      </div>

      <PricingCards plans={plans} />
      
      <div className="mt-12 text-center text-sm text-gray-500">
        Need a custom enterprise solution? <a href="mailto:sales@wacrm.com" className="text-indigo-600 font-medium hover:underline">Contact Sales</a>
      </div>
    </div>
  )
}
