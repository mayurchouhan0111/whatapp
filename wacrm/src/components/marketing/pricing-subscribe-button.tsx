'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight } from 'lucide-react'

export function PricingSubscribeButton({
  planName,
  cta,
  highlighted,
}: {
  planName: string
  cta: string
  highlighted: boolean
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleClick = async () => {
    if (planName === 'Enterprise') {
      window.location.href = 'mailto:sales@vbuildcrm.com'
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/signup')
      setLoading(false)
      return
    }

    // User is logged in — provision the workspace
    const planSlug = planName.toLowerCase()
    const res = await fetch('/api/provision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planSlug }),
    })

    if (!res.ok) {
      alert('Provisioning failed. Please try again.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-300 ${
        highlighted
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5'
          : 'border border-border bg-card text-foreground hover:bg-accent hover:-translate-y-0.5'
      } ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Processing...' : cta}
      {planName !== 'Enterprise' && !loading && <ArrowRight className="h-4 w-4" />}
    </button>
  )
}