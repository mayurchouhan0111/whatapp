"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/shop", label: "Store" },
  { href: "/pricing", label: "Pricing" },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", onScroll)
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
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 16px rgba(16,185,129,0.35), 0 0 36px rgba(16,185,129,0.15); }
          50%       { box-shadow: 0 0 26px rgba(16,185,129,0.6),  0 0 60px rgba(16,185,129,0.25); }
        }
        .aurora-line {
          background: linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6, #ec4899, #10b981);
          background-size: 400% 400%;
          animation: aurora 5s ease infinite;
        }
        .nav-lnk {
          position: relative;
          transition: color 0.25s;
          color: rgba(17,24,39,0.65);
          font-family: var(--font-sans), 'DM Sans', sans-serif;
          font-weight: 500;
          letter-spacing: -0.01em;
        }
        .nav-lnk::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 0%;
          height: 2px;
          background: linear-gradient(90deg, #10b981, #3b82f6);
          border-radius: 99px;
          transition: width 0.35s cubic-bezier(.4,0,.2,1);
        }
        .nav-lnk:hover { color: #111827; }
        .nav-lnk:hover::after { width: 100%; }

        .cta-btn {
          position: relative;
          background: #0fe875;
          border-radius: 12px;
          border: 2px solid #111827;
          padding: 8px 22px;
          font-size: 14px;
          font-weight: 700;
          font-family: var(--font-sans), 'DM Sans', sans-serif;
          letter-spacing: -0.01em;
          color: #111827;
          box-shadow: 3px 3px 0px 0px #111827;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: inline-block;
        }
        .cta-btn:hover {
          transform: translate(2px, 2px);
          box-shadow: 1px 1px 0px 0px #111827;
        }
        .cta-btn:active {
          transform: translate(3px, 3px);
          box-shadow: 0px 0px 0px 0px #111827;
        }

        .logo-img {
          transition: filter 0.3s ease, transform 0.3s ease;
          filter: drop-shadow(0 0 4px rgba(16,185,129,0.15));
        }
        .logo-img:hover {
          filter: drop-shadow(0 0 14px rgba(16,185,129,0.45));
          transform: scale(1.03);
        }

        /* Default (not scrolled) — soft rounded rect */
        .glass-bar {
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow:
            0 4px 24px rgba(0,0,0,0.08),
            0 1px 0 rgba(255,255,255,0.9) inset;
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-radius: 16px;
          transition: border-radius 0.5s cubic-bezier(.4,0,.2,1),
                      box-shadow 0.4s ease,
                      background 0.4s ease;
        }

        /* Scrolled — pill / circular */
        .glass-bar.is-scrolled {
          border-radius: 9999px;
          background: rgba(255,255,255,0.88);
          box-shadow:
            0 8px 32px rgba(0,0,0,0.12),
            0 1px 0 rgba(255,255,255,1) inset;
        }

        .sign-in-btn {
          color: rgba(17,24,39,0.55);
          font-size: 14px;
          font-weight: 500;
          padding: 7px 16px;
          border-radius: 10px;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
        }
        .sign-in-btn:hover {
          color: #111827;
          background: rgba(0,0,0,0.05);
        }

        .mobile-glass {
          background: rgba(255,255,255,0.96);
          border: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 16px 48px rgba(0,0,0,0.12);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 16px;
        }
      `}</style>

      {/* Aurora top strip */}
      <div className="aurora-line fixed inset-x-0 top-0 z-50 h-[2px]" />

      <header className="fixed inset-x-0 top-[2px] z-40">
        <div
          className={`mx-auto transition-all duration-500 ${
            scrolled ? "max-w-5xl px-3 mt-2" : "max-w-7xl px-4 mt-3"
          }`}
        >
          {/* Main bar */}
          <div className={`glass-bar relative flex items-center justify-between px-3 py-0 overflow-hidden ${scrolled ? "is-scrolled" : ""}`}>

            {/* Logo */}
            <Link href="/" className="relative z-10 flex items-center shrink-0">
              <img
                src="/logo.png"
                alt="Vbuild CRM"
                className="logo-img object-contain"
                style={{ height: "68px", width: "210px" }}
              />
            </Link>

            {/* Nav links — centered */}
            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-lnk text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-2 relative z-10">
              <Link href="/login">
                <span className="sign-in-btn">Sign in</span>
              </Link>
              <Link href="/signup">
                <span className="cta-btn">Get Started →</span>
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden relative z-10 flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-black/5 hover:text-gray-800 transition-all"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile dropdown */}
          {open && (
            <div className="mobile-glass mt-2 overflow-hidden">
              <nav className="flex flex-col gap-1 p-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-gray-600 hover:bg-black/5 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-2 flex gap-2 border-t border-black/6 pt-3">
                  <Link href="/login" onClick={() => setOpen(false)} className="flex-1">
                    <button className="w-full rounded-xl border border-black/10 py-2.5 text-sm font-medium text-gray-600 hover:bg-black/5 hover:text-gray-900 transition-colors">
                      Sign in
                    </button>
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="flex-1">
                    <span className="cta-btn flex items-center justify-center w-full py-2.5 cursor-pointer text-center">
                      Get Started
                    </span>
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
