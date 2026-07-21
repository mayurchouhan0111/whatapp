'use client'

import { Search, Filter } from 'lucide-react'

export function AccountsFilter() {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search accounts by name or email..."
          className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-2 rounded-lg border border-input bg-background">
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline">All Plans</span>
      </div>
    </div>
  )
}
