'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Save, Upload, QrCode, Trash2 } from 'lucide-react'

export default function UpiSettingsPage() {
  const [upiId, setUpiId] = useState('')
  const [accountName, setAccountName] = useState('')
  const [qrImageUrl, setQrImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
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
      setMessage('Upload failed')
      setMessageType('error')
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
      setMessage('Settings saved successfully')
      setMessageType('success')
    } else {
      setMessage('Failed to save settings')
      setMessageType('error')
    }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">UPI Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure the UPI details shown on the subscription checkout page.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/20 px-6 py-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-base font-semibold text-foreground">Payment Details</h3>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">UPI ID</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="example@paytm"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Account Name</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Vbuild CRM Pvt Ltd"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">UPI QR Code</label>
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {qrImageUrl ? (
                <div className="relative shrink-0">
                  <Image
                    src={qrImageUrl}
                    alt="UPI QR Code"
                    width={144}
                    height={144}
                    className="w-36 h-36 object-contain rounded-xl border border-border"
                  />
                  <button
                    onClick={() => setQrImageUrl('')}
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    title="Remove QR code"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ) : null}
              <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-5 py-8 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors ${qrImageUrl ? 'flex-1' : 'w-full'}`}>
                <Upload className="h-5 w-5" />
                <span>{uploading ? 'Uploading...' : 'Upload QR Code'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-border px-6 py-4 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {message && (
            <p className={`text-sm ${messageType === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
