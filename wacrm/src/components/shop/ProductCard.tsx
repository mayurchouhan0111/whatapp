"use client";

import { useStore } from "./store-context";
import { ShoppingBag, Plus, Minus, Sparkles, Eye } from "lucide-react";
import type { Product } from "./types";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, removeFromCart, getItemQty, setSelectedProduct } = useStore();
  const qty = getItemQty(product.id);
  const discount = product.regular_price > product.sale_price
    ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
    : 0;
  const savings = product.regular_price - product.sale_price;

  const badge = !product.is_available
    ? { label: "Sold Out", class: "bg-[#EF4444]" }
    : discount >= 30
    ? { label: `🔥 ${discount}% OFF`, class: "bg-[#F59E0B]" }
    : discount > 0
    ? { label: `${discount}% OFF`, class: "bg-[#F59E0B]" }
    : null;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0]/40 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col min-w-0">
      {badge && (
        <span className={`absolute top-2.5 left-2.5 text-[9px] font-bold text-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-md z-10 ${badge.class}`}>
          {badge.label}
        </span>
      )}

      <button
        onClick={() => setSelectedProduct(product)}
        aria-label="Quick view"
        className="absolute top-2.5 right-2.5 size-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-[#E2E8F0] hover:bg-white cursor-pointer z-10 translate-y-0.5 group-hover:translate-y-0"
      >
        <Eye className="size-3 text-[#64748B]" />
      </button>

      <div onClick={() => setSelectedProduct(product)} className="cursor-pointer">
        <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] overflow-hidden">
          {product.image_url ? (
            <>
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="img-vignette" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="size-8 text-[#CBD5E1]" />
            </div>
          )}
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1 gap-1">
        <span className="text-[9px] font-semibold text-[#94A3B8] uppercase tracking-wider truncate">
          {product.category}
        </span>

        <h4
          onClick={() => setSelectedProduct(product)}
          className="text-[13px] font-semibold text-[#0B0F19] leading-snug line-clamp-2 cursor-pointer hover:text-[#128C7E] transition-colors"
        >
          {product.name}
        </h4>

        <div className="flex items-baseline gap-1.5 mt-auto">
          <span className="text-lg sm:text-xl font-extrabold text-[#0B0F19] tracking-tight">₹{product.sale_price}</span>
          {product.regular_price > product.sale_price && (
            <span className="text-[10px] text-[#94A3B8] line-through">₹{product.regular_price}</span>
          )}
        </div>

        {savings > 0 && (
          <p className="text-[10px] font-semibold text-[#22C55E] flex items-center gap-1">
            <Sparkles className="size-2.5" />
            Save ₹{savings}
          </p>
        )}

        <div className="pt-1.5">
          {product.is_available ? (
            qty === 0 ? (
              <button
                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                className="w-full flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#128C7E] active:scale-[0.97] text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm shadow-[#25D366]/20 cursor-pointer"
              >
                <Plus className="size-3.5" />
                Add to Cart
              </button>
            ) : (
              <div className="flex items-center justify-between bg-[#25D366] text-white rounded-xl px-2 py-1 shadow-sm">
                <button
                  onClick={(e) => { e.stopPropagation(); removeFromCart(product.id); }}
                  aria-label="Decrease quantity"
                  className="size-7 text-white hover:bg-white/20 rounded-lg flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="text-xs font-bold min-w-6 text-center tabular-nums">{qty}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                  aria-label="Increase quantity"
                  className="size-7 text-white hover:bg-white/20 rounded-lg flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            )
          ) : (
            <button
              disabled
              className="w-full flex items-center justify-center gap-1.5 bg-[#F1F5F9] text-[#94A3B8] text-xs font-semibold px-3 py-2 rounded-xl cursor-not-allowed"
            >
              <ShoppingBag className="size-3.5" />
              Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
