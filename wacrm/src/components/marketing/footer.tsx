import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-col md:flex-row md:justify-between gap-12 md:gap-8">
          
          {/* Column 1: Brand & Socials */}
          <div className="max-w-sm">
            <Link href="/" className="inline-block">
              <img 
                src="/logo.png" 
                alt="Vbuild CRM" 
                className="h-10 w-auto object-contain" 
              />
            </Link>
            
            <p className="mt-8 text-sm leading-relaxed text-gray-500">
              Our platform helps you centralize your WhatsApp sales, support, and customer data — all in one simple, real-time dashboard built for growing businesses.
            </p>

            <div className="mt-8 flex items-center gap-3">
              {[1, 2, 3].map((i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                  aria-label="X (formerly Twitter)"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links Section (Right side) */}
          <div className="flex flex-col sm:flex-row gap-12 sm:gap-24 md:mr-16">
            
            {/* Column 2: PRODUCT */}
            <div>
              <h4 className="mb-6 text-[11px] font-bold tracking-wider text-gray-800">
                PRODUCT
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/#features" className="text-sm text-gray-500 transition-colors hover:text-gray-900">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-sm text-gray-500 transition-colors hover:text-gray-900">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-sm text-gray-500 transition-colors hover:text-gray-900">
                    Storefront
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: LEGAL & AUTH */}
            <div>
              <h4 className="mb-6 text-[11px] font-bold tracking-wider text-gray-800">
                LEGAL & AUTH
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/privacy-policy" className="text-sm text-gray-500 transition-colors hover:text-gray-900">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-sm text-gray-500 transition-colors hover:text-gray-900">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-sm text-gray-500 transition-colors hover:text-gray-900">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>
            
          </div>
        </div>
      </div>
    </footer>
  )
}
