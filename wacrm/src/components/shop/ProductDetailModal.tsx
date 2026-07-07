"use client";

import { useStore } from "./store-context";
import { X, Minus, Plus, ShoppingBag, Sparkles, CheckCircle, Truck, Star, Hash } from "lucide-react";
import { useState } from "react";

export default function ProductDetailModal() {
  const { selectedProduct, setSelectedProduct, addToCart, removeFromCart, getItemQty } = useStore();
  const [showFullDesc, setShowFullDesc] = useState(false);

  if (!selectedProduct) return null;

  const product = selectedProduct;
  const qty = getItemQty(product.id);
  const discount = product.regular_price > product.sale_price
    ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100) : 0;
  const savings = product.regular_price - product.sale_price;

  const features = [
    { icon: CheckCircle, text: "100% Authentic Product" },
    { icon: Truck, text: "Free delivery above ₹300" },
    { icon: Star, text: "4.8 ⭐ Top Rated Product" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-[#0B0F19]/50 backdrop-blur-sm animate-fade-in"
        onClick={() => setSelectedProduct(null)}
      />

      <div className="relative w-full sm:max-w-lg bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-y-auto max-h-[92vh] animate-slide-in-bottom flex flex-col">
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm text-[#0B0F19] rounded-full p-2 shadow-lg hover:bg-white transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        <div className="relative w-full aspect-square bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] flex-shrink-0">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="size-16 text-[#E2E8F0]" />
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-[#F59E0B] text-xs font-bold text-white px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md">
              <Sparkles className="size-3.5" />
              {discount}% OFF
            </span>
          )}
          {!product.is_available && (
            <span className="absolute top-4 left-4 bg-[#EF4444] text-xs font-bold text-white px-3 py-1.5 rounded-lg shadow-md">
              Out of Stock
            </span>
          )}
        </div>

        <div className="p-5 flex-1 space-y-4">
          <div>
            <span className="text-[10px] font-semibold text-[#128C7E] bg-[#E7F9E8] px-2.5 py-1 rounded-full uppercase tracking-wider">
              {product.category}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[#0B0F19] mt-2 leading-tight">{product.name}</h2>
          </div>

          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0B0F19] tracking-tight">₹{product.sale_price}</span>
            {product.regular_price > product.sale_price && (
              <>
                <span className="text-sm text-[#94A3B8] line-through">₹{product.regular_price}</span>
                <span className="text-xs font-semibold text-[#22C55E] bg-[#E7F9E8] px-2 py-0.5 rounded-full">
                  Save ₹{savings}
                </span>
              </>
            )}
          </div>

          {product.is_available && (
            <div className="flex items-center gap-2 text-xs font-medium text-[#22C55E]">
              <span className="size-2 rounded-full bg-[#22C55E]" />
              In Stock
            </div>
          )}

          {product.description && (
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Description</h4>
                {product.description.length > 100 && (
                  <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="text-[11px] text-[#128C7E] font-medium hover:underline cursor-pointer"
                  >
                    {showFullDesc ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
              <p className={`text-sm text-[#64748B] leading-relaxed mt-1.5 ${!showFullDesc && product.description.length > 100 ? 'line-clamp-3' : ''}`}>
                {product.description}
              </p>
            </div>
          )}

          <div className="border-t border-[#E2E8F0]/50 pt-4 space-y-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.text} className="flex items-center gap-2.5">
                  <Icon className="size-4 text-[#25D366]" />
                  <span className="text-xs text-[#64748B]">{f.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-[#E2E8F0]/50 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
          {product.is_available ? (
            qty === 0 ? (
              <button
                onClick={() => { addToCart(product); setSelectedProduct(null); }}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] active:scale-[0.97] text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="size-4" />
                Add to Cart · ₹{product.sale_price}
              </button>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl p-1 border border-[#E2E8F0]/70">
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="size-10 text-[#128C7E] hover:bg-[#E7F9E8] rounded-lg flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="text-base font-bold text-[#0B0F19] min-w-8 text-center tabular-nums">{qty}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="size-10 text-[#128C7E] hover:bg-[#E7F9E8] rounded-lg flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <span className="text-lg font-extrabold text-[#0B0F19]">₹{product.sale_price * qty}</span>
              </div>
            )
          ) : (
            <button
              disabled
              className="w-full bg-[#F1F5F9] text-[#94A3B8] font-semibold text-sm py-3.5 rounded-2xl cursor-not-allowed"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
