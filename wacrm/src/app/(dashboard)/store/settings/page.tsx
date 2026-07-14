"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import { Store, Loader2, ExternalLink, Check, Lock, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface StoreConfig {
  id: string
  account_id: string
  slug: string
  name: string
  description: string
  banner_url: string
  whatsapp_number: string
  upi_id: string
  is_active: boolean
}

export default function StoreSettingsPage() {
  const supabase = createClient()
  const { accountId, profileLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [expiryDate, setExpiryDate] = useState<string | null>(null)
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [siteUrl, setSiteUrl] = useState("")

  const [form, setForm] = useState({
    slug: "",
    name: "",
    description: "",
    banner_url: "",
    whatsapp_number: "",
    upi_id: "",
    is_active: true,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSiteUrl(window.location.origin)
    }
  }, [])

  useEffect(() => {
    if (profileLoading || !accountId) return
    loadSettings()
  }, [profileLoading, accountId])

  async function loadSettings() {
    try {
      setLoading(true)
      const { data: account } = await supabase
        .from("accounts")
        .select("allow_store, store_expires_at")
        .eq("id", accountId)
        .maybeSingle()

      if (!account || !(account as any).allow_store) {
        setHasAccess(false)
        setLoading(false)
        return
      }

      if ((account as any).store_expires_at) {
        const expiry = new Date((account as any).store_expires_at)
        if (expiry < new Date()) {
          setHasAccess(false)
          setExpiryDate(expiry.toLocaleDateString())
          setLoading(false)
          return
        }
        setExpiryDate(expiry.toLocaleDateString())
      }

      setHasAccess(true)

      const { data: config } = await supabase
        .from("store_configs")
        .select("*")
        .eq("account_id", accountId)
        .maybeSingle()

      if (config) {
        setStoreConfig(config as StoreConfig)
        setForm({
          slug: (config as any).slug || "",
          name: (config as any).name || "",
          description: (config as any).description || "",
          banner_url: (config as any).banner_url || "",
          whatsapp_number: (config as any).whatsapp_number || "",
          upi_id: (config as any).upi_id || "",
          is_active: (config as any).is_active ?? true,
        })
      } else {
        setForm((prev) => ({
          ...prev,
          name: "The VBuild Store",
          slug: "vbuild-store-" + Math.floor(1000 + Math.random() * 9000),
        }))
      }
    } catch (err) {
      console.error("Load settings error:", err)
      toast.error("Failed to load store settings")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error("Store name is required."); return }
    const cleanSlug = form.slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "")
    if (!cleanSlug) { toast.error("Valid store slug is required."); return }

    try {
      setSaving(true)
      const payload = {
        account_id: accountId,
        slug: cleanSlug,
        name: form.name.trim(),
        description: form.description.trim(),
        banner_url: form.banner_url.trim(),
        whatsapp_number: form.whatsapp_number.trim(),
        upi_id: form.upi_id.trim(),
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      }

      if (storeConfig) {
        const { error } = await supabase
          .from("store_configs")
          .update(payload)
          .eq("id", storeConfig.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("store_configs")
          .insert(payload)
        if (error) throw error
      }

      toast.success("Store settings saved!")
      await loadSettings()
    } catch (err: any) {
      console.error("Save error:", err)
      toast.error(err.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  function copyStoreLink() {
    const url = `${siteUrl}/shop/${form.slug.trim().toLowerCase()}`
    navigator.clipboard.writeText(url)
    toast.success("Store link copied!")
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="flex flex-row items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Storefront Locked
                {expiryDate && <span className="text-xs font-normal text-muted-foreground">(Expired: {expiryDate})</span>}
              </CardTitle>
              <CardDescription className="mt-1">
                The Online Storefront feature is locked or has expired for this workspace plan.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Unlock the Premium Storefront to sell directly from a web interface integrated with your WhatsApp.</p>
            <div className="space-y-2 border-t border-border/40 pt-4">
              {["Premium mobile checkout", "UPI Payment QR codes", "WhatsApp receipt messages", "Pipeline & Contact integration"].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <Button disabled>Contact Administrator to Unlock</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const storeUrl = `${siteUrl}/shop/${form.slug.trim().toLowerCase()}`

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Store Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure your public storefront.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            Store Configuration
          </CardTitle>
          <CardDescription>Set up your storefront name, URL, and contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label className="font-semibold">Store Status</Label>
              <p className="text-xs text-muted-foreground">Toggle store visibility for customers</p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(val) => setForm((p) => ({ ...p, is_active: val }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Store Name</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Baker's Delight" />
          </div>

          <div className="space-y-1.5">
            <Label>URL Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              placeholder="bakers-delight"
            />
            {form.slug.trim() && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  shop/{form.slug.trim().toLowerCase()}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
                <button onClick={copyStoreLink} className="text-primary hover:underline inline-flex items-center gap-0.5">
                  <LinkIcon className="h-2.5 w-2.5" /> Copy link
                </button>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              placeholder="Tell customers about your products..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Banner Image URL</Label>
            <Input
              value={form.banner_url}
              onChange={(e) => setForm((p) => ({ ...p, banner_url: e.target.value }))}
              placeholder="https://example.com/banner.jpg"
            />
            {form.banner_url && (
              <img
                src={form.banner_url}
                alt="Banner preview"
                className="mt-2 h-32 w-full rounded-lg object-cover border"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label>WhatsApp Number</Label>
            <Input
              value={form.whatsapp_number}
              onChange={(e) => setForm((p) => ({ ...p, whatsapp_number: e.target.value }))}
              placeholder="919876543210"
            />
            <p className="text-xs text-muted-foreground">Include country code, no + or spaces.</p>
          </div>

          <div className="space-y-1.5">
            <Label>UPI ID (for Payments)</Label>
            <Input
              value={form.upi_id}
              onChange={(e) => setForm((p) => ({ ...p, upi_id: e.target.value }))}
              placeholder="merchant@upi"
            />
            <p className="text-xs text-muted-foreground">Enables QR code payments on checkout.</p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
