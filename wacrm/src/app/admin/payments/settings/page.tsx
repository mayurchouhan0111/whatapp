'use client'

import { useEffect, useState } from 'react'
import { Save, Upload } from 'lucide-react'

export default function UpiSettingsPage() {
  const [upiId, setUpiId] = useState('')
  const [accountName, setAccountName] = useState('')
  const [qrImageUrl, setQrImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/upi-settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.upi_id !== undefined) {
          setUpiId(data.upi_id)
          setAccountName(data.account_name)
          setQrImageUrl(data.qr_image_url || '')
        }
      })
      .catch(() => {})
  }, [])

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/admin/upload-qr', {
      method: 'POST',
      body: formData,
    })

    if (res.ok) {
      const data = await res.json()
      setQrImageUrl(data.url)
    } else {
      alert('Upload failed')
    }
    setUploading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/admin/upi-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ upi_id: upiId, account_name: accountName, qr_image_url: qrImageUrl }),
    })
    if (res.ok) {
      setMessage('Settings saved successfully!')
    } else {
      setMessage('Failed to save settings.')
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">UPI Payment Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure the UPI details shown on the subscription checkout page.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">UPI ID</label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="example@paytm"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Account Name</label>
          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Vbuild CRM Pvt Ltd"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">UPI QR Code</label>
          <div className="flex items-start gap-6">
            {qrImageUrl && (
              <div className="shrink-0">
                <img
                  src={qrImageUrl}
                  alt="UPI QR Code"
                  className="w-40 h-40 object-contain rounded-xl border border-border"
                />
              </div>
            )}
            <div className="flex-1">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-4 py-8 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors">
                <Upload className="h-5 w-5" />
                {uploading ? 'Uploading...' : 'Upload QR Code Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  className="sr-only"
                />
              </label>
              {qrImageUrl && (
                <button
                  onClick={() => setQrImageUrl('')}
                  className="mt-2 text-xs text-red-400 hover:text-red-300"
                >
                  Remove QR code
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {message && (
            <p className={`mt-2 text-sm ${message.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
