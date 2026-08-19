"use client"

import { useTheme } from "@/hooks/use-theme"

interface ThemeLogoProps {
  alt?: string
  height?: number | string
  className?: string
  style?: React.CSSProperties
}

export function ThemeLogo({
  alt = "Vbuild CRM",
  height = 40,
  className = "object-contain",
  style,
}: ThemeLogoProps) {
  const { mode } = useTheme()

  // During SSR / initial render the mode is "light" (the default),
  // so the light logo is shown. After hydration ThemeProvider reads
  // the real mode from the DOM. This avoids any hydration mismatch
  // while still switching correctly on client-side toggle.
  const src = mode === "dark" ? "/logo-dark.png" : "/logo.png"

  return (
    <img
      src={src}
      alt={alt}
      style={{ height, width: "auto", ...style }}
      className={className}
    />
  )
}
