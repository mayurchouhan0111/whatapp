"use client";

import { useStore } from "./store-context";
import { ShoppingBag, MessageCircle, Star, Clock, ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const promoSlides = [
  { icon: "🚚", title: "Free Delivery", subtitle: "On orders above ₹300", color: "from-emerald-500/10 to-emerald-600/5" },
  { icon: "🔥", title: "Today's Deals", subtitle: "Up to 40% off on bestsellers", color: "from-amber-500/10 to-amber-600/5" },
  { icon: "⚡", title: "Instant Checkout", subtitle: "Order in seconds via WhatsApp", color: "from-blue-500/10 to-blue-600/5" },
  { icon: "🎉", title: "New Arrivals", subtitle: "Fresh products added weekly", color: "from-purple-500/10 to-purple-600/5" },
];

export default function HeroSection() {
  const { store, storeStatus, filteredProducts, setSelectedProduct } = useStore();
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlideIdx((i) => (i + 1) % promoSlides.length), 4000);
    return () => clearInterval(t);
  }, []);

  if (!store) return null;

  const firstProduct = filteredProducts.length > 0 ? filteredProducts[0] : null;
  const slide = promoSlides[slideIdx];

  return (
    <section className="bg-[#FAFAF9] border-b border-[#E2E8F0]/30 overflow-hidden">
      <div className="w-[95%] max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 py-5 lg:py-8">
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${storeStatus.isOpen ? "bg-[#22C55E] animate-pulse-soft" : "bg-[#EF4444]"}`} />
              <span className={`text-xs font-semibold ${storeStatus.isOpen ? "text-[#128C7E]" : "text-[#EF4444]"}`}>
                {storeStatus.isOpen ? "Open Now · Closes at 10 PM" : "Closed"}
              </span>
            </div>

            <h1 className="text-[28px] sm:text-4xl lg:text-5xl font-extrabold text-[#0B0F19] leading-[1.08] tracking-tight">
              {store.name}
            </h1>

            <p className="text-sm sm:text-base text-[#64748B] max-w-lg leading-relaxed">
              Order directly on WhatsApp. Fast delivery, secure ordering, and instant confirmation.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#0B0F19] bg-white px-3 py-1.5 rounded-full border border-[#E2E8F0]/70 shadow-sm">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                4.8 <span className="text-[#64748B] font-normal">(200+)</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[#64748B] bg-white px-3 py-1.5 rounded-full border border-[#E2E8F0]/70 shadow-sm">
                <Clock className="size-3.5 text-[#25D366]" />
                {storeStatus.subtext}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] active:scale-[0.97] text-white font-bold text-sm sm:text-base px-6 py-3 rounded-2xl transition-all shadow-lg shadow-[#25D366]/30 cursor-pointer"
              >
                <ShoppingBag className="size-4" />
                Start Shopping
                <ArrowRight className="size-4" />
              </button>
              {firstProduct && (
                <button
                  onClick={() => setSelectedProduct(firstProduct)}
                  className="inline-flex items-center gap-2 bg-white hover:bg-[#FAFAF9] active:scale-[0.97] text-[#0B0F19] font-semibold text-sm sm:text-base px-5 py-3 rounded-2xl transition-all border border-[#E2E8F0]/80 shadow-sm cursor-pointer"
                >
                  <Sparkles className="size-4 text-[#25D366]" />
                  Quick View
                </button>
              )}
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-white border border-[#E2E8F0]/50 shadow-sm min-h-[68px]">
              <div className="flex items-center gap-3 px-4 py-3.5 transition-all duration-500">
                <span className="text-2xl">{slide.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0B0F19]">{slide.title}</p>
                  <p className="text-xs text-[#64748B]">{slide.subtitle}</p>
                </div>
                <ChevronRight className="size-4 text-[#94A3B8] shrink-0" />
              </div>
              <div className="absolute bottom-0 inset-x-0 flex justify-center gap-1 pb-2">
                {promoSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlideIdx(i)}
                    className={`size-1.5 rounded-full transition-all cursor-pointer ${
                      i === slideIdx ? "bg-[#25D366] w-3" : "bg-[#CBD5E1]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {firstProduct && firstProduct.image_url && (
              <div className="relative rounded-2xl overflow-hidden bg-[#FAFAF9] border border-[#E2E8F0]/50 shadow-sm group">
                <div className="aspect-[16/9] sm:aspect-[16/10] overflow-hidden">
                  <img
                    src={firstProduct.image_url}
                    alt={firstProduct.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="img-vignette" />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold text-white bg-[#25D366] px-2 py-1 rounded-lg shadow-md flex items-center gap-1">
                    <Sparkles className="size-3" /> Featured
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-bold text-sm drop-shadow-lg truncate">{firstProduct.name}</p>
                  <p className="text-white/90 text-xs font-semibold drop-shadow">₹{firstProduct.sale_price}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border border-[#E2E8F0]/50 shadow-sm">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="size-9 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-sm">
                    {["A","K","R","S"][i]}
                  </div>
                ))}
              </div>
              <div className="border-l border-[#E2E8F0]/60 pl-3">
                <p className="text-sm font-bold text-[#0B0F19]">500+ Orders</p>
                <p className="text-[11px] text-[#64748B]">Delivered this month</p>
              </div>
              <div className="ml-auto">
                <div className="size-9 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                  <MessageCircle className="size-4 text-[#25D366]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
