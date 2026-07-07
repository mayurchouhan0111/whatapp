'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { provisionMockWorkspace } from './actions'

type Plan = {
  id: string
  name: string
  price: number
  billing_interval: string
}

export function PricingCards({ plans }: { plans: Plan[] }) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)
    try {
      const res = await provisionMockWorkspace(planId)
      if (res.error) {
        alert('Provisioning failed: ' + res.error)
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      alert('An unexpected error occurred.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
      {plans.map((plan) => (
        <div key={plan.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
          {plan.name === 'Growth' && (
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              MOST POPULAR
            </div>
          )}
          
          <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
          <p className="mt-4 text-gray-500 text-sm">Perfect for scaling your business.</p>
          
          <div className="mt-6 flex items-baseline text-5xl font-extrabold text-gray-900">
            ₹{plan.price.toLocaleString('en-IN')}
            <span className="ml-1 text-xl font-medium text-gray-500">/mo</span>
          </div>
          
          <ul className="mt-8 space-y-4 flex-1">
            {['CRM Module', 'Store Module', 'Marketing Module', 'AI Features'].map((feature, i) => (
              <li key={i} className="flex items-center">
                <Check className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
                <span className="text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>
          
          <button
            onClick={() => handleSubscribe(plan.id)}
            disabled={loading !== null}
            className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-lg text-center font-medium text-white transition-colors
              ${plan.name === 'Growth' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-800 hover:bg-gray-900'}
              ${loading === plan.id ? 'opacity-75 cursor-not-allowed' : ''}
            `}
          >
            {loading === plan.id ? 'Provisioning...' : `Get ${plan.name}`}
          </button>
        </div>
      ))}
    </div>
  )
}
