const BRANDS = [
  "ShopIndia",
  "GreenMart",
  "CraftBazaar",
  "BlissBeauty",
  "DesiDukaan",
  "UrbanGarden",
  "QuickServe",
  "EduPrime",
  "MediConnect",
  "TechCorp",
]

export function ShopTrustBar() {
  return (
    <section className="border-y border-border/20 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-gray-900">
          Trusted by store owners across India
        </p>
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />
          <div className="edge-fade flex overflow-hidden">
            <div className="flex animate-marquee items-center gap-24 whitespace-nowrap">
              {BRANDS.map((name, i) => (
                <div key={`${name}-${i}`} className="flex items-center gap-3 group hover:opacity-80 transition-opacity duration-300">
<img
                      src={`/brand-logos/${name.toLowerCase()}.svg`}
                      alt={name}
                      className="h-10 w-10 rounded-lg object-contain filter grayscale hover:filter-none transition-transform duration-300 hover:scale-105"
                    />
                  <span className="text-sm font-semibold text-gray-900">{name}</span>
                </div>
              ))}
            </div>
            <div className="flex animate-marquee items-center gap-24 whitespace-nowrap" aria-hidden="true">
              {BRANDS.map((name, i) => (
                <div key={`${name}-${i}-dup`} className="flex items-center gap-3 group hover:opacity-80 transition-opacity duration-300">
<img
                      src={`/brand-logos/${name.toLowerCase()}.svg`}
                      alt={name}
                      className="h-10 w-10 rounded-lg object-contain filter grayscale hover:filter-none transition-transform duration-300 hover:scale-105"
                    />
                  <span className="text-sm font-semibold text-gray-900">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
