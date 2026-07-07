export function TrustBar() {
  const logos = [
    { name: "TechCorp", color: "from-blue-500 to-blue-600" },
    { name: "ShopIndia", color: "from-emerald-500 to-emerald-600" },
    { name: "GrowthX", color: "from-violet-500 to-violet-600" },
    { name: "QuickServe", color: "from-amber-500 to-amber-600" },
    { name: "MediConnect", color: "from-rose-500 to-rose-600" },
    { name: "EduPrime", color: "from-cyan-500 to-cyan-600" },
  ]

  return (
    <section className="border-y border-border/30 bg-card/20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Trusted by growing businesses worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {logos.map((logo) => (
            <div key={logo.name} className="flex items-center gap-2.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${logo.color} text-[10px] font-bold text-white shadow-sm`}>
                {logo.name.charAt(0)}
              </div>
              <span className="text-sm font-semibold text-muted-foreground/70">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
