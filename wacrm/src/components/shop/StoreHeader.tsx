"use client";

import { useStore } from "./store-context";
import { Store, Search, X, ShoppingCart, Share2, Star, Truck, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function StoreHeader() {
  const {
    store, storeStatus, searchQuery, setSearchQuery,
    cartItemCount, animateCart, setCartOpen, handleShare,
  } = useStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!store) return null;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-2xl border-b border-[#E2E8F0]/50 shadow-sm"
          : "bg-white border-b border-[#E2E8F0]/30"
      }`}
    >
      <div className="w-[95%] max-w-[1600px] mx-auto px-4">
        <div className={`flex items-center justify-between gap-3 transition-all duration-300 ${
          scrolled ? "py-2" : "pt-3 pb-2"
        }`}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative shrink-0">
              <div className={`bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-lg shadow-[#25D366]/25 transition-all duration-300 ${
                scrolled ? "size-9 rounded-xl" : "size-11 rounded-2xl"
              }`}>
                <Store className={`text-white transition-all duration-300 ${scrolled ? "size-4" : "size-5"}`} />
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white shadow-sm ${
                storeStatus.isOpen ? "bg-[#22C55E]" : "bg-[#EF4444]"
              }`} />
            </div>
            <div className="min-w-0">
              <h1 className={`font-bold text-[#0B0F19] truncate transition-all duration-300 ${
                scrolled ? "text-sm" : "text-base"
              }`}>{store.name}</h1>
              {!scrolled && (
                <div className="flex items-center gap-1.5 text-xs mt-0.5">
                  <span className={`inline-flex items-center gap-1 font-medium ${
                    storeStatus.isOpen ? "text-[#22C55E]" : "text-[#EF4444]"
                  }`}>
                    <span className={`size-1.5 rounded-full ${storeStatus.isOpen ? "bg-[#22C55E]" : "bg-[#EF4444]"}`} />
                    {storeStatus.text}
                  </span>
                  <span className="text-[#CBD5E1]">•</span>
                  <span className="text-[#64748B] flex items-center gap-0.5">
                    <Truck className="size-3 text-[#25D366]" />
                    Free
                  </span>
                  <span className="text-[#CBD5E1]">•</span>
                  <span className="text-[#64748B] flex items-center gap-0.5">
                    <Star className="size-3 fill-yellow-400 text-yellow-400" />
                    4.8
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleShare}
              className="flex items-center justify-center size-9 text-[#64748B] hover:text-[#128C7E] hover:bg-[#E7F9E8] rounded-xl transition-all cursor-pointer"
              title="Share store"
            >
              <Share2 className="size-4" />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className={`flex items-center justify-center size-9 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl transition-all shadow-lg shadow-[#25D366]/25 relative cursor-pointer duration-300 ${
                animateCart ? "animate-cart-bounce" : ""
              }`}
            >
              <ShoppingCart className="size-4" />
              {cartItemCount > 0 && (
                <span className="bg-white text-[#128C7E] text-[9px] font-bold size-4 rounded-full flex items-center justify-center absolute -top-1 -right-1 shadow-md border border-[#25D366]/20">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="pb-3">
          <div className="relative">
            <Search className="size-4 text-[#64748B]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={scrolled ? `Search in ${store.name}...` : "Search products..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFC] hover:bg-white focus:bg-white text-sm text-[#0B0F19] pl-10 pr-9 py-2.5 rounded-2xl outline-none border border-[#E2E8F0]/70 focus:border-[#25D366]/50 focus:ring-2 focus:ring-[#25D366]/10 transition-all placeholder:text-[#64748B]/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0B0F19] cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
