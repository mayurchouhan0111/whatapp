"use client";

import { getRandomPromo } from "./category-icons";
import { ArrowRight } from "lucide-react";

interface PromoBannerProps {
  index?: number;
}

export default function PromoBanner({ index = 0 }: PromoBannerProps) {
  const promo = getRandomPromo(index);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0]/40 p-5 sm:p-6 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <span className="text-3xl sm:text-4xl drop-shadow-sm">{promo.icon}</span>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#0B0F19]">{promo.label}</h3>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">{promo.description}</p>
        </div>
      </div>
      <button
        onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })}
        className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#128C7E] active:scale-[0.95] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-[#25D366]/20 cursor-pointer shrink-0"
      >
        Shop Now
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}
