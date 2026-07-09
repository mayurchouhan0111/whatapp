import { type ReactNode } from "react"

interface SectionBadgeProps {
  children: ReactNode
  icon?: ReactNode
}

export function SectionBadge({ children, icon }: SectionBadgeProps) {
  return (
    <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-medium text-primary shadow-sm shadow-primary/5">
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </div>
  )
}
