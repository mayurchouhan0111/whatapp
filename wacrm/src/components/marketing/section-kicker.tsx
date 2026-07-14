import { type ReactNode } from "react"

export function SectionKicker({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 flex items-center gap-2.5 text-xs font-semibold tracking-[0.15em] text-primary uppercase">
      <span className="inline-block h-2 w-2 rounded-sm bg-primary/60" />
      {children}
    </p>
  )
}
