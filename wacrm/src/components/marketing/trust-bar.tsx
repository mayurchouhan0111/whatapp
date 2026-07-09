const LOGOS = [
  "ShopIndia", "GreenMart", "CraftBazaar", "BlissBeauty", "DesiDukaan",
  "UrbanGarden", "QuickServe", "EduPrime", "MediConnect", "TechCorp",
  "GrowthX", "FreshWorks",
  "ShopIndia", "GreenMart", "CraftBazaar", "BlissBeauty", "DesiDukaan",
  "UrbanGarden", "QuickServe", "EduPrime", "MediConnect", "TechCorp",
  "GrowthX", "FreshWorks",
]

export function TrustBar() {
  return (
    <section className="border-y border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-gray-400">
          Loved and trusted by 500+ growing businesses
        </p>
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />
          <div className="flex overflow-hidden">
            <div className="flex animate-marquee items-center gap-14 whitespace-nowrap">
              {LOGOS.map((name, i) => (
                <div key={`${name}-${i}`} className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 text-[10px] font-bold text-emerald-600 shadow-sm">
                    {name.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-gray-400">{name}</span>
                </div>
              ))}
            </div>
            <div className="flex animate-marquee items-center gap-14 whitespace-nowrap" aria-hidden="true">
              {LOGOS.map((name, i) => (
                <div key={`${name}-${i}-dup`} className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 text-[10px] font-bold text-emerald-600 shadow-sm">
                    {name.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-gray-400">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
