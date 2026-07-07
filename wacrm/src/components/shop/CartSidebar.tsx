"use client";

import { useStore } from "./store-context";
import {
  X, ShoppingBag, Minus, Plus, Trash2, ArrowRight,
  QrCode, Wallet, MessageCircle, Clock, User, Phone, MapPin, CreditCard,
} from "lucide-react";

export default function CartSidebar() {
  const {
    cart, cartOpen, cartItemCount, cartSubtotal, deliveryFee,
    handlingFee, cartTotal, checkoutName, setCheckoutName,
    checkoutPhone, setCheckoutPhone, checkoutAddress, setCheckoutAddress,
    paymentMethod, setPaymentMethod, addToCart, removeFromCart,
    clearCart, setCartOpen, handleCheckout,
  } = useStore();

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-[#0B0F19]/50 backdrop-blur-sm transition-opacity"
        onClick={() => setCartOpen(false)}
      />
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-[#FAFAF9] flex flex-col shadow-2xl animate-slide-in-right">
        <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-[#E2E8F0]/60 shrink-0">
          <h3 className="font-bold text-[#0B0F19] text-base flex items-center gap-2">
            <ShoppingBag className="size-5 text-[#25D366]" />
            Your Cart
            <span className="text-xs font-normal text-[#64748B]">({cartItemCount} item{cartItemCount === 1 ? "" : "s"})</span>
          </h3>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="flex items-center gap-1 text-xs text-[#EF4444] hover:text-[#DC2626] font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
              >
                <Trash2 className="size-3" />
                Clear
              </button>
            )}
            <button
              onClick={() => setCartOpen(false)}
              className="rounded-full p-1.5 hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#0B0F19] cursor-pointer transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="size-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-[#E2E8F0]/40">
              <ShoppingBag className="size-8 text-[#CBD5E1]" />
            </div>
            <h4 className="font-bold text-[#0B0F19]">Your cart is empty</h4>
            <p className="text-xs text-[#64748B] mt-1.5 max-w-xs">
              Looks like you haven&apos;t added anything yet.
            </p>
            <button
              onClick={() => setCartOpen(false)}
              className="mt-6 bg-[#25D366] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#128C7E] transition-all cursor-pointer shadow-sm"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {cart.map((item) => {
                const savings = item.product.regular_price - item.product.sale_price;
                return (
                  <div key={item.product.id} className="flex gap-3 items-center p-3 rounded-2xl bg-white border border-[#E2E8F0]/40 shadow-sm">
                    <div className="size-16 rounded-xl bg-[#FAFAF9] flex items-center justify-center border border-[#E2E8F0]/20 overflow-hidden shrink-0">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt={item.product.name} className="size-full object-cover" />
                      ) : (
                        <ShoppingBag className="size-6 text-[#CBD5E1]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#0B0F19] truncate">{item.product.name}</p>
                      <p className="text-lg font-extrabold text-[#0B0F19] mt-0.5">₹{item.product.sale_price}</p>
                      {savings > 0 && (
                        <p className="text-[10px] font-medium text-[#22C55E]">Save ₹{savings}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1 bg-[#FAFAF9] border border-[#E2E8F0]/50 rounded-lg p-0.5">
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            aria-label="Decrease quantity"
                            className="size-7 text-[#64748B] hover:bg-white hover:text-[#0B0F19] rounded-md flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="text-xs font-bold text-[#0B0F19] min-w-6 text-center tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item.product)}
                            aria-label="Increase quantity"
                            className="size-7 text-[#64748B] hover:bg-white hover:text-[#0B0F19] rounded-md flex items-center justify-center transition-colors cursor-pointer active:scale-90"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-extrabold text-[#0B0F19]">₹{item.product.sale_price * item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-4 space-y-4 pb-4">
              <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0]/40 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-[#25D366]" />
                  <h4 className="text-xs font-bold text-[#0B0F19] uppercase tracking-wider">Delivery Details</h4>
                </div>
                <div className="space-y-2.5">
                  <div className="relative">
                    <User className="size-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      placeholder="Full Name"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full text-sm text-[#0B0F19] bg-[#FAFAF9] border border-[#E2E8F0] rounded-xl pl-10 pr-3.5 py-2.5 outline-none focus:border-[#25D366]/50 focus:ring-2 focus:ring-[#25D366]/10 transition-all placeholder:text-[#94A3B8]"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="size-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      placeholder="WhatsApp Number"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      className="w-full text-sm text-[#0B0F19] bg-[#FAFAF9] border border-[#E2E8F0] rounded-xl pl-10 pr-3.5 py-2.5 outline-none focus:border-[#25D366]/50 focus:ring-2 focus:ring-[#25D366]/10 transition-all placeholder:text-[#94A3B8]"
                    />
                  </div>
                  {checkoutPhone && !/^[\d\s\+\-\(\)]{10,}$/.test(checkoutPhone) && (
                    <p className="text-[10px] text-[#EF4444] flex items-center gap-1">
                      <span className="size-1 rounded-full bg-[#EF4444]" />
                      Enter a valid phone number (min 10 digits)
                    </p>
                  )}
                  <div className="relative">
                    <MapPin className="size-4 text-[#94A3B8] absolute left-3 top-3 pointer-events-none" />
                    <textarea
                      placeholder="Delivery Address"
                      rows={2}
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      className="w-full text-sm text-[#0B0F19] bg-[#FAFAF9] border border-[#E2E8F0] rounded-xl pl-10 pr-3.5 py-2.5 outline-none focus:border-[#25D366]/50 focus:ring-2 focus:ring-[#25D366]/10 transition-all placeholder:text-[#94A3B8] resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0]/40 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-4 text-[#25D366]" />
                  <h4 className="text-xs font-bold text-[#0B0F19] uppercase tracking-wider">Payment Method</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("upi")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all cursor-pointer ${
                      paymentMethod === "upi"
                        ? "border-[#25D366] bg-[#E7F9E8] text-[#128C7E] font-semibold ring-1 ring-[#25D366]/20"
                        : "border-[#E2E8F0] text-[#64748B] hover:bg-[#FAFAF9] hover:border-[#25D366]/30"
                    }`}
                  >
                    <QrCode className={`size-5 mb-1 ${paymentMethod === "upi" ? "text-[#128C7E]" : "text-[#94A3B8]"}`} />
                    <span className="text-xs font-semibold">UPI</span>
                    <span className="text-[9px] text-[#64748B] mt-0.5">GPay, PhonePe, Paytm</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("cod")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all cursor-pointer ${
                      paymentMethod === "cod"
                        ? "border-[#25D366] bg-[#E7F9E8] text-[#128C7E] font-semibold ring-1 ring-[#25D366]/20"
                        : "border-[#E2E8F0] text-[#64748B] hover:bg-[#FAFAF9] hover:border-[#25D366]/30"
                    }`}
                  >
                    <Wallet className={`size-5 mb-1 ${paymentMethod === "cod" ? "text-[#128C7E]" : "text-[#94A3B8]"}`} />
                    <span className="text-xs font-semibold">Cash on Delivery</span>
                    <span className="text-[9px] text-[#64748B] mt-0.5">Pay when delivered</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0]/40 shadow-sm space-y-2.5">
                <div className="flex items-center gap-2">
                  <Wallet className="size-4 text-[#25D366]" />
                  <h4 className="text-xs font-bold text-[#0B0F19] uppercase tracking-wider">Order Summary</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Subtotal</span>
                    <span className="font-semibold text-[#0B0F19]">₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Delivery</span>
                    <span className="font-semibold text-[#0B0F19]">
                      {deliveryFee === 0 ? <span className="text-[#22C55E] font-bold">FREE</span> : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Handling</span>
                    <span className="font-semibold text-[#0B0F19]">₹{handlingFee}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] text-[#F59E0B] bg-amber-50 rounded-lg px-2.5 py-1.5">
                      <Clock className="size-3" />
                      Add ₹{300 - cartSubtotal} more for free delivery
                    </div>
                  )}
                  <div className="flex justify-between text-base font-extrabold text-[#0B0F19] pt-2.5 border-t border-[#E2E8F0]/60">
                    <span>Grand Total</span>
                    <span className="text-lg">₹{cartTotal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <div className="p-4 border-t border-[#E2E8F0] bg-white shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-between rounded-2xl bg-[#25D366] hover:bg-[#128C7E] active:scale-[0.97] text-white font-bold px-5 py-4 transition-all shadow-lg shadow-[#25D366]/30 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="size-5" />
                <span className="text-sm">Order via WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold">₹{cartTotal}</span>
                <ArrowRight className="size-4" />
              </div>
            </button>
            <p className="text-[10px] text-[#64748B] text-center mt-2">
              You&apos;ll be redirected to WhatsApp to confirm
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
