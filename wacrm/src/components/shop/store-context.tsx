"use client";

import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";
import { toast } from "sonner";
import type { StoreConfig, Product, CartItem, StoreStatus } from "./types";

interface StoreContextType {
  store: StoreConfig | null;
  products: Product[];
  loading: boolean;
  hasAccess: boolean;
  searchQuery: string;
  selectedCategory: string;
  cart: CartItem[];
  cartOpen: boolean;
  selectedProduct: Product | null;
  checkoutName: string;
  checkoutPhone: string;
  checkoutAddress: string;
  paymentMethod: "upi" | "cod";
  animateCart: boolean;
  categories: string[];
  filteredProducts: Product[];
  cartSubtotal: number;
  deliveryFee: number;
  handlingFee: number;
  cartTotal: number;
  cartItemCount: number;
  storeStatus: StoreStatus;
  setStore: (store: StoreConfig) => void;
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setHasAccess: (hasAccess: boolean) => void;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (cat: string) => void;
  setCartOpen: (open: boolean) => void;
  setSelectedProduct: (p: Product | null) => void;
  setCheckoutName: (n: string) => void;
  setCheckoutPhone: (p: string) => void;
  setCheckoutAddress: (a: string) => void;
  setPaymentMethod: (m: "upi" | "cod") => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  getItemQty: (productId: string) => number;
  clearCart: () => void;
  handleCheckout: () => void;
  handleShare: () => void;
  handleTrackOrder: () => void;
  handleCategorySelect: (cat: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<StoreConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("upi");
  const [animateCart, setAnimateCart] = useState(false);

  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category)));
    return ["All", ...list];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.sale_price * item.quantity, 0);
  }, [cart]);

  const deliveryFee = cartSubtotal > 300 ? 0 : 15;
  const handlingFee = 5;
  const cartTotal = cartSubtotal + deliveryFee + handlingFee;

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const storeStatus = useMemo<StoreStatus>(() => {
    const currentHour = new Date().getHours();
    const isOpen = currentHour >= 9 && currentHour < 22;
    return {
      isOpen,
      text: isOpen ? "Open Now" : "Closed",
      subtext: isOpen ? "Closes at 10:00 PM" : "Opens at 9:00 AM",
    };
  }, []);

  const addToCart = useCallback((product: Product) => {
    setAnimateCart(true);
    setTimeout(() => setAnimateCart(false), 500);
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx > -1) {
        return prev.map((item, i) => i === idx ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === productId);
      if (idx === -1) return prev;
      if (prev[idx].quantity === 1) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item, i) => i === idx ? { ...item, quantity: item.quantity - 1 } : item);
    });
  }, []);

  const getItemQty = useCallback((productId: string) => {
    const item = cart.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart([]);
    toast.success("Cart cleared");
  }, []);

  const handleCategorySelect = useCallback((cat: string) => {
    setSelectedCategory(cat);
    setTimeout(() => {
      const element = document.getElementById(`category-${cat}`);
      if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Store link copied!");
  }, []);

  const handleTrackOrder = useCallback(() => {
    const waNumber = store?.whatsapp_number || "";
    const cleanNumber = waNumber.replace(/\D/g, "");
    const msg = "Hi! I would like to check the status of my order.";
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  }, [store]);

  const handleCheckout = useCallback(() => {
    if (!checkoutName.trim()) { toast.error("Please enter your name."); return; }
    if (!checkoutPhone.trim()) { toast.error("Please enter your phone number."); return; }
    if (!/^[\d\s\+\-\(\)]{10,}$/.test(checkoutPhone)) { toast.error("Please enter a valid phone number (min 10 digits)."); return; }
    if (!checkoutAddress.trim()) { toast.error("Please enter your delivery address."); return; }

    try {
      const itemsList = cart.map((i) => `• ${i.product.name} x${i.quantity}`).join("\n");
      const upiNote = paymentMethod === "upi" && store?.upi_id
        ? `\n\n(Please send payment to UPI ID: ${store.upi_id})`
        : "";
      const waMessage = `New Order\n\nName: ${checkoutName.trim()}\nPhone: ${checkoutPhone.trim()}\nAddress: ${checkoutAddress.trim()}\n\nItems:\n${itemsList}\n\nTotal: ₹${cartTotal}\nPayment Method: ${paymentMethod === "upi" ? "UPI" : "Cash on Delivery"}${upiNote}`;
      const cleanNumber = (store?.whatsapp_number || "").replace(/\D/g, "");
      window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(waMessage)}`, "_blank");
      toast.success("Order sent to WhatsApp!");
      setCart([]);
      setCartOpen(false);
      setCheckoutName("");
      setCheckoutPhone("");
      setCheckoutAddress("");
    } catch (err: any) {
      toast.error(err.message || "Failed to place order.");
    }
  }, [checkoutName, checkoutPhone, checkoutAddress, cart, cartTotal, paymentMethod, store]);

  const value = {
    store, products, loading, hasAccess, searchQuery, selectedCategory,
    cart, cartOpen, selectedProduct, checkoutName, checkoutPhone, checkoutAddress,
    paymentMethod, animateCart, categories, filteredProducts,
    cartSubtotal, deliveryFee, handlingFee, cartTotal, cartItemCount, storeStatus,
    setStore, setProducts, setLoading, setHasAccess, setSearchQuery,
    setSelectedCategory, setCartOpen, setSelectedProduct,
    setCheckoutName, setCheckoutPhone, setCheckoutAddress, setPaymentMethod,
    addToCart, removeFromCart, getItemQty, clearCart,
    handleCheckout, handleShare, handleTrackOrder, handleCategorySelect,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
