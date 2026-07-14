"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Grid3X3, Loader2, Package, Plus, X, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface Category {
  name: string
  count: number
}

export default function CategoriesPage() {
  const supabase = createClient()
  const { accountId, profileLoading } = useAuth()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState("")
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  useEffect(() => {
    if (profileLoading || !accountId) return
    loadCategories()
  }, [profileLoading, accountId])

  async function loadCategories() {
    try {
      setLoading(true)
      const { data } = await supabase
        .from("products")
        .select("category")
        .eq("account_id", accountId)

      const products = (data as { category: string }[]) || []
      const catMap = new Map<string, number>()
      for (const p of products) {
        catMap.set(p.category, (catMap.get(p.category) || 0) + 1)
      }
      const sorted = [...catMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }))
      setCategories(sorted)
    } catch (err) {
      console.error("Load categories error:", err)
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  async function handleAddCategory() {
    const name = newCategory.trim()
    if (!name) { toast.error("Category name is required."); return }
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Category already exists.")
      return
    }
    // Create a dummy product with this category to register it
    try {
      const { error } = await supabase.from("products").insert({
        account_id: accountId,
        name: `__cat_placeholder__${name}`,
        regular_price: 0,
        sale_price: 0,
        category: name,
        is_available: false,
        position: 9999,
      })
      if (error) throw error
      toast.success(`Category "${name}" created.`)
      setNewCategory("")
      await loadCategories()
    } catch (err: any) {
      console.error("Add category error:", err)
      toast.error(err.message || "Failed to add category")
    }
  }

  async function handleRenameCategory(oldName: string) {
    const newName = editValue.trim()
    if (!newName || newName === oldName) return
    try {
      const { error } = await supabase
        .from("products")
        .update({ category: newName, updated_at: new Date().toISOString() })
        .eq("account_id", accountId)
        .eq("category", oldName)
      if (error) throw error
      toast.success(`Category renamed to "${newName}".`)
      setEditingCategory(null)
      await loadCategories()
    } catch (err: any) {
      console.error("Rename category error:", err)
      toast.error(err.message || "Failed to rename category")
    }
  }

  async function handleDeleteCategory(name: string) {
    if (!confirm(`Delete category "${name}"? Products in this category will be moved to "General".`)) return
    try {
      const { error } = await supabase
        .from("products")
        .update({ category: "General", updated_at: new Date().toISOString() })
        .eq("account_id", accountId)
        .eq("category", name)
      if (error) throw error
      // Clean up placeholder product if it exists
      await supabase
        .from("products")
        .delete()
        .eq("account_id", accountId)
        .eq("name", `__cat_placeholder__${name}`)
      toast.success(`Category "${name}" deleted.`)
      await loadCategories()
    } catch (err: any) {
      console.error("Delete category error:", err)
      toast.error(err.message || "Failed to delete category")
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">{categories.length} categor{categories.length !== 1 ? "ies" : "y"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="New category name..."
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory() }}
          className="max-w-xs"
        />
        <Button size="sm" onClick={handleAddCategory}>
          <Plus className="mr-1.5 h-4 w-4" /> Add
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Products</th>
              <th className="w-24 px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">
                  <Grid3X3 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  No categories yet. Categories are created automatically when you add products.
                </td>
              </tr>
            )}
            {categories.map((cat) => (
              <tr key={cat.name} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  {editingCategory === cat.name ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleRenameCategory(cat.name); if (e.key === "Escape") setEditingCategory(null) }}
                        className="h-8 max-w-xs"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleRenameCategory(cat.name)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingCategory(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <span className="font-medium">{cat.name}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{cat.count}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {editingCategory !== cat.name && (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditingCategory(cat.name); setEditValue(cat.name) }}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.name)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
