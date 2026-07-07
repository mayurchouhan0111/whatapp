"use client";

import { useStore } from "./store-context";
import { ShoppingBag, ArrowRight } from "lucide-react";

export default function FloatingCartBar() {
  const { cart, cartItemCount, cartSubtotal, cartOpen, setCartOpen } = useStore();

  if (cartItemCount === 0 || cartOpen) return null;

  return (
    <div className="fixed bottom-5 inset-x-4 z-30 md:hidden animate-slide-up">
      <div
        className="glass-card rounded-2xl p-3.5 flex items-center justify-between"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.04)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-[#25D366] to-[#128C7E] shadow-md">
            <ShoppingBag className="size-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium text-[#64748B]">{cartItemCount} Item{cartItemCount === 1 ? "" : "s"}</span>
            <span className="text-lg font-extrabold text-[#0B0F19]">₹{cartSubtotal}</span>
          </div>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#128C7E] active:scale-[0.95] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#25D366]/30"
        >
          View Cart
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
