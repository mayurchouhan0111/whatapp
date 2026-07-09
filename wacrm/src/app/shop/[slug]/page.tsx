"use client";

import { useEffect, useState, useMemo, use } from "react";
import { Poppins } from "next/font/google";
import { toast } from "sonner";
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Minus, 
  Clock, 
  ArrowRight, 
  QrCode, 
  AlertCircle,
  X,
  Sparkles,
  Share2
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
});


interface StoreConfig {
  id: string;
  account_id: string;
  slug: string;
  name: string;
  description: string;
  banner_url: string;
  whatsapp_number: string;
  upi_id: string;
  is_active: boolean;
}

interface Product {
  id: string;
  account_id: string;
  name: string;
  description: string;
  regular_price: number;
  sale_price: number;
  image_url: string;
  category: string;
  is_available: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const [store, setStore] = useState<StoreConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [animateCart, setAnimateCart] = useState(false);

  // Checkout Form
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("upi");

  useEffect(() => {
    if (!slug) return;
    fetchStorefront();
  }, [slug]);

  async function fetchStorefront() {
    try {
      setLoading(true);

      // 1. Fetch config
      const { data: config, error: configError } = await supabase
        .from("store_configs")
        .select("*")
        .eq("slug", slug.trim().toLowerCase())
        .eq("is_active", true)
        .maybeSingle();

      if (configError || !config) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // 2. Fetch license/gating check from account
      const { data: storeActive, error: storeActiveError } = await supabase.rpc(
        "is_store_active",
        { p_account_id: config.account_id }
      );

      if (storeActiveError || !storeActive) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      setStore(config);

      // 3. Fetch products
      const { data: prodList, error: prodError } = await supabase
        .from("products")
        .select("*")
        .eq("account_id", config.account_id)
        .eq("is_available", true)
        .order("position", { ascending: true });

      if (prodError) throw prodError;

      setProducts(prodList || []);
      setHasAccess(true);

    } catch (err) {
      console.error("Storefront load error:", err);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }

  // Categories list derived from products
  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category)));
    return ["All", ...list];
  }, [products]);

  // Filtered Products grid
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Cart calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.sale_price * item.quantity, 0);
  }, [cart]);

  const deliveryFee = cartSubtotal > 300 ? 0 : 15;
  const handlingFee = 5;
  const cartTotal = cartSubtotal + deliveryFee + handlingFee;

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Dynamic Store open/closed calculation (9:00 AM - 10:00 PM local time)
  const storeStatus = useMemo(() => {
    const currentHour = new Date().getHours();
    const isOpen = currentHour >= 9 && currentHour < 22;
    return {
      isOpen,
      text: isOpen ? "Open Now" : "Closed",
      subtext: isOpen ? "Closes at 10:00 PM" : "Opens at 9:00 AM",
    };
  }, []);

  // Add / Modify items
  function addToCart(product: Product) {
    setAnimateCart(true);
    setTimeout(() => setAnimateCart(false), 500);
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx > -1) {
        return prev.map((item, i) => i === idx ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === productId);
      if (idx === -1) return prev;
      if (prev[idx].quantity === 1) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item, i) => i === idx ? { ...item, quantity: item.quantity - 1 } : item);
    });
  }

  function getItemQty(productId: string) {
    const item = cart.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  }

  function handleCategorySelect(cat: string) {
    setSelectedCategory(cat);
    // Smooth scroll to the category container if it exists
    setTimeout(() => {
      const element = document.getElementById(`category-${cat}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }

  function handleCheckout() {
    if (!checkoutName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!checkoutPhone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }
    if (!/^[\d\s\+\-\(\)]{10,}$/.test(checkoutPhone)) {
      toast.error("Please enter a valid phone number (min 10 digits).");
      return;
    }
    if (!checkoutAddress.trim()) {
      toast.error("Please enter your delivery address.");
      return;
    }

    try {
      const itemsList = cart
        .map((i) => `• ${i.product.name} x${i.quantity}`)
        .join("\n");
      
      const upiNote = paymentMethod === "upi" && store?.upi_id
        ? `\n\n(Please send payment to UPI ID: ${store.upi_id})`
        : "";
      
      const waMessage = `New Order\n\n` +
        `Name: ${checkoutName.trim()}\n` +
        `Phone: ${checkoutPhone.trim()}\n` +
        `Address: ${checkoutAddress.trim()}\n\n` +
        `Items:\n${itemsList}\n\n` +
        `Total: ₹${cartTotal}\n` +
        `Payment Method: ${paymentMethod === "upi" ? "UPI" : "Cash on Delivery"}${upiNote}`;

      const waNumber = store?.whatsapp_number || "";
      const cleanNumber = waNumber.replace(/\D/g, "");
      const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(waMessage)}`;
      window.open(waUrl, "_blank");

      toast.success("Order details sent to WhatsApp!");

      // Clear state
      setCart([]);
      setCartOpen(false);
      setCheckoutName("");
      setCheckoutPhone("");
      setCheckoutAddress("");

    } catch (err: any) {
      console.error("Checkout failed:", err);
      toast.error(err.message || "Failed to place order.");
    }
  }





  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col antialiased animate-pulse">
        {/* Skeleton Header */}
        <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/60 shadow-sm px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-slate-200 rounded-xl" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-3 w-36 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="hidden sm:block flex-1 max-w-md h-9 bg-slate-200 rounded-xl" />
            <div className="h-9 w-24 bg-slate-200 rounded-xl" />
          </div>
        </header>

        {/* Skeleton Hero */}
        <div className="w-full h-32 md:h-48 bg-slate-200" />

        {/* Skeleton Body Layout */}
        <div className="max-w-6xl w-full mx-auto flex flex-1 overflow-hidden">
          {/* Skeleton Sidebar */}
          <aside className="w-40 md:w-48 bg-white border-r border-slate-200/60 p-4 space-y-3 hidden md:block">
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="h-7 w-full bg-slate-200 rounded-lg" />
            <div className="h-7 w-full bg-slate-200 rounded-lg" />
            <div className="h-7 w-full bg-slate-200 rounded-lg" />
          </aside>

          {/* Skeleton Main Grid */}
          <main className="flex-1 p-4 sm:p-6 space-y-6">
            <div className="h-5 w-32 bg-slate-200 rounded" />
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/50 p-3 space-y-3">
                  <div className="w-full h-32 bg-slate-100 rounded-xl" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-1/2 bg-slate-100 rounded" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-4 w-12 bg-slate-200 rounded" />
                    <div className="h-7 w-16 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!hasAccess || !store) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 font-sans px-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Store Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm mt-2">
          This store doesn&apos;t exist or is currently unavailable. Check the link and try again.
        </p>
      </div>
    );
  }

  // Success Screen removed as flow ends directly on WhatsApp redirect

  return (
    <div className={`${poppins.className} min-h-screen bg-slate-50 font-sans flex flex-col antialiased`}>
      {/* Premium Sticky Header with Frosted Glass effect */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between gap-4">
          {/* Logo & Storefront Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 bg-[#ff3269] rounded-xl flex items-center justify-center font-black text-white shrink-0 shadow-sm border border-rose-200/20">
              <ShoppingBag className="size-5 text-white" />
            </div>
            <div className="min-w-0 leading-tight">
              <h1 className="font-extrabold text-slate-800 text-base truncate flex items-center gap-1.5">
                {store.name}
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  storeStatus.isOpen 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" 
                    : "bg-rose-50 text-rose-700 border border-rose-200/60"
                }`}>
                  <span className={`size-1.5 rounded-full mr-1 ${storeStatus.isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  {storeStatus.text}
                </span>
              </h1>
              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Clock className="size-3 text-[#ff3269] shrink-0" />
                {storeStatus.subtext}
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden sm:flex flex-1 max-w-md relative">
            <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products or items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 hover:bg-slate-200/50 focus:bg-white text-sm text-slate-800 pl-10 pr-4 py-2 rounded-xl outline-none border border-transparent focus:border-slate-200/80 transition-all"
            />
          </div>

          {/* Track Order Button */}
          <button
            onClick={() => {
              const waNumber = store?.whatsapp_number || "";
              const cleanNumber = waNumber.replace(/\D/g, "");
              const trackMessage = `Hi! I would like to check the status of my order.`;
              const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(trackMessage)}`;
              window.open(waUrl, "_blank");
            }}
            className="flex items-center gap-1.5 text-slate-500 hover:text-[#ff3269] hover:bg-[#f3ebff] font-semibold text-xs px-3 py-2 rounded-xl transition-all shrink-0 cursor-pointer"
            title="Track Order on WhatsApp"
          >
            <Clock className="size-4" />
            <span className="hidden sm:inline">Track Order</span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Store link copied!");
            }}
            className="flex items-center gap-1.5 text-slate-500 hover:text-[#ff3269] hover:bg-[#f3ebff] font-semibold text-xs px-3 py-2 rounded-xl transition-all shrink-0 cursor-pointer"
            title="Copy store link"
          >
            <Share2 className="size-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setCartOpen(true)}
            className={`flex items-center gap-2 bg-[#ff3269] hover:bg-[#e01a53] text-white font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-rose-600/10 shrink-0 relative cursor-pointer duration-300 transform ${
              animateCart ? "scale-110 shadow-lg ring-4 ring-[#ff3269]/30 rotate-2" : ""
            }`}
          >
            <ShoppingBag className="size-4" />
            <span className="text-xs hidden md:inline">My Cart</span>
            {cartItemCount > 0 && (
              <span className="bg-rose-600 text-white text-[10px] font-bold size-5 rounded-full flex items-center justify-center absolute -top-1.5 -right-1.5 animate-bounce shadow-md">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile search bar */}
      <div className="sm:hidden bg-white border-b border-slate-200/60 p-3 px-4">
        <div className="relative">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 focus:bg-white text-sm text-slate-800 pl-10 pr-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-slate-200/80 transition-all"
          />
        </div>
      </div>

      {/* Hero Banner */}
      {store.banner_url && (
        <div className="w-full h-32 md:h-48 overflow-hidden relative shrink-0 border-b border-slate-200/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={store.banner_url}
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-4">
            <p className="text-white text-xs md:text-sm font-semibold max-w-md drop-shadow">
              {store.description}
            </p>
          </div>
        </div>
      )}

      {/* Catalog Layout */}
      <div className="max-w-6xl w-full mx-auto flex flex-1 overflow-hidden">
        {/* Category Left Sidebar */}
        <aside className="w-40 md:w-48 bg-white border-r border-slate-200/60 overflow-y-auto hidden md:block shrink-0">
          <nav className="p-3 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 py-1.5">Categories</p>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#f3ebff] backdrop-blur-sm text-[#3c006b] border-l-4 border-[#3c006b] font-extrabold shadow-sm"
                    : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </aside>

        {/* Products catalog list */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Category tabs for mobile */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-2 shrink-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#ff3269] text-white shadow-sm shadow-rose-600/10"
                    : "bg-white text-slate-500 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShoppingBag className="size-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-700">No matching items</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                We couldn&apos;t find any items matching &quot;{searchQuery}&quot;. Try adjusting your keywords.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Group products by category when view is 'All' */}
              {selectedCategory === "All" ? (
                Array.from(new Set(filteredProducts.map((p) => p.category))).map((cat) => {
                  const catProds = filteredProducts.filter((p) => p.category === cat);
                  return (
                    <div key={cat} id={`category-${cat}`} className="space-y-3 scroll-mt-20">
                      <h3 className="font-extrabold text-slate-800 text-sm tracking-wide border-b border-slate-200/50 pb-1.5 flex items-center justify-between">
                        <span>{cat}</span>
                        <span className="text-[10px] font-bold text-[#ff3269] bg-[#f3ebff] px-2 py-0.5 rounded-full">{catProds.length} items</span>
                      </h3>
                      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {catProds.map((product) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            qty={getItemQty(product.id)}
                            onAdd={() => addToCart(product)}
                            onRemove={() => removeFromCart(product.id)}
                            onSelect={() => setSelectedProduct(product)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="space-y-3" id={`category-${selectedCategory}`}>
                  <h3 className="font-extrabold text-slate-800 text-sm tracking-wide border-b border-slate-200/50 pb-1.5">
                    {selectedCategory} ({filteredProducts.length} items)
                  </h3>
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        qty={getItemQty(product.id)}
                        onAdd={() => addToCart(product)}
                        onRemove={() => removeFromCart(product.id)}
                        onSelect={() => setSelectedProduct(product)}
                      />
                    ))}
                  </div>
                </div>
              )}
        </div>
      )}

        </main>
      </div>

      {cartItemCount > 0 && !cartOpen && (
        <div className="md:hidden fixed bottom-6 inset-x-4 z-30 bg-[#0c831f] text-white rounded-2xl shadow-[0_12px_40px_rgba(12,131,31,0.35)] border border-emerald-500/20 p-3.5 flex items-center justify-between animate-in slide-in-from-bottom-8 duration-300">
          <div className="flex items-center gap-3">
            {/* Overlapping Thumbnails */}
            <div className="flex -space-x-3.5 overflow-hidden">
              {cart.slice(0, 3).map((item) => (
                <div key={item.product.id} className="size-8 rounded-full border-2 border-[#0c831f] bg-slate-50 overflow-hidden shrink-0 shadow-md">
                  {item.product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product.image_url} alt={item.product.name} className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center bg-teal-50 text-[#0c831f] font-bold text-[10px]">
                      {item.product.name.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total Details */}
            <div className="flex flex-col leading-tight border-l border-white/20 pl-3">
              <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">
                {cartItemCount} Item{cartItemCount === 1 ? "" : "s"}
              </span>
              <span className="text-sm font-black flex items-baseline gap-1">
                ₹{cartSubtotal}
                <span className="text-[9px] font-normal text-emerald-200">Subtotal</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-1.5 bg-white text-[#0c831f] hover:bg-slate-50 active:scale-95 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
          >
            View Cart
            <ArrowRight className="size-3.5 text-[#0c831f]" />
          </button>
        </div>
      )}

      {/* Cart Sheet Sidebar */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/60 shrink-0">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <ShoppingBag className="size-5 text-teal-600" />
                My Cart <span className="text-xs font-normal text-slate-500">({cartItemCount} item{cartItemCount === 1 ? "" : "s"})</span>
              </h3>
<button onClick={() => setCartOpen(false)} className="rounded-full p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X className="size-5" />
                </button>
                {/* Clear Cart button */}
                <button
                  onClick={() => {
                    setCart([]);
                    toast.success('Cart cleared');
                  }}
                  className="ml-2 text-xs text-rose-600 hover:text-rose-800"
                  title="Clear Cart"
                >
                  Clear Cart
                </button>
            </div>

            {/* Content list */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <ShoppingBag className="size-16 text-slate-200 mb-2" />
                <h4 className="font-bold text-slate-700">Your cart is empty</h4>
                <p className="text-xs text-slate-400 mt-1">Add items from the store catalog to check out.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Items Summary</p>
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-3 border-b border-slate-100 pb-3 items-center">
                      <div className="size-12 rounded bg-slate-50 flex items-center justify-center border border-slate-200/50 shrink-0 overflow-hidden">
                        {item.product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.product.image_url} alt={item.product.name} className="size-full object-cover" />
                        ) : (
                          <ShoppingBag className="size-5 text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="text-sm font-semibold text-slate-800 truncate">{item.product.name}</p>
                        <p className="text-xs text-slate-500 mt-1">₹{item.product.sale_price} each</p>
                      </div>
                      <div className="flex items-center gap-2 border border-teal-600/30 rounded-lg p-0.5 bg-teal-50/50">
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="size-6 text-teal-800 hover:bg-teal-600 hover:text-white rounded flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="text-xs font-bold text-teal-800 px-1">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item.product)}
                          className="size-6 text-teal-800 hover:bg-teal-600 hover:text-white rounded flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <div className="text-sm font-bold text-slate-800 shrink-0 pl-1 w-14 text-right">
                        ₹{item.product.sale_price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Details Form */}
                <div className="space-y-4 pt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Details</p>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="cust_name" className="text-slate-600 text-xs">Full Name</Label>
                      <Input
                        id="cust_name"
                        placeholder="John Doe"
                        value={checkoutName}
                        onChange={(e: any) => setCheckoutName(e.target.value)}
                        className="text-slate-800 bg-white border-slate-200 focus:text-slate-800 focus:bg-white placeholder:text-slate-400 focus-visible:ring-teal-600 focus-visible:border-teal-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="cust_phone" className="text-slate-600 text-xs">WhatsApp Phone Number</Label>
                      <Input
                        id="cust_phone"
                        placeholder="e.g. +91 98765 43210"
                        value={checkoutPhone}
                        onChange={(e: any) => setCheckoutPhone(e.target.value)}
                        className="text-slate-800 bg-white border-slate-200 focus:text-slate-800 focus:bg-white placeholder:text-slate-400 focus-visible:ring-teal-600 focus-visible:border-teal-600"
                      />
                      {checkoutPhone && !/^[\d\s\+\-\(\)]{10,}$/.test(checkoutPhone) && (
                        <p className="text-[10px] text-rose-600 mt-0.5">Enter a valid phone number (min 10 digits)</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="cust_addr" className="text-slate-600 text-xs">Delivery Address</Label>
                      <Textarea
                        id="cust_addr"
                        placeholder="Flat no., Street name, Landmark, Pin code"
                        rows={3}
                        value={checkoutAddress}
                        onChange={(e: any) => setCheckoutAddress(e.target.value)}
                        className="text-slate-800 bg-white border-slate-200 focus:text-slate-800 focus:bg-white placeholder:text-slate-400 focus-visible:ring-teal-600 focus-visible:border-teal-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Option selection */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Mode</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod("upi")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                        paymentMethod === "upi"
                          ? "border-teal-600 bg-teal-50/50 text-teal-800 font-bold"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <QrCode className="size-5 mb-1" />
                      <span className="text-xs">UPI (Instant)</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("cod")}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                        paymentMethod === "cod"
                          ? "border-teal-600 bg-teal-50/50 text-teal-800 font-bold"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <ShoppingBag className="size-5 mb-1" />
                      <span className="text-xs">Cash on Delivery</span>
                    </button>
                  </div>
                </div>

                {/* Bill details */}
                <div className="space-y-2.5 border-t border-slate-100 pt-4 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-800">₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className="font-semibold text-slate-800">
                      {deliveryFee === 0 ? <span className="text-teal-600">FREE</span> : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handling Fee</span>
                    <span className="font-semibold text-slate-800">₹{handlingFee}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-800 pt-2 border-t border-slate-100">
                    <span>Grand Total</span>
                    <span>₹{cartTotal}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Checkout CTA */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0 space-y-2">
                {/* Copy Summary Shortcut */}
                <button
                  type="button"
                  onClick={() => {
                    const itemsList = cart
                      .map((i) => `• ${i.product.name} x${i.quantity}`)
                      .join("\n");
                    const summary = `Order Summary:\nName: ${checkoutName.trim() || 'Guest'}\nPhone: ${checkoutPhone.trim() || 'N/A'}\nAddress: ${checkoutAddress.trim() || 'N/A'}\n\nItems:\n${itemsList}\n\nTotal: ₹${cartTotal}\nPayment Method: ${paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}`;
                    navigator.clipboard.writeText(summary);
                    toast.success("Order summary copied to clipboard!");
                  }}
                  className="w-full text-slate-500 hover:text-slate-700 text-xs font-semibold py-2.5 text-center cursor-pointer transition-all border border-dashed border-slate-200 hover:border-slate-300 rounded-xl bg-white"
                >
                  Copy Order Summary (Clipboard Backup)
                </button>

                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-between rounded-xl bg-teal-600 text-white font-extrabold px-5 py-3.5 hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/10 cursor-pointer"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold text-teal-200">TOTAL AMOUNT</span>
                    <span className="text-sm font-black">₹{cartTotal}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Place Order</span>
                    <ArrowRight className="size-4" />
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Glassmorphic Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden font-sans">
          {/* Background Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
            onClick={() => setSelectedProduct(null)}
          />
          
          {/* Modal Content Card */}
          <div className="relative max-w-lg w-full bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-300 max-h-[90vh]">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="absolute top-4 right-4 z-10 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full p-2 backdrop-blur transition-colors cursor-pointer shadow-md"
            >
              <X className="size-4" />
            </button>

            {/* Product Image Panel */}
            <div className="w-full h-64 md:h-85 bg-slate-50 flex items-center justify-center relative select-none shrink-0 border-b border-slate-100">
              {selectedProduct.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={selectedProduct.image_url} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShoppingBag className="size-16 text-slate-300" />
              )}
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {selectedProduct.regular_price > selectedProduct.sale_price && (
                  <span className="bg-green-600 text-[10px] font-black text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
                    <Sparkles className="size-3 text-yellow-300 animate-pulse" />
                    {Math.round(((selectedProduct.regular_price - selectedProduct.sale_price) / selectedProduct.regular_price) * 100)}% OFF
                  </span>
                )}
                {!selectedProduct.is_available && (
                  <span className="bg-rose-600 text-[10px] font-black text-white px-2.5 py-1 rounded-lg shadow-md">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Product Info Panel */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div>
                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-200/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {selectedProduct.category}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 mt-2 leading-tight">
                  {selectedProduct.name}
                </h2>
              </div>

              {selectedProduct.description && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Details</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              {/* Price Details & Actions */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-slate-800">
                      ₹{selectedProduct.sale_price}
                    </span>
                    {selectedProduct.regular_price > selectedProduct.sale_price && (
                      <span className="text-xs text-slate-400 line-through">
                        MRP ₹{selectedProduct.regular_price}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add / Modify controls */}
                <div className="flex items-center">
                  {selectedProduct.is_available ? (
                    getItemQty(selectedProduct.id) === 0 ? (
                      <button
                        onClick={() => addToCart(selectedProduct)}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm px-6 py-3 rounded-2xl transition-all shadow-lg shadow-teal-600/10 hover:shadow-teal-600/20 cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 bg-teal-600 text-white font-bold p-1 rounded-2xl shadow-lg shadow-teal-600/10">
                        <button
                          onClick={() => removeFromCart(selectedProduct.id)}
                          className="size-9 text-white hover:bg-teal-700 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="text-sm font-extrabold min-w-4 text-center">{getItemQty(selectedProduct.id)}</span>
                        <button
                          onClick={() => addToCart(selectedProduct)}
                          className="size-9 text-white hover:bg-teal-700 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                    )
                  ) : (
                    <button
                      disabled
                      className="bg-slate-200 text-slate-400 font-extrabold text-sm px-6 py-3 rounded-2xl cursor-not-allowed border border-slate-300/40"
                    >
                      Out of Stock
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Reusable Product Card
function ProductCard({
  product,
  qty,
  onAdd,
  onRemove,
  onSelect,
}: {
  product: Product;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  onSelect: () => void;
}) {
  const discount = product.regular_price > product.sale_price
    ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/50 p-3 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
       {discount > 0 && (
         <span className="absolute top-2.5 left-2.5 bg-green-600 text-[9px] font-black text-white px-2 py-0.5 rounded-lg flex items-center gap-0.5 shadow-sm z-10">
           <Sparkles className="size-2 text-yellow-300 animate-pulse" />
           {discount}% OFF
         </span>
       )}
       {!product.is_available && (
         <span className="absolute top-2.5 right-2.5 bg-rose-600 text-[9px] font-black text-white px-2 py-0.5 rounded-lg shadow-sm z-10">
           Out of Stock
         </span>
       )}

      {/* Image and details trigger modal */}
      <div onClick={onSelect} className="cursor-pointer flex-1 flex flex-col">
        {/* Image preview */}
        <div className="w-full h-32 bg-slate-50 flex items-center justify-center rounded-xl overflow-hidden border border-slate-100 select-none">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="size-full object-cover transform group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <ShoppingBag className="size-8 text-slate-200" />
          )}
        </div>

        {/* Info details */}
        <div className="mt-3 flex-1 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-teal-600 transition-colors" title={product.name}>
              {product.name}
            </h4>
            {product.description && (
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-normal">
                {product.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Price & Add button */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-100/50">
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-800">
            ₹{product.sale_price}
          </span>
          {product.regular_price > product.sale_price && (
            <span className="text-[9px] text-slate-400 line-through">
              MRP ₹{product.regular_price}
            </span>
          )}
        </div>

         {/* Morphing ADD button */}
         {product.is_available ? (
           qty === 0 ? (
             <button
               onClick={onAdd}
               className="border-2 border-teal-600 text-teal-600 bg-white font-extrabold text-xs px-3.5 py-1 rounded-xl hover:bg-teal-600 hover:text-white transition-all duration-200 shadow-sm cursor-pointer"
             >
               ADD
             </button>
           ) : (
             <div className="flex items-center gap-1.5 bg-teal-600 text-white font-bold p-0.5 rounded-xl shadow-sm">
               <button
                 onClick={onRemove}
                 className="size-6 text-white hover:bg-teal-700 rounded flex items-center justify-center cursor-pointer"
               >
                 <Minus className="size-3" />
               </button>
               <span className="text-xs font-extrabold min-w-4 text-center">{qty}</span>
               <button
                 onClick={onAdd}
                 className="size-6 text-white hover:bg-teal-700 rounded flex items-center justify-center cursor-pointer"
               >
                 <Plus className="size-3" />
               </button>
             </div>
           )
         ) : (
           <button
             disabled
             className="border-2 border-rose-600 text-rose-600 bg-white font-extrabold text-xs px-3.5 py-1 rounded-xl opacity-60 cursor-not-allowed"
           >
             Out of Stock
           </button>
         )}
      </div>
    </div>
  );
}
