"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import {
  Search, Plus, Upload, Download, Edit2, Trash2, Loader2, Package, ImageIcon, ChevronDown, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface Product {
  id: string
  account_id: string
  name: string
  description: string
  regular_price: number
  sale_price: number
  image_url: string
  category: string
  is_available: boolean
  position: number
}

export default function ProductsPage() {
  const supabase = createClient()
  const { accountId, profileLoading } = useAuth()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [categories, setCategories] = useState<string[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "", description: "", regular_price: "", sale_price: "",
    image_url: "", category: "General", is_available: true,
  })

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [importOpen, setImportOpen] = useState(false)
  const [csvProducts, setCsvProducts] = useState<any[]>([])
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [maxProducts, setMaxProducts] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (profileLoading || !accountId) return
    loadProducts()
  }, [profileLoading, accountId])

  async function loadProducts() {
    try {
      setLoading(true)

      const { data: account } = await supabase
        .from("accounts")
        .select("max_products")
        .eq("id", accountId)
        .maybeSingle()
      setMaxProducts((account as any)?.max_products || 0)

      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("account_id", accountId)
        .order("category", { ascending: true })
        .order("position", { ascending: true })

      const list = (data as Product[]) || []
      setProducts(list)

      const cats = [...new Set(list.map((p) => p.category))]
      setCategories(cats)
    } catch (err) {
      console.error("Load products error:", err)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  function openAddModal() {
    setEditingProduct(null)
    setForm({ name: "", description: "", regular_price: "", sale_price: "", image_url: "", category: "General", is_available: true })
    setModalOpen(true)
  }

  function openEditModal(product: Product) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description || "",
      regular_price: String(product.regular_price),
      sale_price: String(product.sale_price),
      image_url: product.image_url || "",
      category: product.category,
      is_available: product.is_available,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Product name is required."); return }
    const regPrice = parseFloat(form.regular_price)
    const salePrice = parseFloat(form.sale_price)
    if (isNaN(regPrice) || regPrice <= 0) { toast.error("Valid regular price is required."); return }
    if (isNaN(salePrice) || salePrice <= 0) { toast.error("Valid sale price is required."); return }
    if (salePrice > regPrice) { toast.error("Sale price cannot exceed regular price."); return }

    try {
      setSaving(true)
      const payload = {
        account_id: accountId,
        name: form.name.trim(),
        description: form.description.trim(),
        regular_price: regPrice,
        sale_price: salePrice,
        image_url: form.image_url.trim(),
        category: form.category.trim() || "General",
        is_available: form.is_available,
        updated_at: new Date().toISOString(),
      }

      if (editingProduct) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id)
        if (error) throw error
        toast.success("Product updated.")
      } else {
        const { error } = await supabase.from("products").insert({
          ...payload,
          position: products.length,
        })
        if (error) throw error
        toast.success("Product added.")
      }

      setModalOpen(false)
      await loadProducts()
    } catch (err: any) {
      console.error("Save product error:", err)
      toast.error(err.message || "Failed to save product.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      const { error } = await supabase.from("products").delete().eq("id", deleteTarget.id)
      if (error) throw error
      toast.success("Product deleted.")
      setDeleteOpen(false)
      setDeleteTarget(null)
      await loadProducts()
    } catch (err: any) {
      console.error("Delete product error:", err)
      toast.error(err.message || "Failed to delete product.")
    }
  }

  // CSV import
  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return
      const lines = text.split(/\r?\n/)
      if (lines.length < 2) { toast.error("CSV must have a header row and data."); return }
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""))
      const results: any[] = []
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        const values: string[] = []
        let currentVal = ""
        let inQuotes = false
        for (const ch of line) {
          if (ch === '"') { inQuotes = !inQuotes }
          else if (ch === "," && !inQuotes) { values.push(currentVal.trim().replace(/^"|"$/g, "")); currentVal = "" }
          else { currentVal += ch }
        }
        values.push(currentVal.trim().replace(/^"|"$/g, ""))
        const item: any = {}
        headers.forEach((h, idx) => { if (h) item[h] = values[idx] || "" })
        results.push(item)
      }
      const valid = []
      for (const row of results) {
        const name = (row.name || row.title || "").trim()
        if (!name) continue
        const rp = parseFloat(row.regular_price || row.price || row.mrp || "0")
        const sp = parseFloat(row.sale_price || row.discount_price || row.price || "0")
        if (isNaN(rp) || rp <= 0 || isNaN(sp) || sp <= 0) continue
        valid.push({
          name,
          description: (row.description || "").trim(),
          regular_price: rp,
          sale_price: sp > rp ? rp : sp,
          category: (row.category || "General").trim(),
          image_url: (row.image_url || row.image || "").trim(),
          is_available: true,
        })
      }
      if (valid.length === 0) {
        toast.error("No valid products found. Headers: name, regular_price, sale_price, category, description, image_url")
        return
      }
      setCsvProducts(valid)
      setImportOpen(true)
    }
    reader.readAsText(file)
  }

  async function handleImportCsv() {
    const remaining = maxProducts - products.length
    if (remaining <= 0) { toast.error(`Catalog at limit (${maxProducts}). Upgrade to import more.`); return }
    const toImport = csvProducts.slice(0, remaining)
    try {
      setImporting(true)
      const { error } = await supabase.from("products").insert(
        toImport.map((p, i) => ({ ...p, account_id: accountId, position: products.length + i, updated_at: new Date().toISOString() }))
      )
      if (error) throw error
      toast.success(`Imported ${toImport.length} product(s).`)
      setImportOpen(false)
      await loadProducts()
    } catch (err: any) {
      console.error("CSV import error:", err)
      toast.error("Failed to import products.")
    } finally {
      setImporting(false)
    }
  }

  function downloadSampleCsv() {
    const blob = new Blob([
      "name,regular_price,sale_price,category,description,image_url\n" +
      '"Chocolate Fudge Cake",600,499,Cakes,"Rich double chocolate fudge cake","https://images.unsplash.com/photo-1578985545062-69928b1d9587"\n' +
      '"Sourdough Loaf",120,99,Breads,"Freshly baked crusty sourdough",\n'
    ], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "products_template.csv"; a.click()
    URL.revokeObjectURL(url)
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selectedIds.size === filtered.length) { setSelectedIds(new Set()) }
    else { setSelectedIds(new Set(filtered.map((p) => p.id))) }
  }

  async function bulkDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} product(s)?`)) return
    try {
      const { error } = await supabase.from("products").delete().in("id", [...selectedIds])
      if (error) throw error
      toast.success(`Deleted ${selectedIds.size} product(s).`)
      setSelectedIds(new Set())
      await loadProducts()
    } catch (err: any) {
      toast.error(err.message || "Bulk delete failed.")
    }
  }

  const filtered = products.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-1.5 h-4 w-4" /> Import CSV
          </Button>
          <button onClick={downloadSampleCsv} className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2 whitespace-nowrap">
            Download Sample CSV
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
          <Button size="sm" onClick={openAddModal}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {selectedIds.size > 0 && (
          <Button variant="destructive" size="sm" onClick={bulkDelete}>
            <Trash2 className="mr-1.5 h-4 w-4" /> Delete ({selectedIds.size})
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-10 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={selectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Regular Price</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Sale Price</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                <th className="w-20 px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Package className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                    No products found. Add your first product to get started.
                  </td>
                </tr>
              )}
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{product.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground line-through">
                    ₹{product.regular_price.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ₹{product.sale_price.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      product.is_available ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        product.is_available ? "bg-emerald-500" : "bg-red-500"
                      }`} />
                      {product.is_available ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEditModal(product)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => { setDeleteTarget(product); setDeleteOpen(true) }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>Fill in the product details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Chocolate Fudge Cake" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Brief product description..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Regular Price (₹)</Label>
                <Input type="number" min="0" step="0.01" value={form.regular_price} onChange={(e) => setForm({ ...form, regular_price: e.target.value })} placeholder="599" />
              </div>
              <div>
                <Label>Sale Price (₹)</Label>
                <Input type="number" min="0" step="0.01" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} placeholder="499" />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="General" list="categories" />
              <datalist id="categories">
                {categories.map((cat) => <option key={cat} value={cat} />)}
              </datalist>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              {form.image_url && (
                <img src={form.image_url} alt="Preview" className="mt-2 h-20 w-20 rounded-lg object-cover border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_available} onCheckedChange={(v) => setForm({ ...form, is_available: v })} />
              <Label className="cursor-pointer">Available for sale</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Import Products</DialogTitle>
            <DialogDescription>
              {csvProducts.length} valid product(s) found. {maxProducts - products.length} slot(s) remaining.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-2">
              <p className="font-semibold text-foreground">CSV Format Requirements</p>
              <div className="space-y-1.5 text-muted-foreground">
                <p>Your CSV must include these <span className="font-medium text-foreground">6 columns</span> in the first row:</p>
                <div className="overflow-x-auto rounded border border-border bg-background p-2 font-mono text-[11px] text-foreground select-all">
                  name,regular_price,sale_price,category,description,image_url
                </div>
              </div>
              <div className="space-y-1 text-muted-foreground">
                <p className="font-medium text-foreground">Rules:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li><span className="font-medium text-foreground">name</span> — Required. Product title.</li>
                  <li><span className="font-medium text-foreground">regular_price</span> — Required. Must be a number (e.g. 599).</li>
                  <li><span className="font-medium text-foreground">sale_price</span> — Required. Must be a number &le; regular_price.</li>
                  <li><span className="font-medium text-foreground">category</span> — Optional. Defaults to &ldquo;General&rdquo; if blank.</li>
                  <li><span className="font-medium text-foreground">description</span> — Optional.</li>
                  <li><span className="font-medium text-foreground">image_url</span> — Optional. Full URL to product image.</li>
                  <li>Wrap values containing commas in double quotes (<span className="font-mono text-foreground">&ldquo;...&rdquo;</span>).</li>
                </ul>
              </div>
              <div className="pt-1">
                <p className="font-medium text-foreground mb-1">Example row:</p>
                <div className="overflow-x-auto rounded border border-border bg-background p-2 font-mono text-[11px] text-foreground select-all">
                  &ldquo;Chocolate Fudge Cake&rdquo;,600,499,Cakes,&ldquo;Rich double chocolate cake&rdquo;,https://example.com/cake.jpg
                </div>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-3 py-2 text-right font-medium text-muted-foreground">Price</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {csvProducts.slice(0, 10).map((p, i) => (
                    <tr key={i} className="border-b border-border last:border-b-0">
                      <td className="px-3 py-2">{p.name}</td>
                      <td className="px-3 py-2 text-right">₹{p.sale_price}</td>
                      <td className="px-3 py-2">{p.category}</td>
                    </tr>
                  ))}
                  {csvProducts.length > 10 && (
                    <tr><td colSpan={3} className="px-3 py-2 text-center text-xs text-muted-foreground">...and {csvProducts.length - 10} more</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border">
            <Button variant="link" size="sm" onClick={downloadSampleCsv} className="text-xs">
              <Download className="mr-1 h-3 w-3" /> Download Sample CSV
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
            <Button onClick={handleImportCsv} disabled={importing}>
              {importing && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Import {Math.min(csvProducts.length, maxProducts - products.length)} Product(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
