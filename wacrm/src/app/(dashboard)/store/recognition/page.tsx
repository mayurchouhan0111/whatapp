"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import {
  Camera, Eye, Settings, ShoppingBag, Loader2, Sparkles, Check, CheckCircle2,
  AlertCircle, ShieldCheck, Play, RefreshCw, X, IndianRupee, Volume2, VolumeX,
  Scan, Sliders, Users, Trash, PlusCircle, MinusCircle, UserCheck, ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define Interfaces
interface Contact {
  id: string
  name: string
  phone: string
  email?: string
}

interface Product {
  id: string
  name: string
  sale_price: number
  regular_price: number
}

interface RecognitionConfig {
  premium_threshold: number
  good_threshold: number
  regular_threshold: number
  is_enabled: boolean
  notifications_enabled: boolean
  confidence_threshold: number
  camera_entrance_id: string
  camera_billing_id: string
  data_retention_days: number
}

interface VisitorLog {
  id: string
  name: string
  phone: string
  category: string
  confidence: number
  timestamp: string
  recognized: boolean
  spent: number
  photo_url?: string
}

interface ContactFace {
  contact_id: string
  face_photo_url: string
  face_embedding: number[]
  consent_given: boolean
  consent_date: string
}

export default function AIRecognitionPage() {
  const supabase = createClient()
  const { accountId, profileLoading } = useAuth()

  // State Management
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Config Settings
  const [config, setConfig] = useState<RecognitionConfig>({
    premium_threshold: 10000,
    good_threshold: 5000,
    regular_threshold: 1000,
    is_enabled: true,
    notifications_enabled: true,
    confidence_threshold: 0.75,
    camera_entrance_id: "default-front",
    camera_billing_id: "default-counter",
    data_retention_days: 365,
  })
  const [savingSettings, setSavingSettings] = useState(false)

  // DB Lists
  const [contacts, setContacts] = useState<Contact[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [enrolledFaces, setEnrolledFaces] = useState<Record<string, ContactFace>>({})
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([])

  // Camera feeds state
  const [isEntranceWebcam, setIsEntranceWebcam] = useState(false)
  const [isBillingWebcam, setIsBillingWebcam] = useState(false)
  const [entranceScanning, setEntranceScanning] = useState(false)
  const [billingScanning, setBillingScanning] = useState(false)

  // Webcam Refs
  const entranceVideoRef = useRef<HTMLVideoElement>(null)
  const billingVideoRef = useRef<HTMLVideoElement>(null)
  const entranceCanvasRef = useRef<HTMLCanvasElement>(null)
  const billingCanvasRef = useRef<HTMLCanvasElement>(null)
  const entranceStreamRef = useRef<MediaStream | null>(null)
  const billingStreamRef = useRef<MediaStream | null>(null)

  // Active visitor detected (Entrance)
  const [activeVisitor, setActiveVisitor] = useState<VisitorLog | null>(null)
  const [showNotification, setShowNotification] = useState(false)

  // Active customer at billing counter (Billing)
  const [activeBillingCustomer, setActiveBillingCustomer] = useState<{
    contact: Contact | null
    faceEnrolled: boolean
    consentChecked: boolean
    tempPhoto?: string
    spent: number
    ordersCount: number
    lastVisit?: string
    preferredProducts?: string
    salesExecutive?: string
  } | null>(null)

  // Billing Register Cart
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([])
  const [billingCompletedInfo, setBillingCompletedInfo] = useState<{
    customerName: string
    oldCategory: string
    newCategory: string
    totalAmount: number
    upgraded: boolean
  } | null>(null)
  const [isProcessingBill, setIsProcessingBill] = useState(false)

  // Confetti overlay trigger
  const [showConfetti, setShowConfetti] = useState(false)
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null)

  // Simulation parameters for new customer walking in
  const [simContactId, setSimContactId] = useState<string>("random")

  // Load Data
  useEffect(() => {
    if (profileLoading || !accountId) return
    loadInitialData()
  }, [profileLoading, accountId])

  // Cleanup webcams
  useEffect(() => {
    return () => {
      stopEntranceWebcam()
      stopBillingWebcam()
    }
  }, [])

  // Canvas loop for custom target overlays
  useEffect(() => {
    let animationId: number
    const drawOverlay = () => {
      // Draw scan grids on canvas overlay if webcam is not active or active
      if (!isEntranceWebcam && entranceCanvasRef.current && entranceScanning) {
        drawScanningGraphic(entranceCanvasRef.current)
      }
      if (!isBillingWebcam && billingCanvasRef.current && billingScanning) {
        drawScanningGraphic(billingCanvasRef.current)
      }
      animationId = requestAnimationFrame(drawOverlay)
    }
    animationId = requestAnimationFrame(drawOverlay)
    return () => cancelAnimationFrame(animationId)
  }, [isEntranceWebcam, isBillingWebcam, entranceScanning, billingScanning])

  async function loadInitialData() {
    try {
      setLoading(true)
      
      // 1. Fetch Config
      const { data: configData, error: configError } = await supabase
        .from("recognition_configs")
        .select("*")
        .eq("account_id", accountId)
        .maybeSingle()

      if (configError) {
        // Table doesn't exist or SQL error - proceed in Demo Mode
        console.warn("DB table 'recognition_configs' not accessible. Running in Local Storage Demo Mode.")
        setIsDemoMode(true)
        loadFromLocalStorage()
      } else if (configData) {
        setConfig({
          premium_threshold: Number(configData.premium_threshold),
          good_threshold: Number(configData.good_threshold),
          regular_threshold: Number(configData.regular_threshold),
          is_enabled: configData.is_enabled,
          notifications_enabled: configData.notifications_enabled,
          confidence_threshold: Number(configData.confidence_threshold),
          camera_entrance_id: configData.camera_entrance_id || "default-front",
          camera_billing_id: configData.camera_billing_id || "default-counter",
          data_retention_days: configData.data_retention_days,
        })
      }

      // 2. Fetch Contacts
      const { data: contactsData } = await supabase
        .from("contacts")
        .select("id, name, phone, email")
        .eq("account_id", accountId)
        .order("name", { ascending: true })

      if (contactsData) {
        setContacts(contactsData)
      }

      // 3. Fetch Products
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, sale_price, regular_price")
        .eq("account_id", accountId)
        .eq("is_available", true)
        .order("name", { ascending: true })

      if (productsData) {
        setProducts(productsData)
      }

      // 4. Fetch Enrolled Faces & Visitor Logs from Database (if available)
      if (!configError) {
        const { data: facesData } = await supabase
          .from("contact_faces")
          .select("*")
          .eq("account_id", accountId)

        if (facesData) {
          const map: Record<string, ContactFace> = {}
          facesData.forEach((f: any) => {
            map[f.contact_id] = {
              contact_id: f.contact_id,
              face_photo_url: f.face_photo_url,
              face_embedding: f.face_embedding,
              consent_given: f.consent_given,
              consent_date: f.consent_date
            }
          })
          setEnrolledFaces(map)
        }

        const { data: logsData } = await supabase
          .from("visitor_logs")
          .select("*, contact:contacts(name, phone)")
          .eq("account_id", accountId)
          .order("created_at", { ascending: false })
          .limit(20)

        if (logsData) {
          // Resolve visitor logs format
          const formattedLogs: VisitorLog[] = await Promise.all(
            logsData.map(async (l: any) => {
              const phone = l.contact?.phone || "unknown"
              const name = l.contact?.name || "Visitor"
              const customerStats = await fetchCustomerStats(phone)
              const cat = getCustomerCategory(customerStats.totalSpent)
              return {
                id: l.id,
                name,
                phone,
                category: l.recognized ? cat : "New",
                confidence: Number(l.confidence),
                timestamp: new Date(l.created_at).toLocaleTimeString(),
                recognized: l.recognized,
                spent: customerStats.totalSpent,
                photo_url: l.face_photo_url
              }
            })
          )
          setVisitorLogs(formattedLogs)
        }
      }

    } catch (err) {
      console.error("Load AI recognition dashboard error:", err)
      toast.error("Failed to fully load database records. Using demo mode.")
      setIsDemoMode(true)
      loadFromLocalStorage()
    } finally {
      setLoading(false)
    }
  }

  // Local Storage Fallback if DB Schema is not migrated
  function loadFromLocalStorage() {
    // Load config
    const cachedConfig = localStorage.getItem("wacrm_ai_config")
    if (cachedConfig) {
      setConfig(JSON.parse(cachedConfig))
    }

    // Load faces
    const cachedFaces = localStorage.getItem("wacrm_ai_faces")
    if (cachedFaces) {
      setEnrolledFaces(JSON.parse(cachedFaces))
    }

    // Load logs
    const cachedLogs = localStorage.getItem("wacrm_ai_logs")
    if (cachedLogs) {
      setVisitorLogs(JSON.parse(cachedLogs))
    } else {
      // Seed default logs
      const defaultLogs: VisitorLog[] = [
        {
          id: "1",
          name: "Rahul Sharma",
          phone: "919876543210",
          category: "Premium",
          confidence: 0.94,
          timestamp: "10:15 AM",
          recognized: true,
          spent: 184000,
        },
        {
          id: "2",
          name: "Neha Patel",
          phone: "919898989898",
          category: "Good Customer",
          confidence: 0.88,
          timestamp: "09:42 AM",
          recognized: true,
          spent: 7500,
        },
        {
          id: "3",
          name: "Anonymous Visitor",
          phone: "unknown",
          category: "New",
          confidence: 0.00,
          timestamp: "09:05 AM",
          recognized: false,
          spent: 0,
        }
      ]
      setVisitorLogs(defaultLogs)
      localStorage.setItem("wacrm_ai_logs", JSON.stringify(defaultLogs))
    }
  }

  // Save Settings
  async function handleSaveSettings() {
    try {
      setSavingSettings(true)
      if (isDemoMode) {
        localStorage.setItem("wacrm_ai_config", JSON.stringify(config))
        toast.success("Settings saved locally (Demo Mode)")
        return
      }

      // Upsert to Supabase
      const payload = {
        account_id: accountId,
        premium_threshold: config.premium_threshold,
        good_threshold: config.good_threshold,
        regular_threshold: config.regular_threshold,
        is_enabled: config.is_enabled,
        notifications_enabled: config.notifications_enabled,
        confidence_threshold: config.confidence_threshold,
        camera_entrance_id: config.camera_entrance_id,
        camera_billing_id: config.camera_billing_id,
        data_retention_days: config.data_retention_days,
        updated_at: new Date().toISOString()
      }

      const { data: existing } = await supabase
        .from("recognition_configs")
        .select("id")
        .eq("account_id", accountId)
        .maybeSingle()

      if (existing) {
        const { error } = await supabase
          .from("recognition_configs")
          .update(payload)
          .eq("account_id", accountId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("recognition_configs")
          .insert(payload)
        if (error) throw error
      }

      toast.success("Settings saved successfully!")
    } catch (err: any) {
      console.error("Save config error:", err)
      toast.error("Failed to save settings to DB. Saved locally instead.")
      localStorage.setItem("wacrm_ai_config", JSON.stringify(config))
    } finally {
      setSavingSettings(false)
    }
  }

  // Fetch Customer spend & orders dynamically from Supabase
  async function fetchCustomerStats(phone: string): Promise<{ totalSpent: number; totalOrders: number; lastOrderDate?: string }> {
    if (phone === "unknown") return { totalSpent: 0, totalOrders: 0 }
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("total_amount, created_at")
        .eq("account_id", accountId)
        .eq("customer_phone", phone)

      if (error || !data) return { totalSpent: 0, totalOrders: 0 }

      let totalSpent = 0
      let totalOrders = data.length
      let lastOrderDate: string | undefined

      data.forEach((o: any) => {
        totalSpent += Number(o.total_amount || 0)
        if (!lastOrderDate || new Date(o.created_at) > new Date(lastOrderDate)) {
          lastOrderDate = o.created_at
        }
      })

      return { totalSpent, totalOrders, lastOrderDate }
    } catch {
      return { totalSpent: 0, totalOrders: 0 }
    }
  }

  // Calculate Loyalty Tiers based on configs
  function getCustomerCategory(totalSpent: number): string {
    if (totalSpent >= config.premium_threshold) return "Premium"
    if (totalSpent >= config.good_threshold) return "Good Customer"
    if (totalSpent >= config.regular_threshold) return "Regular"
    return "New"
  }

  function getCategoryColor(category: string): { bg: string; text: string; border: string; glow: string } {
    switch (category) {
      case "Premium":
        return {
          bg: "bg-amber-500/10",
          text: "text-amber-500",
          border: "border-amber-500/30",
          glow: "shadow-amber-500/20"
        }
      case "Good Customer":
        return {
          bg: "bg-blue-500/10",
          text: "text-blue-500",
          border: "border-blue-500/30",
          glow: "shadow-blue-500/20"
        }
      case "Regular":
        return {
          bg: "bg-orange-500/10",
          text: "text-orange-500",
          border: "border-orange-500/30",
          glow: "shadow-orange-500/20"
        }
      default:
        return {
          bg: "bg-slate-500/10",
          text: "text-slate-400",
          border: "border-slate-500/20",
          glow: "shadow-transparent"
        }
    }
  }

  // Audio greeting simulation
  function playAlertSound(category: string) {
    if (!soundEnabled) return
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      
      osc.connect(gain)
      gain.connect(audioCtx.destination)

      if (category === "Premium") {
        // High premium double chime
        osc.type = "sine"
        osc.frequency.setValueAtTime(880, audioCtx.currentTime)
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.15)
        
        const osc2 = audioCtx.createOscillator()
        const gain2 = audioCtx.createGain()
        osc2.connect(gain2)
        gain2.connect(audioCtx.destination)
        osc2.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.15)
        gain2.gain.setValueAtTime(0.1, audioCtx.currentTime + 0.15)
        osc2.start(audioCtx.currentTime + 0.15)
        osc2.stop(audioCtx.currentTime + 0.4)
      } else if (category === "Good Customer" || category === "Regular") {
        // Single chime
        osc.type = "sine"
        osc.frequency.setValueAtTime(660, audioCtx.currentTime)
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.25)
      } else {
        // Low click
        osc.type = "triangle"
        osc.frequency.setValueAtTime(440, audioCtx.currentTime)
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.1)
      }
    } catch (e) {
      console.warn("Audio Context playback not initialized:", e)
    }
  }

  // Camera 1: Entrance Scanning & Simulated Detection
  async function triggerEntranceSimulation() {
    if (!config.is_enabled) {
      toast.warning("AI recognition is disabled in Settings.")
      return
    }

    setEntranceScanning(true)
    
    // Simulate processing time
    setTimeout(async () => {
      let phone = "unknown"
      let name = "New Visitor"
      let recognized = false
      let confidence = 0.0

      if (simContactId === "random") {
        // Random new visitor
        recognized = false
        confidence = Math.random() * 0.35 + 0.1
      } else {
        // Find selected contact
        const contact = contacts.find((c) => c.id === simContactId)
        if (contact) {
          name = contact.name
          phone = contact.phone
          // Is this contact enrolled with face recognition?
          const isEnrolled = enrolledFaces[contact.id] || isDemoMode // In demo mode, assume recognized
          if (isEnrolled) {
            recognized = true
            confidence = Math.random() * 0.18 + 0.81 // 81% - 99%
          } else {
            // Found contact, but no face template enrolled yet
            recognized = false
            confidence = Math.random() * 0.2 + 0.45 // 45% - 65%
          }
        }
      }

      // Fetch dynamic stats from database
      const stats = await fetchCustomerStats(phone)
      // If demo mode, simulate some spent amounts for demo credibility
      let totalSpent = stats.totalSpent
      if (isDemoMode && recognized) {
        if (name === "Rahul Sharma") totalSpent = 184000
        else if (name === "Neha Patel") totalSpent = 7500
        else if (phone !== "unknown") totalSpent = 3500 // Regular
      }

      const cat = recognized ? getCustomerCategory(totalSpent) : "New"

      const newLog: VisitorLog = {
        id: Math.random().toString(),
        name: recognized ? name : "New Visitor",
        phone,
        category: cat,
        confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recognized,
        spent: totalSpent,
        photo_url: undefined
      }

      // Check if camera is active to capture canvas frame as thumbnail
      if (isEntranceWebcam && entranceCanvasRef.current && entranceVideoRef.current) {
        const ctx = entranceCanvasRef.current.getContext("2d")
        if (ctx) {
          ctx.drawImage(entranceVideoRef.current, 0, 0, 150, 150)
          newLog.photo_url = entranceCanvasRef.current.toDataURL("image/jpeg")
        }
      }

      // Update visitor list
      const updatedLogs = [newLog, ...visitorLogs].slice(0, 30)
      setVisitorLogs(updatedLogs)
      if (isDemoMode) {
        localStorage.setItem("wacrm_ai_logs", JSON.stringify(updatedLogs))
      } else {
        // Record in Supabase visitor_logs
        await supabase
          .from("visitor_logs")
          .insert({
            account_id: accountId,
            contact_id: recognized && simContactId !== "random" ? simContactId : null,
            recognized,
            confidence: Number(confidence.toFixed(2)),
            face_photo_url: newLog.photo_url
          })
      }

      setEntranceScanning(false)
      setActiveVisitor(newLog)

      if (config.notifications_enabled) {
        setShowNotification(true)
        playAlertSound(cat)
        // Auto hide notification after 6 seconds
        setTimeout(() => {
          setShowNotification(false)
        }, 6000)
      }

      toast.success(`Entrance Scan: ${recognized ? `Recognized ${name} (${cat})` : "New Customer Detected"}`)

    }, 2200)
  }

  // Camera 2: Billing Counter Scanning & Enrollment
  async function triggerBillingSimulation() {
    setBillingScanning(true)

    setTimeout(async () => {
      // Scans face at billing counter
      let contact: Contact | null = null
      let faceEnrolled = false
      let spent = 0
      let ordersCount = 0
      let lastVisit = "Never"
      let preferredProducts = "General Catalog"
      let salesExecutive = "Amit"

      // In simulation, we check the visitor history or link to simulator selection
      // Let's link it to the last active visitor or a selected customer
      const lastVisitor = visitorLogs[0]
      if (lastVisitor && lastVisitor.phone !== "unknown") {
        contact = contacts.find(c => c.phone === lastVisitor.phone) || null
        faceEnrolled = lastVisitor.recognized
        spent = lastVisitor.spent
        const stats = await fetchCustomerStats(lastVisitor.phone)
        ordersCount = stats.totalOrders || 1
        lastVisit = stats.lastOrderDate ? new Date(stats.lastOrderDate).toLocaleDateString("en-IN") : "Today"
      }

      let capturedPhotoUrl = undefined
      if (isBillingWebcam && billingCanvasRef.current && billingVideoRef.current) {
        const ctx = billingCanvasRef.current.getContext("2d")
        if (ctx) {
          ctx.drawImage(billingVideoRef.current, 0, 0, 150, 150)
          capturedPhotoUrl = billingCanvasRef.current.toDataURL("image/jpeg")
        }
      }

      setActiveBillingCustomer({
        contact,
        faceEnrolled,
        consentChecked: false,
        tempPhoto: capturedPhotoUrl,
        spent,
        ordersCount,
        lastVisit,
        preferredProducts,
        salesExecutive
      })

      // Select items for the cart based on preferred products or seed empty
      setCart([])
      setBillingScanning(false)
      toast.info(contact ? `Loaded Customer ${contact.name} at Billing Counter` : "Unregistered Visitor at Billing Counter")
    }, 1800)
  }

  // Enroll face for the billing customer (Consent-driven)
  async function handleEnrollFace() {
    const cust = activeBillingCustomer
    if (!cust || !cust.contact) {
      toast.error("No valid customer identified to enroll.")
      return
    }

    if (!cust.consentChecked) {
      toast.error("Biometric enrollment requires customer's explicit consent.")
      return
    }

    try {
      const mockEmbedding = Array.from({ length: 128 }, () => Math.random() * 2 - 1)
      const photoUrl = cust.tempPhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"

      const newFace: ContactFace = {
        contact_id: cust.contact.id,
        face_photo_url: photoUrl,
        face_embedding: mockEmbedding,
        consent_given: true,
        consent_date: new Date().toISOString()
      }

      // Update client state
      const updatedFaces = { ...enrolledFaces, [cust.contact.id]: newFace }
      setEnrolledFaces(updatedFaces)

      if (isDemoMode) {
        localStorage.setItem("wacrm_ai_faces", JSON.stringify(updatedFaces))
      } else {
        // Upsert to Supabase contact_faces
        const payload = {
          account_id: accountId,
          contact_id: cust.contact.id,
          face_photo_url: photoUrl,
          face_embedding: mockEmbedding,
          consent_given: true,
          consent_date: newFace.consent_date,
          updated_at: new Date().toISOString()
        }

        const { error } = await supabase
          .from("contact_faces")
          .upsert(payload, { onConflict: "contact_id" })

        if (error) throw error
      }

      setActiveBillingCustomer((prev: any) => ({
        ...prev,
        faceEnrolled: true
      }))

      toast.success(`Face Enrolled successfully for ${cust.contact.name}!`)
    } catch (err) {
      console.error("Enroll face error:", err)
      toast.error("Failed to enroll face profile")
    }
  }

  // Delete face enrollment
  async function handleDeleteFace(contactId: string) {
    try {
      const updated = { ...enrolledFaces }
      delete updated[contactId]
      setEnrolledFaces(updated)

      if (isDemoMode) {
        localStorage.setItem("wacrm_ai_faces", JSON.stringify(updated))
      } else {
        const { error } = await supabase
          .from("contact_faces")
          .delete()
          .eq("contact_id", contactId)
        if (error) throw error
      }
      toast.success("Biometric enrollment deleted.")
    } catch {
      toast.error("Failed to remove biometric data.")
    }
  }

  // Checkout Register Terminal Cart
  function addToCart(prod: Product) {
    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === prod.id)
      if (exists) {
        return prev.map((item) =>
          item.product.id === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product: prod, quantity: 1 }]
    })
  }

  function updateCartQty(prodId: string, change: number) {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === prodId) {
            const nextQty = item.quantity + change
            return { ...item, quantity: nextQty }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    })
  }

  // Process checkout & update loyalty tiers dynamically
  async function handleCheckout() {
    const cust = activeBillingCustomer
    if (cart.length === 0) {
      toast.error("Cart is empty.")
      return
    }

    try {
      setIsProcessingBill(true)
      const totalAmount = cart.reduce((sum, item) => sum + item.product.sale_price * item.quantity, 0)
      
      let name = cust?.contact?.name || "Walk-in Customer"
      let phone = cust?.contact?.phone || "919999999999"
      let contactId = cust?.contact?.id || null

      // Create new contact if unregistered
      if (!contactId && cust) {
        // Simulate registration with consent
        if (!cust.contact && name !== "Walk-in Customer") {
          // If we had input fields, we would register contact. For now, create random demo contact
          const mockContactId = Math.random().toString()
          contactId = mockContactId
        }
      }

      // Calculate totals
      const oldSpent = cust?.spent || 0
      const newSpent = oldSpent + totalAmount
      const oldCat = getCustomerCategory(oldSpent)
      const newCat = getCustomerCategory(newSpent)
      const isUpgraded = oldCat !== newCat && oldCat !== "New" && newSpent > oldSpent

      if (!isDemoMode && contactId) {
        // Insert real order into Supabase
        const validatedItems = cart.map((item) => ({
          product_id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          sale_price: item.product.sale_price,
        }))

        const { error: orderError } = await supabase
          .from("orders")
          .insert({
            account_id: accountId,
            contact_id: contactId,
            customer_name: name,
            customer_phone: phone,
            delivery_address: "In-Store Purchase",
            total_amount: totalAmount,
            payment_method: "upi",
            payment_status: "paid",
            order_status: "delivered",
            items: validatedItems
          })

        if (orderError) throw orderError
      }

      // Display Billing Invoice success Modal
      setBillingCompletedInfo({
        customerName: name,
        oldCategory: oldCat,
        newCategory: newCat,
        totalAmount,
        upgraded: isUpgraded
      })

      // Confetti celebration if upgraded
      if (isUpgraded) {
        setShowConfetti(true)
        triggerConfettiAnimation()
      }

      // Reset billing state
      setCart([])
      setActiveBillingCustomer(null)
      loadInitialData() // refresh databases

    } catch (err: any) {
      console.error("Billing error:", err)
      toast.error("Billing checkout failed")
    } finally {
      setIsProcessingBill(false)
    }
  }

  // Confetti particles logic
  function triggerConfettiAnimation() {
    const canvas = confettiCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const colors = ["#d4af37", "#3b82f6", "#f97316", "#10b981", "#ec4899"]
    const particles = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * canvas.height,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    }))

    let count = 0
    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      particles.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2
        p.x += Math.sin(p.tiltAngle)
        p.tilt = Math.sin(p.tiltAngle - count / 3) * 15

        ctx.beginPath()
        ctx.lineWidth = p.r
        ctx.strokeStyle = p.color
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y)
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2)
        ctx.stroke()
      })

      count++
      if (count < 180) {
        requestAnimationFrame(draw)
      } else {
        setShowConfetti(false)
      }
    }
    draw()
  }

  // Draw Sci-Fi Face recognition scanning on canvas
  function drawScanningGraphic(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const w = canvas.width
    const h = canvas.height

    // BG grid
    ctx.strokeStyle = "rgba(16, 185, 129, 0.07)"
    ctx.lineWidth = 1
    for (let i = 0; i < w; i += 20) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, h)
      ctx.stroke()
    }
    for (let j = 0; j < h; j += 20) {
      ctx.beginPath()
      ctx.moveTo(0, j)
      ctx.lineTo(w, j)
      ctx.stroke()
    }

    // Scanning red/green laser line
    const time = Date.now() * 0.003
    const scanY = (Math.sin(time) * 0.5 + 0.5) * h
    
    ctx.strokeStyle = "rgba(16, 185, 129, 0.6)"
    ctx.shadowBlur = 8
    ctx.shadowColor = "rgba(16, 185, 129, 0.8)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(10, scanY)
    ctx.lineTo(w - 10, scanY)
    ctx.stroke()

    // Bounding target corners
    ctx.strokeStyle = "rgba(16, 185, 129, 0.8)"
    ctx.lineWidth = 3
    ctx.shadowBlur = 0

    // Top Left
    ctx.beginPath()
    ctx.moveTo(20, 40)
    ctx.lineTo(20, 20)
    ctx.lineTo(40, 20)
    ctx.stroke()

    // Top Right
    ctx.beginPath()
    ctx.moveTo(w - 40, 20)
    ctx.lineTo(w - 20, 20)
    ctx.lineTo(w - 20, 40)
    ctx.stroke()

    // Bottom Left
    ctx.beginPath()
    ctx.moveTo(20, h - 40)
    ctx.lineTo(20, h - 20)
    ctx.lineTo(40, h - 20)
    ctx.stroke()

    // Bottom Right
    ctx.beginPath()
    ctx.moveTo(w - 40, h - 20)
    ctx.lineTo(w - 20, h - 20)
    ctx.lineTo(w - 20, h - 40)
    ctx.stroke()

    // Simulated vector points (face mesh overlay)
    ctx.fillStyle = "rgba(16, 185, 129, 0.7)"
    const facePoints = [
      { x: 0.5, y: 0.35 }, // nose bridge
      { x: 0.42, y: 0.32 }, // left eye
      { x: 0.58, y: 0.32 }, // right eye
      { x: 0.5, y: 0.45 }, // nose tip
      { x: 0.45, y: 0.55 }, // mouth left
      { x: 0.55, y: 0.55 }, // mouth right
      { x: 0.5, y: 0.62 }, // chin
      { x: 0.35, y: 0.45 }, // left cheek
      { x: 0.65, y: 0.45 }  // right cheek
    ]
    facePoints.forEach((pt) => {
      ctx.beginPath()
      ctx.arc(pt.x * w, pt.y * h, 3, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  // HTML5 Webcam Stream managers
  async function startEntranceWebcam() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Webcam API is blocked by browser security. Ensure you are using HTTPS or localhost.")
      return
    }
    try {
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } } })
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
      }
      entranceStreamRef.current = stream
      if (entranceVideoRef.current) {
        entranceVideoRef.current.srcObject = stream
      }
      setIsEntranceWebcam(true)
      toast.success("Entrance Webcam activated!")
    } catch (err: any) {
      console.error("Entrance Webcam Error:", err)
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        toast.error("Webcam access denied. Please click the lock/camera icon in your address bar and choose 'Allow'.")
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        toast.error("No webcam device detected on your system. Please plug in a camera.")
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        toast.error("Webcam is already in use by another application (e.g. Zoom, Teams, OBS). Close them and try again.")
      } else {
        toast.error(`Webcam error: ${err.message || "Failed to start camera feed"}`)
      }
    }
  }

  function stopEntranceWebcam() {
    if (entranceStreamRef.current) {
      entranceStreamRef.current.getTracks().forEach((track) => track.stop())
      entranceStreamRef.current = null
    }
    setIsEntranceWebcam(false)
  }

  async function startBillingWebcam() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Webcam API is blocked by browser security. Ensure you are using HTTPS or localhost.")
      return
    }
    try {
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 } } })
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
      }
      billingStreamRef.current = stream
      if (billingVideoRef.current) {
        billingVideoRef.current.srcObject = stream
      }
      setIsBillingWebcam(true)
      toast.success("Billing Counter Webcam activated!")
    } catch (err: any) {
      console.error("Billing Webcam Error:", err)
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        toast.error("Webcam access denied. Please click the lock/camera icon in your address bar and choose 'Allow'.")
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        toast.error("No webcam device detected on your system. Please plug in a camera.")
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        toast.error("Webcam is already in use by another application (e.g. Zoom, Teams, OBS). Close them and try again.")
      } else {
        toast.error(`Webcam error: ${err.message || "Failed to start camera feed"}`)
      }
    }
  }

  function stopBillingWebcam() {
    if (billingStreamRef.current) {
      billingStreamRef.current.getTracks().forEach((track) => track.stop())
      billingStreamRef.current = null
    }
    setIsBillingWebcam(false)
  }

  return (
    <div className="relative mx-auto max-w-7xl space-y-6 pb-12">
      {/* Confetti Fullscreen overlay */}
      {showConfetti && (
        <canvas
          ref={confettiCanvasRef}
          className="fixed inset-0 pointer-events-none z-50 h-full w-full"
        />
      )}

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            AI Customer Recognition
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Instantly detect returning VIPs, calculate lifetime spending categories, and log store entrance walk-ins.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-9 w-9 p-0"
            title={soundEnabled ? "Mute alert chimes" : "Unmute alert chimes"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-destructive" />}
          </Button>
          {isDemoMode && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500 border border-amber-500/20">
              <ShieldAlert className="h-3.5 w-3.5" /> Local Demo Mode
            </span>
          )}
          <Button variant="outline" size="sm" onClick={loadInitialData} className="gap-1">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Staff Alert Banner Overlay */}
      {showNotification && activeVisitor && (
        <div className="fixed bottom-6 right-6 z-40 w-96 transform transition-all duration-300 ease-in-out">
          <Card className={`border-2 shadow-2xl backdrop-blur-md bg-card/90 overflow-hidden ${
            activeVisitor.category === "Premium" ? "border-amber-500 ring-2 ring-amber-500/20" :
            activeVisitor.category === "Good Customer" ? "border-blue-500" :
            activeVisitor.category === "Regular" ? "border-orange-500" : "border-border"
          }`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/40">
              <div className="flex items-center gap-2">
                <Sparkles className={`h-5 w-5 ${
                  activeVisitor.category === "Premium" ? "text-amber-500 animate-pulse" :
                  activeVisitor.category === "Good Customer" ? "text-blue-500" :
                  activeVisitor.category === "Regular" ? "text-orange-500" : "text-slate-400"
                }`} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {activeVisitor.recognized ? "Customer Identified" : "Alert: New Visitor"}
                </span>
              </div>
              <button onClick={() => setShowNotification(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-start gap-4">
                {activeVisitor.photo_url ? (
                  <img src={activeVisitor.photo_url} alt="Face profile" className="h-16 w-16 rounded-full object-cover border border-border" />
                ) : (
                  <div className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold ${
                    activeVisitor.category === "Premium" ? "bg-amber-500/20 text-amber-500" :
                    activeVisitor.category === "Good Customer" ? "bg-blue-500/20 text-blue-500" :
                    activeVisitor.category === "Regular" ? "bg-orange-500/20 text-orange-500" : "bg-slate-500/10 text-slate-400"
                  }`}>
                    {activeVisitor.name.charAt(0)}
                  </div>
                )}
                <div className="space-y-1">
                  <h4 className="font-bold text-lg leading-tight">{activeVisitor.name}</h4>
                  <p className="text-xs text-muted-foreground">{activeVisitor.phone}</p>
                  
                  {/* Badge */}
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mt-1 ${getCategoryColor(activeVisitor.category).bg} ${getCategoryColor(activeVisitor.category).text} ${getCategoryColor(activeVisitor.category).border}`}>
                    {activeVisitor.category} Tier
                  </span>
                </div>
              </div>

              {activeVisitor.recognized && (
                <div className="grid grid-cols-2 gap-2 border-t border-border/40 pt-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Lifetime Spend:</span>
                    <p className="font-bold text-sm">₹{activeVisitor.spent.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence:</span>
                    <p className="font-semibold text-emerald-500">{(activeVisitor.confidence * 100).toFixed(0)}% Match</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Grid: split camera simulators + interactive billing */}
      <Tabs defaultValue="cameras" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="cameras" className="gap-1.5"><Camera className="h-4 w-4" /> Cameras & Simulator</TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5"><ShoppingBag className="h-4 w-4" /> Billing Register</TabsTrigger>
          <TabsTrigger value="profiles" className="gap-1.5"><Users className="h-4 w-4" /> Face Enrollments</TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5"><Settings className="h-4 w-4" /> Config Settings</TabsTrigger>
        </TabsList>

        {/* 1. Cameras Feed and Walk-in Simulator */}
        <TabsContent value="cameras" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Entrance Camera 1 */}
            <Card className="overflow-hidden border border-border bg-card shadow-lg">
              <CardHeader className="bg-muted/30 border-b border-border/50 py-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    Camera 1 – Entrance Cam
                  </CardTitle>
                  <CardDescription className="text-xs">Monitors store front entryway</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-2.5"
                    onClick={() => isEntranceWebcam ? stopEntranceWebcam() : startEntranceWebcam()}
                  >
                    {isEntranceWebcam ? "Simulate Feed" : "Use Webcam"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex flex-col items-center justify-center space-y-4">
                <div className="relative w-full aspect-video rounded-xl bg-slate-950 overflow-hidden border border-border/80 flex items-center justify-center">
                  
                  {isEntranceWebcam ? (
                    <video
                      ref={entranceVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : null}

                  {/* HTML5 Canvas overlay for mesh drawings */}
                  <canvas
                    ref={entranceCanvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                    width={320}
                    height={240}
                  />

                  {/* Dynamic Simulation overlay text */}
                  {entranceScanning && (
                    <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[1px] flex flex-col items-center justify-center z-25 text-emerald-400 font-mono text-sm space-y-2">
                      <Scan className="h-10 w-10 animate-spin text-emerald-500" />
                      <span className="animate-pulse">SCANNING FACE DATA...</span>
                    </div>
                  )}

                  {!entranceScanning && !isEntranceWebcam && (
                    <div className="text-slate-500 text-xs font-mono text-center flex flex-col items-center gap-2">
                      <Eye className="h-8 w-8 text-slate-600 animate-pulse" />
                      <span>ENTRANCE FEED ACTIVE</span>
                      <span className="text-[10px] text-slate-700">Ready to recognize visitors</span>
                    </div>
                  )}
                </div>

                {/* Entrance Simulator controls */}
                <div className="w-full bg-muted/40 rounded-xl p-3 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Simulator Control</Label>
                    <span className="text-[10px] text-slate-500">Triggers Camera 1 scan</span>
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-primary"
                      value={simContactId}
                      onChange={(e) => setSimContactId(e.target.value)}
                    >
                      <option value="random">Simulate Unknown Visitor (New)</option>
                      {contacts.map((c) => (
                        <option key={c.id} value={c.id}>
                          Simulate Walk-in: {c.name} ({enrolledFaces[c.id] ? "Face Enrolled" : "No Face Data"})
                        </option>
                      ))}
                    </select>
                    <Button onClick={triggerEntranceSimulation} disabled={entranceScanning} className="gap-1.5 h-9">
                      {entranceScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                      Walk-in
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Counter Camera 2 */}
            <Card className="overflow-hidden border border-border bg-card shadow-lg">
              <CardHeader className="bg-muted/30 border-b border-border/50 py-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                    Camera 2 – Billing Counter
                  </CardTitle>
                  <CardDescription className="text-xs">Monitors point of sale customer identity</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 px-2.5"
                    onClick={() => isBillingWebcam ? stopBillingWebcam() : startBillingWebcam()}
                  >
                    {isBillingWebcam ? "Simulate Feed" : "Use Webcam"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex flex-col items-center justify-center space-y-4">
                <div className="relative w-full aspect-video rounded-xl bg-slate-950 overflow-hidden border border-border/80 flex items-center justify-center">
                  
                  {isBillingWebcam ? (
                    <video
                      ref={billingVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                    />
                  ) : null}

                  <canvas
                    ref={billingCanvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                    width={320}
                    height={240}
                  />

                  {billingScanning && (
                    <div className="absolute inset-0 bg-blue-950/20 backdrop-blur-[1px] flex flex-col items-center justify-center z-25 text-blue-400 font-mono text-sm space-y-2">
                      <Scan className="h-10 w-10 animate-spin text-blue-500" />
                      <span className="animate-pulse">IDENTIFYING CUSTOMER AT REGISTER...</span>
                    </div>
                  )}

                  {!billingScanning && !isBillingWebcam && (
                    <div className="text-slate-500 text-xs font-mono text-center flex flex-col items-center gap-2">
                      <Camera className="h-8 w-8 text-slate-600 animate-pulse" />
                      <span>BILLING COUNTER FEED ACTIVE</span>
                      <span className="text-[10px] text-slate-700">Align customer face for checkout mapping</span>
                    </div>
                  )}
                </div>

                {/* Billing trigger scan */}
                <div className="w-full bg-muted/40 rounded-xl p-3 border border-border flex gap-2 items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Biometric Checkout Match</Label>
                    <p className="text-[10px] text-slate-500">Scan customer presenting for invoice</p>
                  </div>
                  <Button variant="secondary" onClick={triggerBillingSimulation} disabled={billingScanning} className="gap-1.5 h-9">
                    {billingScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
                    Scan Customer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visitor History logs list */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                Live Camera Log History
              </CardTitle>
              <CardDescription>Chronological list of store walk-in events captured by Camera 1</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Snapshot</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer / Visitor</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Match Confidence</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Timestamp</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitorLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          No scans logged today. Start by simulating a walk-in above!
                        </td>
                      </tr>
                    ) : (
                      visitorLogs.map((log) => {
                        const colors = getCategoryColor(log.category)
                        return (
                          <tr key={log.id} className="border-b border-border hover:bg-muted/20">
                            <td className="px-4 py-2">
                              {log.photo_url ? (
                                <img src={log.photo_url} alt="captured" className="h-9 w-9 rounded-md object-cover border border-border" />
                              ) : (
                                <div className={`flex h-9 w-9 items-center justify-center rounded-md ${colors.bg} ${colors.text} font-bold text-xs`}>
                                  {log.name.charAt(0)}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <p className="font-semibold text-sm">{log.name}</p>
                              <p className="text-xs text-muted-foreground">{log.phone}</p>
                            </td>
                            <td className="px-4 py-2">
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors.bg} ${colors.text} ${colors.border}`}>
                                {log.recognized ? log.category : "New Customer"}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right">
                              {log.recognized ? (
                                <span className="font-medium text-emerald-500 font-mono">{(log.confidence * 100).toFixed(0)}%</span>
                              ) : (
                                <span className="text-xs text-muted-foreground">Unrecognized</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-right text-xs text-muted-foreground font-mono">
                              {log.timestamp}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {log.recognized && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => {
                                    const contact = contacts.find(c => c.phone === log.phone)
                                    if (contact) {
                                      setActiveBillingCustomer({
                                        contact,
                                        faceEnrolled: true,
                                        consentChecked: true,
                                        spent: log.spent,
                                        ordersCount: 1,
                                        tempPhoto: log.photo_url
                                      })
                                      // Focus checkout tab
                                      const tabsTrigger = document.querySelector('[value="billing"]') as HTMLButtonElement
                                      if (tabsTrigger) tabsTrigger.click()
                                    }
                                  }}
                                >
                                  Load to Billing
                                </Button>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Billing Counter Register */}
        <TabsContent value="billing" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Customer Details Mapping */}
            <Card className="md:col-span-1 border border-border">
              <CardHeader className="bg-muted/20 border-b border-border/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Active Customer Mapping
                </CardTitle>
                <CardDescription className="text-xs">Linked via Camera 2 Biometrics</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                
                {activeBillingCustomer ? (
                  <div className="space-y-4">
                    {/* Customer overview card */}
                    <div className="rounded-xl border border-border p-3 space-y-3 bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full text-base font-bold ${
                          getCategoryColor(activeBillingCustomer.contact ? getCustomerCategory(activeBillingCustomer.spent) : "New").bg
                        } ${
                          getCategoryColor(activeBillingCustomer.contact ? getCustomerCategory(activeBillingCustomer.spent) : "New").text
                        }`}>
                          {activeBillingCustomer.contact ? activeBillingCustomer.contact.name.charAt(0) : "W"}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{activeBillingCustomer.contact ? activeBillingCustomer.contact.name : "Unregistered Visitor"}</p>
                          <p className="text-xs text-muted-foreground">{activeBillingCustomer.contact ? activeBillingCustomer.contact.phone : "No phone associated"}</p>
                        </div>
                      </div>

                      {activeBillingCustomer.contact && (
                        <div className="grid grid-cols-2 gap-2 border-t border-border/50 pt-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Lifetime Spent:</span>
                            <p className="font-bold">₹{activeBillingCustomer.spent.toLocaleString("en-IN")}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Current Category:</span>
                            <p className={`font-bold ${getCategoryColor(getCustomerCategory(activeBillingCustomer.spent)).text}`}>
                              {getCustomerCategory(activeBillingCustomer.spent)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Biometric consent enrollment form */}
                    {activeBillingCustomer.contact ? (
                      <div className="space-y-3 border-t border-border/50 pt-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Face recognition settings</h5>
                        
                        {activeBillingCustomer.faceEnrolled ? (
                          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 text-xs">
                            <ShieldCheck className="h-4 w-4 shrink-0" />
                            <div>
                              <p className="font-bold">Face Template Active</p>
                              <p className="text-[10px] text-emerald-500/80">Consent verified & stored securely</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3 bg-amber-500/5 p-3 rounded-lg border border-amber-500/20">
                            <div className="flex items-start gap-2 text-xs text-amber-600">
                              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                              <p className="font-medium">No biometric face data found in CRM. Enroll now?</p>
                            </div>

                            <div className="flex items-center justify-between border-t border-amber-500/10 pt-2">
                              <Label htmlFor="consent-toggle" className="text-xs text-muted-foreground font-semibold cursor-pointer">
                                I confirm customer gives consent
                              </Label>
                              <Switch
                                id="consent-toggle"
                                checked={activeBillingCustomer.consentChecked}
                                onCheckedChange={(val) => setActiveBillingCustomer((p: any) => ({ ...p, consentChecked: val }))}
                              />
                            </div>

                            <Button
                              onClick={handleEnrollFace}
                              disabled={!activeBillingCustomer.consentChecked}
                              size="sm"
                              className="w-full text-xs gap-1"
                            >
                              <Camera className="h-3.5 w-3.5" /> Register Embedding
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-500/5 border border-slate-500/10 p-3 rounded-lg text-xs space-y-3">
                        <p className="text-muted-foreground">To enable Face Recognition and track loyalty points, map this visitor to a CRM contact.</p>
                        
                        <div className="space-y-2">
                          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Link Existing Customer</Label>
                          <select
                            className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                            onChange={(e) => {
                              const cid = e.target.value
                              const contact = contacts.find(c => c.id === cid)
                              if (contact) {
                                // load details
                                fetchCustomerStats(contact.phone).then((stats) => {
                                  setActiveBillingCustomer((prev: any) => ({
                                    ...prev,
                                    contact,
                                    spent: stats.totalSpent,
                                    ordersCount: stats.totalOrders,
                                    faceEnrolled: !!enrolledFaces[contact.id]
                                  }))
                                })
                              }
                            }}
                          >
                            <option value="">-- Choose Contact --</option>
                            {contacts.map((c) => (
                              <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <Button variant="outline" size="sm" onClick={() => setActiveBillingCustomer(null)} className="w-full h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
                      Clear Scan
                    </Button>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
                    <Scan className="h-8 w-8 text-slate-600 animate-pulse" />
                    <p className="text-xs font-semibold">No Active Customer Scanned</p>
                    <p className="text-[10px] text-slate-500 max-w-[200px]">
                      Perform a "Scan Customer" under the Camera 2 billing counter tab to begin.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Catalog Register Terminal */}
            <Card className="md:col-span-2 border border-border shadow-lg">
              <CardHeader className="bg-muted/20 border-b border-border/50 py-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Billing Counter Register Terminal
                  </CardTitle>
                  <CardDescription className="text-xs">Compile and checkout customer invoice</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-4 grid gap-4 sm:grid-cols-2">
                
                {/* Product catalog selector */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Catalog</h5>
                  <div className="border border-border rounded-xl max-h-[300px] overflow-y-auto divide-y divide-border/60">
                    {products.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No catalog items found. Create products in the Products tab first!
                      </div>
                    ) : (
                      products.map((prod) => (
                        <div key={prod.id} className="p-2.5 flex items-center justify-between hover:bg-muted/10">
                          <div>
                            <p className="text-xs font-semibold">{prod.name}</p>
                            <p className="text-xs font-bold text-primary">₹{Number(prod.sale_price).toLocaleString("en-IN")}</p>
                          </div>
                          <Button size="sm" variant="outline" className="h-7 text-xs py-0 px-2" onClick={() => addToCart(prod)}>
                            Add to Cart
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Cart & Checkout Panel */}
                <div className="flex flex-col h-full justify-between space-y-4">
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">
                      <span>Cart summary</span>
                      <span>({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    </h5>

                    <div className="border border-border rounded-xl p-3 max-h-[220px] overflow-y-auto space-y-2 bg-muted/15 min-h-[140px]">
                      {cart.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground text-center py-8">
                          Cart is empty. Add products from the catalog.
                        </div>
                      ) : (
                        cart.map((item) => (
                          <div key={item.product.id} className="flex justify-between items-center text-xs pb-1 border-b border-border/40 last:border-0 last:pb-0">
                            <div className="flex-1 pr-2">
                              <p className="font-semibold truncate">{item.product.name}</p>
                              <p className="text-[10px] text-slate-500">₹{item.product.sale_price} each</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button onClick={() => updateCartQty(item.product.id, -1)} className="text-muted-foreground hover:text-foreground">
                                <MinusCircle className="h-4 w-4" />
                              </button>
                              <span className="font-bold font-mono text-xs w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateCartQty(item.product.id, 1)} className="text-muted-foreground hover:text-foreground">
                                <PlusCircle className="h-4 w-4" />
                              </button>
                              <span className="font-bold text-right pl-3 font-mono min-w-[50px]">
                                ₹{(item.product.sale_price * item.quantity).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border/80">
                    <div className="flex justify-between font-bold text-sm">
                      <span>Total Invoice Value:</span>
                      <span className="text-primary text-base font-mono">
                        ₹{cart.reduce((sum, item) => sum + item.product.sale_price * item.quantity, 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      disabled={cart.length === 0 || isProcessingBill}
                      className="w-full gap-2 h-10 font-bold"
                    >
                      {isProcessingBill ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing Order...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Complete Payment & Update CRM
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 3. Face Enrollments list */}
        <TabsContent value="profiles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Active Biometric Enrollments
              </CardTitle>
              <CardDescription>Customers with enrolled face recognition profiles in the CRM database</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-xs uppercase">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Snapshot</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer Profile</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Consent Given</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Enrollment Date</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Face Embedding Vector (128d)</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(enrolledFaces).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          No customer biometric profiles registered. Register a customer at the Billing tab above.
                        </td>
                      </tr>
                    ) : (
                      Object.values(enrolledFaces).map((face) => {
                        const contact = contacts.find(c => c.id === face.contact_id)
                        if (!contact) return null
                        return (
                          <tr key={face.contact_id} className="border-b border-border hover:bg-muted/20">
                            <td className="px-4 py-2">
                              {face.face_photo_url ? (
                                <img src={face.face_photo_url} alt="enrolled snapshot" className="h-10 w-10 rounded-full object-cover border border-border" />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-800 font-bold">
                                  {contact.name.charAt(0)}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <p className="font-semibold">{contact.name}</p>
                              <p className="text-xs text-muted-foreground">{contact.phone}</p>
                            </td>
                            <td className="px-4 py-2 text-xs">
                              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-semibold">
                                <Check className="h-3 w-3" /> Yes
                              </span>
                            </td>
                            <td className="px-4 py-2 text-xs text-muted-foreground">
                              {new Date(face.consent_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-4 py-2 text-right text-xs font-mono text-muted-foreground max-w-[200px] truncate">
                              [{face.face_embedding.slice(0, 4).map((x) => x.toFixed(3)).join(", ")}... (128 dims)]
                            </td>
                            <td className="px-4 py-2 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
                                onClick={() => handleDeleteFace(face.contact_id)}
                              >
                                <Trash className="h-3.5 w-3.5" /> Remove
                              </Button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Configuration Panel */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="h-5 w-5 text-primary" />
                AI Configuration Panel
              </CardTitle>
              <CardDescription>Define threshold ranges, sensor variables, camera links, and biometric settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gating & Config Toggles</h4>
                  
                  <div className="flex items-center justify-between rounded-lg border border-border p-3.5">
                    <div>
                      <Label htmlFor="ai-toggle" className="font-semibold cursor-pointer">Enable Face Recognition AI</Label>
                      <p className="text-xs text-muted-foreground">Enable active scans on store entrances</p>
                    </div>
                    <Switch
                      id="ai-toggle"
                      checked={config.is_enabled}
                      onCheckedChange={(val) => setConfig((p) => ({ ...p, is_enabled: val }))}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-3.5">
                    <div>
                      <Label htmlFor="notify-toggle" className="font-semibold cursor-pointer">Staff Alerts & Notifications</Label>
                      <p className="text-xs text-muted-foreground">Display alerts when returning customers enter</p>
                    </div>
                    <Switch
                      id="notify-toggle"
                      checked={config.notifications_enabled}
                      onCheckedChange={(val) => setConfig((p) => ({ ...p, notifications_enabled: val }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loyalty Spending Tiers (₹)</h4>
                  
                  <div className="grid gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Premium Customer Threshold (Gold)</Label>
                      <Input
                        type="number"
                        value={config.premium_threshold}
                        onChange={(e) => setConfig((p) => ({ ...p, premium_threshold: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Good Customer Threshold (Blue)</Label>
                      <Input
                        type="number"
                        value={config.good_threshold}
                        onChange={(e) => setConfig((p) => ({ ...p, good_threshold: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Regular Customer Threshold (Orange)</Label>
                      <Input
                        type="number"
                        value={config.regular_threshold}
                        onChange={(e) => setConfig((p) => ({ ...p, regular_threshold: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 border-t border-border/50 pt-5">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recognition Sensitivity</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <Label>Confidence Match Threshold</Label>
                      <span className="text-primary font-mono">{(config.confidence_threshold * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="0.95"
                      step="0.05"
                      value={config.confidence_threshold}
                      onChange={(e) => setConfig((p) => ({ ...p, confidence_threshold: Number(e.target.value) }))}
                      className="w-full accent-primary h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Lower values speed up matching but increase chance of false positives. Recommended: 75%.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sensor Hardware Links</h4>
                  
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Entrance Camera ID</Label>
                      <select
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none"
                        value={config.camera_entrance_id}
                        onChange={(e) => setConfig((p) => ({ ...p, camera_entrance_id: e.target.value }))}
                      >
                        <option value="default-front">Front Gate Dome 1 (IP)</option>
                        <option value="webcam-usb">USB Integrated Webcam</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Billing Camera ID</Label>
                      <select
                        className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none"
                        value={config.camera_billing_id}
                        onChange={(e) => setConfig((p) => ({ ...p, camera_billing_id: e.target.value }))}
                      >
                        <option value="default-counter">Counter Register Cam 1 (IP)</option>
                        <option value="webcam-usb">USB Integrated Webcam</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-border/50 pt-4">
                <Button onClick={handleSaveSettings} disabled={savingSettings} className="px-8">
                  {savingSettings && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Admin Settings
                </Button>
              </div>

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Success & Category Transition celebration Drawer/Modal */}
      <Dialog open={billingCompletedInfo !== null} onOpenChange={() => setBillingCompletedInfo(null)}>
        <DialogContent className="sm:max-w-md text-center p-6 space-y-4">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <Check className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-center">Invoice Billing Completed!</DialogTitle>
            <DialogDescription className="text-center text-xs">
              Transaction has been successfully saved to database. Customer CRM metrics updated automatically.
            </DialogDescription>
          </DialogHeader>

          {billingCompletedInfo && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border/80 bg-muted/40 p-4 space-y-2">
                <p className="text-xs text-muted-foreground font-semibold">Customer: {billingCompletedInfo.customerName}</p>
                <p className="text-sm font-bold text-primary">Invoice Value: ₹{billingCompletedInfo.totalAmount.toLocaleString("en-IN")}</p>
              </div>

              {billingCompletedInfo.upgraded ? (
                <div className="rounded-xl border-2 border-amber-500 bg-amber-500/10 p-4 space-y-2 ring-4 ring-amber-500/10 animate-bounce">
                  <div className="flex items-center justify-center gap-1.5 text-amber-500 font-bold">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                    <span>LOYALTY TIER UPGRADE ALERT</span>
                  </div>
                  <p className="text-xs text-amber-600 font-medium">
                    Congratulations! Customer lifetime purchases transitioned:
                  </p>
                  <p className="text-sm font-bold text-amber-500 flex items-center justify-center gap-2">
                    <span className="line-through text-slate-400 text-xs">{billingCompletedInfo.oldCategory}</span>
                    <span>→</span>
                    <span>{billingCompletedInfo.newCategory}</span>
                  </p>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground p-2">
                  Customer loyalty category maintained as: <span className="font-bold text-foreground">{billingCompletedInfo.newCategory}</span>.
                </div>
              )}
            </div>
          )}

          <Button onClick={() => setBillingCompletedInfo(null)} className="w-full">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
