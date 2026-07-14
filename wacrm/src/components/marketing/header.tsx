"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/shop", label: "Store" },
  { href: "/reviews", label: "Reviews" },
  { href: "/pricing", label: "Pricing" },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <style>{`
        @keyframes aurora {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .aurora-line {
          background: linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6, #ec4899, #10b981);
          background-size: 400% 400%;
          animation: aurora 5s ease infinite;
        }
        .nav-link {
          position: relative;
          color: rgba(17,24,39,0.6);
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: -0.01em;
          transition: color 0.2s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          inset: auto 0 0 0;
          height: 2px;
          background: linear-gradient(90deg, #10b981, #3b82f6);
          border-radius: 99px;
          transform: scaleX(0);
          transition: transform 0.35s cubic-bezier(.4,0,.2,1);
        }
        .nav-link:hover { color: #111827; }
        .nav-link:hover::after { transform: scaleX(1); }

        .nav-link-mobile {
          display: block;
          padding: 0.625rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(17,24,39,0.6);
          transition: all 0.15s;
        }
        .nav-link-mobile:hover {
          background: rgba(0,0,0,0.04);
          color: #111827;
        }

        .glass-bar {
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-radius: 14px;
          transition: border-radius 0.5s cubic-bezier(.4,0,.2,1),
                      box-shadow 0.4s ease,
                      background 0.4s ease,
                      padding 0.4s ease;
        }
        .glass-bar.is-scrolled {
          border-radius: 9999px;
          background: rgba(255,255,255,0.85);
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }

        .mobile-glass {
          background: rgba(255,255,255,0.96);
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 16px 48px rgba(0,0,0,0.1);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 14px;
        }
      `}</style>

      {/* Aurora strip */}
      <div className="aurora-line fixed inset-x-0 top-0 z-50 h-[2px]" />

      <header className="fixed inset-x-0 top-[2px] z-40">
        <div
          className={`mx-auto transition-all duration-500 ${
            scrolled ? "max-w-4xl px-3 mt-2" : "max-w-6xl px-5 mt-3"
          }`}
        >
          <div className={`glass-bar flex items-center justify-between px-4 ${scrolled ? "is-scrolled px-5" : ""}`} style={{ paddingTop: "0.625rem", paddingBottom: "0.625rem" }}>

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <img
                src="/logo.png"
                alt="Vbuild CRM"
                className="object-contain transition-transform duration-300 hover:scale-105"
                style={{ height: "40px", width: "auto" }}
              />
            </Link>

            {/* Nav — centered via flex spread */}
            <nav className="hidden md:flex items-center gap-9">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="nav-link">
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-500 transition-all hover:bg-black/5 hover:text-gray-900"
              >
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.8125rem" }}>
                Get Started
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-all hover:bg-black/5 hover:text-gray-800"
              aria-label={open ? "Close" : "Menu"}
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          {/* Mobile menu */}
          {open && (
            <div className="mobile-glass mt-2 overflow-hidden">
              <div className="p-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="nav-link-mobile"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-2 flex gap-2 border-t border-black/5 pt-3 px-1">
                  <Link href="/login" onClick={() => setOpen(false)} className="flex-1">
                    <div className="w-full rounded-xl border border-black/10 py-2.5 text-center text-sm font-medium text-gray-600 transition-colors hover:bg-black/5">
                      Sign in
                    </div>
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="flex-1">
                    <div className="btn-primary w-full text-center py-2.5" style={{ fontSize: "0.8125rem" }}>
                      Get Started
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
