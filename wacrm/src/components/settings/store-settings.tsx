"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  Store, 
  Loader2, 
  Lock, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  ExternalLink,
  Package,
  ShoppingBag,
  Sparkles,
  Upload,
  FileText,
  Download
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SettingsPanelHead } from "./settings-panel-head";

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
  position: number;
}

export function StoreSettings() {
  const supabase = createClient();
  const router = useRouter();
  const { accountId, user, profileLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);

  // Limits
  const [maxProducts, setMaxProducts] = useState(0);
  const [maxOrders, setMaxOrders] = useState(0);

  // Store config states
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const [storeForm, setStoreForm] = useState({
    slug: "",
    name: "",
    description: "",
    banner_url: "",
    whatsapp_number: "",
    upi_id: "",
    is_active: true,
  });
  const [savingStore, setSavingStore] = useState(false);

  // Product states
  const [products, setProducts] = useState<Product[]>([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    regular_price: "",
    sale_price: "",
    image_url: "",
    category: "General",
    is_available: true,
  });

  const [siteUrl, setSiteUrl] = useState("");

  // CSV Import states
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [csvProducts, setCsvProducts] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  // Orders states
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<"catalog" | "orders">("catalog");

  useEffect(() => {
    if (activeTab === "orders" && accountId) {
      loadOrders();
    }
  }, [activeTab, accountId]);

  async function handleChatWithCustomer(order: any) {
    if (!order.contact_id) {
      toast.error("This order is not associated with a contact.");
      return;
    }

    try {
      // 1. Check if a conversation already exists for this contact
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("contact_id", order.contact_id)
        .maybeSingle();

      if (existingConv) {
        // Redirect directly inside CRM Inbox
        router.push(`/inbox?c=${existingConv.id}`);
        return;
      }

      // 2. Create one if it does not exist
      if (!user) {
        toast.error("User session not found.");
        return;
      }

      const { data: newConv, error: createError } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          contact_id: order.contact_id,
          status: "open",
        })
        .select()
        .single();

      if (createError || !newConv) {
        throw createError || new Error("Failed to create conversation.");
      }

      // Redirect inside CRM Inbox
      router.push(`/inbox?c=${newConv.id}`);
    } catch (err) {
      console.error("Redirect to inbox error:", err);
      toast.error("Could not open chat room. Please check contact settings.");
    }
  }

  async function loadOrders() {
    try {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("account_id", accountId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Load orders error:", err);
      toast.error("Failed to load customer orders.");
    } finally {
      setLoadingOrders(false);
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;
      toast.success(`Order status updated to ${newStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
    } catch (err) {
      console.error("Update order status error:", err);
      toast.error("Failed to update order status.");
    }
  }

  async function updatePaymentStatus(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;
      toast.success(`Payment status updated to ${newStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newStatus } : o));
    } catch (err) {
      console.error("Update payment status error:", err);
      toast.error("Failed to update payment status.");
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSiteUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (profileLoading || !accountId || !user) return;
    loadStoreSettings();
  }, [profileLoading, accountId, user]);

  function parseCSV(text: string) {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

    const results: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values: string[] = [];
      let currentVal = '';
      let insideQuotes = false;
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentVal.trim().replace(/^"|"$/g, ''));
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim().replace(/^"|"$/g, ''));

      const item: any = {};
      headers.forEach((header, index) => {
        if (header) {
          item[header] = values[index] || '';
        }
      });
      results.push(item);
    }
    return results;
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const rows = parseCSV(text);
        if (rows.length === 0) {
          toast.error("No data found in the CSV file.");
          return;
        }

        const validProducts = [];
        for (const row of rows) {
          const name = (row.name || row.title || '').trim();
          if (!name) continue;

          const regPrice = parseFloat(row.regular_price || row.price || row.mrp || '0');
          const salePrice = parseFloat(row.sale_price || row.discount_price || row.price || '0');

          if (isNaN(regPrice) || regPrice <= 0) continue;
          if (isNaN(salePrice) || salePrice <= 0) continue;

          validProducts.push({
            name,
            description: (row.description || '').trim(),
            regular_price: regPrice,
            sale_price: salePrice > regPrice ? regPrice : salePrice,
            category: (row.category || 'General').trim(),
            image_url: (row.image_url || row.image || '').trim(),
            is_available: true,
          });
        }

        if (validProducts.length === 0) {
          toast.error("No valid products found in the CSV. Headers must include: name, regular_price, sale_price, category, description, image_url.");
          return;
        }

        setCsvProducts(validProducts);
        setImportDialogOpen(true);
      } catch (err) {
        console.error("CSV Parse error:", err);
        toast.error("Failed to parse CSV file.");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  async function handleImportCsv() {
    const remainingSlots = maxProducts - products.length;
    if (remainingSlots <= 0) {
      toast.error(`Your catalog is already at the limit of ${maxProducts} products. Upgrade your plan to import more.`);
      setImportDialogOpen(false);
      return;
    }

    const toImport = csvProducts.slice(0, remainingSlots);
    const skippedCount = csvProducts.length - toImport.length;

    try {
      setImporting(true);

      const payloads = toImport.map((p, idx) => ({
        account_id: accountId,
        name: p.name,
        description: p.description,
        regular_price: p.regular_price,
        sale_price: p.sale_price,
        image_url: p.image_url,
        category: p.category,
        is_available: p.is_available,
        position: products.length + idx,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("products")
        .insert(payloads);

      if (error) throw error;

      toast.success(
        skippedCount > 0
          ? `Successfully imported ${toImport.length} products. ${skippedCount} products were skipped due to plan limits.`
          : `Successfully imported all ${toImport.length} products!`
      );

      setImportDialogOpen(false);
      await loadStoreSettings();
    } catch (err) {
      console.error("Bulk import error:", err);
      toast.error("Failed to import products from CSV.");
    } finally {
      setImporting(false);
    }
  }

  function downloadSampleCsv() {
    const headers = "name,regular_price,sale_price,category,description,image_url\n";
    const sample1 = '"Chocolate Fudge Cake",600,499,"Cakes","Rich double chocolate fudge cake","https://images.unsplash.com/photo-1578985545062-69928b1d9587"\n';
    const sample2 = '"Sourdough Loaf",120,99,"Breads","Freshly baked crusty sourdough",""\n';
    const blob = new Blob([headers + sample1 + sample2], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "storefront_products_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function loadStoreSettings() {
    try {
      setLoading(true);

      // 1. Fetch account settings for limits and license checks
      const { data: account, error: accountError } = await supabase
        .from("accounts")
        .select("allow_store, store_expires_at, max_products, max_orders_per_month")
        .eq("id", accountId)
        .maybeSingle();

      if (accountError) throw accountError;

      if (!account || !account.allow_store) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Check expiry date
      if (account.store_expires_at) {
        const expiry = new Date(account.store_expires_at);
        if (expiry < new Date()) {
          setHasAccess(false);
          setExpiryDate(expiry.toLocaleDateString());
          setLoading(false);
          return;
        }
        setExpiryDate(expiry.toLocaleDateString());
      }

      setHasAccess(true);
      setMaxProducts(account.max_products || 20);
      setMaxOrders(account.max_orders_per_month || 50);

      // 2. Fetch Store Config
      const { data: config, error: configError } = await supabase
        .from("store_configs")
        .select("*")
        .eq("account_id", accountId)
        .maybeSingle();

      if (configError) throw configError;

      if (config) {
        setStoreConfig(config);
        setStoreForm({
          slug: config.slug || "",
          name: config.name || "",
          description: config.description || "",
          banner_url: config.banner_url || "",
          whatsapp_number: config.whatsapp_number || "",
          upi_id: config.upi_id || "",
          is_active: config.is_active ?? true,
        });
      } else {
        // Pre-fill defaults
        setStoreForm((prev) => ({
          ...prev,
          name: "The VBuild Store",
          slug: "vbuild-store-" + Math.floor(1000 + Math.random() * 9000),
        }));
      }

      // 3. Fetch products list
      const { data: prodList, error: prodError } = await supabase
        .from("products")
        .select("*")
        .eq("account_id", accountId)
        .order("category", { ascending: true })
        .order("position", { ascending: true });

      if (prodError) throw prodError;
      setProducts(prodList || []);

    } catch (err: any) {
      console.error("Store settings load error:", err.message || err);
      toast.error("Failed to load storefront settings.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveStore() {
    if (!storeForm.name.trim()) {
      toast.error("Store name is required.");
      return;
    }
    const cleanSlug = storeForm.slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    if (!cleanSlug) {
      toast.error("Valid store slug is required.");
      return;
    }

    try {
      setSavingStore(true);

      // Check slug uniqueness (if changed)
      if (!storeConfig || storeConfig.slug !== cleanSlug) {
        const { data: existing } = await supabase
          .from("store_configs")
          .select("id")
          .eq("slug", cleanSlug)
          .maybeSingle();

        if (existing) {
          toast.error("This URL slug is already taken. Please choose another one.");
          setSavingStore(false);
          return;
        }
      }

      const payload = {
        account_id: accountId,
        slug: cleanSlug,
        name: storeForm.name.trim(),
        description: storeForm.description.trim(),
        banner_url: storeForm.banner_url.trim(),
        whatsapp_number: storeForm.whatsapp_number.trim(),
        upi_id: storeForm.upi_id.trim(),
        is_active: storeForm.is_active,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (storeConfig) {
        const { error: updateError } = await supabase
          .from("store_configs")
          .update(payload)
          .eq("id", storeConfig.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("store_configs")
          .insert(payload);
        error = insertError;
      }

      if (error) throw error;

      toast.success("Store configurations updated successfully!");
      await loadStoreSettings();

    } catch (err) {
      console.error("Store save error:", err);
      toast.error("Failed to save store configurations.");
    } finally {
      setSavingStore(false);
    }
  }

  function openAddProduct() {
    if (products.length >= maxProducts) {
      toast.error(`Product limit reached (${products.length}/${maxProducts}). Please upgrade your plan.`);
      return;
    }
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      regular_price: "",
      sale_price: "",
      image_url: "",
      category: "General",
      is_available: true,
    });
    setProductModalOpen(true);
  }

  function openEditProduct(prod: Product) {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name || "",
      description: prod.description || "",
      regular_price: String(prod.regular_price),
      sale_price: String(prod.sale_price),
      image_url: prod.image_url || "",
      category: prod.category || "General",
      is_available: prod.is_available,
    });
    setProductModalOpen(true);
  }

  async function handleSaveProduct() {
    if (!productForm.name.trim()) {
      toast.error("Product name is required.");
      return;
    }
    const regPrice = parseFloat(productForm.regular_price);
    const salePrice = parseFloat(productForm.sale_price);

    if (isNaN(regPrice) || regPrice <= 0) {
      toast.error("Please enter a valid regular price.");
      return;
    }
    if (isNaN(salePrice) || salePrice <= 0) {
      toast.error("Please enter a valid sale price.");
      return;
    }
    if (salePrice > regPrice) {
      toast.error("Sale price cannot be higher than the Regular MRP.");
      return;
    }

    try {
      setSavingProduct(true);

      const payload = {
        account_id: accountId,
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        regular_price: regPrice,
        sale_price: salePrice,
        image_url: productForm.image_url.trim(),
        category: productForm.category.trim() || "General",
        is_available: productForm.is_available,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (editingProduct) {
        const { error: updateError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editingProduct.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("products")
          .insert(payload);
        error = insertError;
      }

      if (error) throw error;

      toast.success(editingProduct ? "Product updated." : "Product added to catalog!");
      setProductModalOpen(false);
      await loadStoreSettings();

    } catch (err) {
      console.error("Product save error:", err);
      toast.error("Failed to save product catalog item.");
    } finally {
      setSavingProduct(false);
    }
  }

  async function toggleProductAvailability(prod: Product) {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_available: !prod.is_available, updated_at: new Date().toISOString() })
        .eq("id", prod.id);

      if (error) throw error;

      setProducts(prev =>
        prev.map(p => p.id === prod.id ? { ...p, is_available: !p.is_available } : p)
      );
      toast.success(`${prod.name} is now ${!prod.is_available ? 'Available' : 'Unavailable'}`);
    } catch (err) {
      console.error("Product toggle error:", err);
      toast.error("Failed to update product status.");
    }
  }

  function confirmDeleteProduct(prod: Product) {
    setDeletingProduct(prod);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteProduct() {
    if (!deletingProduct) return;
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", deletingProduct.id);

      if (error) throw error;

      toast.success("Product deleted from catalog.");
      setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
    } catch (err) {
      console.error("Product delete error:", err);
      toast.error("Failed to delete product.");
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // locked screen
  if (!hasAccess) {
    return (
      <section className="max-w-2xl animate-in fade-in-50 duration-200">
        <SettingsPanelHead
          title="Online store"
          description="Build a direct, 1-page checkout storefront for your customers, connected to your WhatsApp."
        />
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="flex flex-row items-start gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
              <Lock className="size-5" />
            </div>
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                Storefront Access Locked
                {expiryDate && <span className="text-xs font-normal text-muted-foreground">(Expired: {expiryDate})</span>}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                The Online Storefront feature is locked or has expired for this workspace plan.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Unlock the **VBuild Premium Storefront Add-on** to allow your clients to buy directly from a premium web interface. Orders automatically synchronize as CRM Pipeline Deals, matching total values and building Contacts.
            </p>
            <div className="space-y-2 border-t border-border/40 pt-4">
              <div className="flex items-center gap-2">
                <Check className="size-4 text-green-500" />
                <span>Premium mobile checkout web interface</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-4 text-green-500" />
                <span>Dynamic UPI Payment QR codes & Cash on Delivery support</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-4 text-green-500" />
                <span>Instant automated WhatsApp receipt messages</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-4 text-green-500" />
                <span>Fully integrated with Pipelines & Contact profiles</span>
              </div>
            </div>
            <div className="pt-2">
              <Button disabled className="cursor-not-allowed bg-amber-500 text-white hover:bg-amber-600">
                Contact Administrator to Unlock
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6 max-w-4xl animate-in fade-in-50 duration-200">
      <SettingsPanelHead
        title="Online store"
        description="Configure your public storefront catalog, slugs, pricing, and QR payments."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Store settings configuration form */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Store className="size-4 text-primary" />
                Shop Settings
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Set up your public storefront URL and details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div>
                  <Label className="text-foreground font-semibold">Store Status</Label>
                  <p className="text-xs text-muted-foreground">Toggle store visibility</p>
                </div>
                <Switch
                  checked={storeForm.is_active}
                  onCheckedChange={(val) => setStoreForm(p => ({ ...p, is_active: val }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shop_name" className="text-foreground">Store Name</Label>
                <Input
                  id="shop_name"
                  placeholder="e.g. Baker's Delight"
                  value={storeForm.name}
                  onChange={(e) => setStoreForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shop_slug" className="text-foreground">URL Slug</Label>
                <Input
                  id="shop_slug"
                  placeholder="e.g. bakers-delight"
                  value={storeForm.slug}
                  onChange={(e) => setStoreForm(p => ({ ...p, slug: e.target.value }))}
                />
                {storeForm.slug.trim() && (
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>Preview:</span>
                    <a
                      href={`${siteUrl}/shop/${storeForm.slug.trim().toLowerCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-0.5"
                    >
                      shop/{storeForm.slug.trim().toLowerCase()}
                      <ExternalLink className="size-2.5" />
                    </a>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/shop/${storeForm.slug.trim().toLowerCase()}`;
                        navigator.clipboard.writeText(url);
                        toast.success("Store link copied!");
                      }}
                      className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2 inline-flex items-center gap-0.5"
                    >
                      Copy link
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shop_desc" className="text-foreground">Description</Label>
                <Textarea
                  id="shop_desc"
                  placeholder="Tell your customers about your products..."
                  rows={3}
                  value={storeForm.description}
                  onChange={(e) => setStoreForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shop_banner" className="text-foreground">Banner Image URL</Label>
                <Input
                  id="shop_banner"
                  placeholder="https://example.com/banner.jpg"
                  value={storeForm.banner_url}
                  onChange={(e) => setStoreForm(p => ({ ...p, banner_url: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shop_wa" className="text-foreground">WhatsApp Number</Label>
                <Input
                  id="shop_wa"
                  placeholder="e.g. 919876543210"
                  value={storeForm.whatsapp_number}
                  onChange={(e) => setStoreForm(p => ({ ...p, whatsapp_number: e.target.value }))}
                />
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Must include country code (no + or spaces). Fallback for customer chat.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shop_upi" className="text-foreground">UPI ID (for Payments)</Label>
                <Input
                  id="shop_upi"
                  placeholder="merchant@upi"
                  value={storeForm.upi_id}
                  onChange={(e) => setStoreForm(p => ({ ...p, upi_id: e.target.value }))}
                />
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Enables dynamic QR codes on checkout for instant payment collections.
                </p>
              </div>

              <Button
                onClick={handleSaveStore}
                disabled={savingStore}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
              >
                {savingStore ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Configurations"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground flex items-center gap-2 text-sm font-bold">
                <FileText className="size-4 text-primary" />
                CSV Import Guide
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Follow these formatting rules to bulk-upload your products.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">1. Required Headers:</p>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Your CSV file must include this exact header row:
                </p>
                <div className="bg-muted p-2 rounded text-[10px] font-mono select-all overflow-x-auto whitespace-nowrap text-foreground border border-border/40">
                  name,regular_price,sale_price,category,description,image_url
                </div>
              </div>

              <div className="space-y-1.5 text-muted-foreground text-[11px] leading-relaxed">
                <p className="font-semibold text-foreground text-xs">2. Format Rules:</p>
                <p>• <span className="font-medium text-foreground">regular_price</span> & <span className="font-medium text-foreground">sale_price</span> must be numbers.</p>
                <p>• <span className="font-medium text-foreground">sale_price</span> must be less than or equal to regular price.</p>
                <p>• <span className="font-medium text-foreground">category</span> defaults to <code className="bg-muted px-1 rounded text-[10px]">General</code> if left blank.</p>
                <p>• Wrap fields containing commas or quotes in double quotes <code className="bg-muted px-1 rounded text-[10px]">"</code>.</p>
              </div>

              <div className="pt-2 border-t border-border/40 space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadSampleCsv}
                  className="w-full text-xs border-border hover:bg-muted font-semibold"
                >
                  <Download className="size-3.5 mr-1" />
                  Download Sample CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Catalog Grid */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-2 p-0.5 bg-muted rounded-lg shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab("catalog")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "catalog"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Catalog Shelf
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === "orders"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Customer Orders
                  </button>
                </div>
                {activeTab === "catalog" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="file"
                      id="csv-file-input"
                      accept=".csv"
                      className="hidden"
                      onChange={handleCsvUpload}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => document.getElementById("csv-file-input")?.click()}
                      className="border-border hover:bg-muted"
                    >
                      <Upload className="size-4 mr-1" />
                      Import CSV
                    </Button>
                    <Button
                      size="sm"
                      onClick={openAddProduct}
                      disabled={products.length >= maxProducts}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Plus className="size-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                )}
              </div>
              <CardDescription className="text-muted-foreground mt-2">
                {activeTab === "catalog"
                  ? `Manage products, categories, and strike-through MRP pricing. Limit: (${products.length} / ${maxProducts})`
                  : "View, confirm, and update delivery or payment status for storefront checkouts."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === "catalog" ? (
                products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-lg bg-muted/20">
                    <ShoppingBag className="size-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-medium text-foreground">No products in store</p>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1">
                      Get started by adding items to your digital shop shelf. MRP and sale discounts supported!
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={openAddProduct}
                      className="mt-4 border-border hover:bg-muted"
                    >
                      Add Product
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Group items by category */}
                    {Array.from(new Set(products.map((p) => p.category))).map((category) => {
                      const catProducts = products.filter((p) => p.category === category);
                      return (
                        <div key={category} className="space-y-2">
                          <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase bg-muted/40 px-2 py-1 rounded">
                            {category}
                          </h4>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {catProducts.map((prod) => {
                              const discount = prod.regular_price > prod.sale_price
                                ? Math.round(((prod.regular_price - prod.sale_price) / prod.regular_price) * 100)
                                : 0;

                              return (
                                <div
                                  key={prod.id}
                                  className={`flex gap-3 border border-border rounded-lg p-2.5 bg-card transition-colors ${
                                    !prod.is_available && "opacity-60"
                                  }`}
                                >
                                  <div className="size-16 rounded-md bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border/40 relative">
                                    {prod.image_url ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={prod.image_url}
                                        alt={prod.name}
                                        className="size-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = "none";
                                        }}
                                      />
                                    ) : (
                                      <ShoppingBag className="size-6 text-muted-foreground/40" />
                                    )}
                                    {discount > 0 && (
                                      <span className="absolute top-0.5 left-0.5 bg-green-600 text-[8px] font-bold text-white px-1 rounded flex items-center gap-0.5">
                                        <Sparkles className="size-1.5" />
                                        {discount}% OFF
                                      </span>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1 flex flex-col justify-between">
                                    <div>
                                      <h5 className="text-sm font-semibold text-foreground truncate" title={prod.name}>
                                        {prod.name}
                                      </h5>
                                      {prod.description && (
                                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                                          {prod.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-sm font-bold text-foreground">
                                        ₹{prod.sale_price}
                                      </span>
                                      {prod.regular_price > prod.sale_price && (
                                        <span className="text-[10px] text-muted-foreground line-through">
                                          ₹{prod.regular_price}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end justify-between gap-2 shrink-0 border-l border-border/40 pl-2.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] text-muted-foreground">Available</span>
                                      <Switch
                                        className="scale-75 cursor-pointer"
                                        checked={prod.is_available}
                                        onCheckedChange={() => toggleProductAvailability(prod)}
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="size-7 hover:bg-muted text-muted-foreground hover:text-foreground"
                                        onClick={() => openEditProduct(prod)}
                                      >
                                        <Edit2 className="size-3.5" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="size-7 hover:bg-muted text-muted-foreground hover:text-destructive"
                                        onClick={() => confirmDeleteProduct(prod)}
                                      >
                                        <Trash2 className="size-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                loadingOrders ? (
                  <div className="flex h-48 items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-primary" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-lg bg-muted/20">
                    <ShoppingBag className="size-8 text-muted-foreground/60 mb-2" />
                    <p className="text-sm font-medium text-foreground">No orders received yet</p>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1">
                      Once a customer completes checkout on your storefront, orders will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const dateStr = new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const itemsList = order.items as Array<{ name: string; quantity: number; sale_price: number }>;

                      return (
                        <div
                          key={order.id}
                          className="border border-border rounded-xl p-4 bg-card hover:shadow-sm transition-all space-y-3 text-foreground"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                            <div>
                              <span className="text-xs font-bold font-mono text-muted-foreground">
                                #{order.id.split("-")[0].toUpperCase()}
                              </span>
                              <span className="text-[11px] text-muted-foreground ml-2">
                                {dateStr}
                              </span>
                            </div>
                            <span className="text-sm font-black text-foreground">
                              ₹{order.total_amount}
                            </span>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2 text-xs">
                            <div>
                              <p className="font-semibold text-foreground">{order.customer_name}</p>
                              <p className="text-muted-foreground mt-0.5">{order.customer_phone}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">Delivery Address:</p>
                              <p className="text-muted-foreground mt-0.5 leading-normal">
                                {order.delivery_address}
                              </p>
                            </div>
                          </div>

                          <div className="bg-muted/40 p-2.5 rounded-lg border border-border/40 text-xs">
                            <p className="font-semibold text-foreground mb-1.5">Items ({itemsList?.length || 0}):</p>
                            <ul className="space-y-1">
                              {itemsList?.map((item, idx) => (
                                <li key={idx} className="flex justify-between text-muted-foreground">
                                  <span>
                                    {item.name} <span className="text-foreground font-semibold">x{item.quantity}</span>
                                  </span>
                                  <span className="text-foreground">₹{item.sale_price * item.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-3">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-muted-foreground block">Payment Status</span>
                                <select
                                  value={order.payment_status}
                                  onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                                  className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="paid">Paid</option>
                                  <option value="failed">Failed</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-muted-foreground block">Order Status</span>
                                <select
                                  value={order.order_status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                  className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleChatWithCustomer(order)}
                              className="text-xs border-border hover:bg-muted font-semibold mt-auto animate-in"
                            >
                              <Store className="size-3.5 mr-1" />
                              Chat with Customer
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              Configure product details, categories, and strike-through pricing tags.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="prod_name" className="text-foreground">Product Name *</Label>
              <Input
                id="prod_name"
                placeholder="e.g. Eggless Black Forest Cake"
                value={productForm.name}
                onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))}
                maxLength={80}
              />
            </div>
            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="prod_reg_price" className="text-foreground">Regular MRP (₹) *</Label>
                <Input
                  id="prod_reg_price"
                  type="number"
                  placeholder="e.g. 500"
                  value={productForm.regular_price}
                  onChange={(e) => setProductForm(p => ({ ...p, regular_price: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod_sale_price" className="text-foreground">Sale Discount Price (₹) *</Label>
                <Input
                  id="prod_sale_price"
                  type="number"
                  placeholder="e.g. 450"
                  value={productForm.sale_price}
                  onChange={(e) => setProductForm(p => ({ ...p, sale_price: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="prod_category" className="text-foreground">Category</Label>
                <Input
                  id="prod_category"
                  placeholder="e.g. Cakes, Breads, Extras"
                  value={productForm.category}
                  onChange={(e) => setProductForm(p => ({ ...p, category: e.target.value }))}
                  maxLength={30}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod_img" className="text-foreground">Image URL</Label>
                <Input
                  id="prod_img"
                  placeholder="https://example.com/item.jpg"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm(p => ({ ...p, image_url: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod_desc" className="text-foreground">Description</Label>
              <Textarea
                id="prod_desc"
                placeholder="Product ingredients, details, weight, count, sizes..."
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))}
                maxLength={400}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="prod_avail"
                checked={productForm.is_available}
                onCheckedChange={(val) => setProductForm(p => ({ ...p, is_available: val }))}
              />
              <Label htmlFor="prod_avail" className="text-foreground cursor-pointer">
                Available in Store (Customers can purchase immediately)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setProductModalOpen(false)}
              disabled={savingProduct}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={savingProduct}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {savingProduct ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingProduct?.name}&quot;? This product will be permanently removed from your digital storefront.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
            >
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* CSV Import Preview Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-foreground">Import Products Preview</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Preview products found in your CSV. Limits are checked automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-2 space-y-4 pr-1 text-foreground">
            <div className="bg-muted/40 p-3 rounded-lg border border-border text-xs text-muted-foreground space-y-1">
              <p className="font-bold text-foreground">CSV Requirements:</p>
              <p>• Headers: <code className="bg-muted px-1 py-0.5 rounded">name</code>, <code className="bg-muted px-1 py-0.5 rounded">regular_price</code>, <code className="bg-muted px-1 py-0.5 rounded">sale_price</code>, <code className="bg-muted px-1 py-0.5 rounded">category</code>, <code className="bg-muted px-1 py-0.5 rounded">description</code>, <code className="bg-muted px-1 py-0.5 rounded">image_url</code></p>
              <p>• Prices must be numbers, and <code className="bg-muted px-1 py-0.5 rounded">sale_price</code> cannot be higher than <code className="bg-muted px-1 py-0.5 rounded">regular_price</code>.</p>
            </div>

            <div className="text-xs space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>Total parsed products:</span>
                <span className="font-bold text-foreground">{csvProducts.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining plan catalog slots:</span>
                <span className="font-bold text-foreground">{maxProducts - products.length}</span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-1 text-green-600 font-semibold">
                <span>To be imported:</span>
                <span>{Math.min(csvProducts.length, maxProducts - products.length)}</span>
              </div>
              {csvProducts.length > maxProducts - products.length && (
                <div className="flex justify-between text-amber-500 font-semibold">
                  <span>To be skipped (limit reached):</span>
                  <span>{csvProducts.length - (maxProducts - products.length)}</span>
                </div>
              )}
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-2 border-b border-border">Name</th>
                    <th className="p-2 border-b border-border">Regular</th>
                    <th className="p-2 border-b border-border">Sale</th>
                    <th className="p-2 border-b border-border">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {csvProducts.slice(0, 5).map((p, idx) => (
                    <tr key={idx} className="hover:bg-muted/10">
                      <td className="p-2 font-medium truncate max-w-[150px]">{p.name}</td>
                      <td className="p-2">₹{p.regular_price}</td>
                      <td className="p-2">₹{p.sale_price}</td>
                      <td className="p-2 truncate max-w-[80px]">{p.category}</td>
                    </tr>
                  ))}
                  {csvProducts.length > 5 && (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-muted-foreground bg-muted/20 font-medium">
                        ...and {csvProducts.length - 5} more products
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/40">
            <Button
              variant="ghost"
              onClick={() => setImportDialogOpen(false)}
              disabled={importing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportCsv}
              disabled={importing || maxProducts - products.length <= 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {importing ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Importing...
                </>
              ) : (
                `Import ${Math.min(csvProducts.length, maxProducts - products.length)} Items`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
