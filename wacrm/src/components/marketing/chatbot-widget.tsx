"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MessageCircle, X, Volume2, VolumeX } from "lucide-react"

interface Message {
  role: "bot" | "user"
  text: string
}

type Step = "greeting" | "choose_lang" | "ask_business" | "closing"

const BUSINESS_OPTIONS = [
  { value: "ecommerce", label: "🛍️  E-commerce / Retail" },
  { value: "service", label: "💼  Service Business" },
  { value: "realestate", label: "🏠  Real Estate" },
  { value: "education", label: "📚  Education / Coaching" },
  { value: "healthcare", label: "🏥  Healthcare" },
  { value: "other", label: "🤔  Something else" },
]

const RESULTS: Record<string, { points: string[]; stat: string }> = {
  ecommerce: {
    points: [
      "WhatsApp Storefront — customers directly browse karein aur order karein, website ki zaroorat nahi",
      "Auto order confirmation aur delivery updates — WhatsApp template messages se",
      "Naye products aur offers ka broadcast — ek click mein saare customers ko bhejein",
      "Delivery ke baad auto Google Review request — zyada reviews, zyada trust",
    ],
    stat: "E-commerce businesses typically see 3X more ROI and 30% shorter sales cycles.",
  },
  service: {
    points: [
      "Automated appointment reminders — no-shows 40% tak kam ho jaate hain",
      "Service ke baad auto feedback aur Google Review collect karein",
      "Past customers ko offers aur updates broadcast karein",
      "Lead se lekar sale tak poora pipeline ek jagah track karein",
      "Team inbox — koi bhi customer message unanswered nahi jaata",
    ],
    stat: "Service businesses typically see 20% revenue growth in the first 3 months.",
  },
  realestate: {
    points: [
      "Automated follow-ups — ab 'sorry, call back karna bhool gaye' nahi hoga",
      "Property catalogs directly WhatsApp par bhejein",
      "Har deal ko inquiry se closing tak track karein",
      "New listings ka broadcast interested buyers ko turant bhejein",
      "Happy homeowners se automatically Google Reviews collect karein",
    ],
    stat: "Real estate agents report 40% more leads converted with automated follow-ups.",
  },
  education: {
    points: [
      "Batch-wise broadcast — saare students ko ek saath update bhejein",
      "Fees collection aur payment reminders WhatsApp par",
      "Enrollment follow-ups automate karein — koi lead nahi chhootega",
      "Course materials aur updates instantly share karein",
      "Students se auto Google Reviews aur testimonials collect karein",
    ],
    stat: "Coaching centers typically see 50% more enrollments with automated WhatsApp follow-ups.",
  },
  healthcare: {
    points: [
      "Appointment reminders — no-shows mein bhari kami",
      "Reports aur prescriptions directly WhatsApp par bhejein",
      "Health tips aur offers ka broadcast patients ko",
      "Visit ke baad auto feedback aur Google Review collect karein",
      "Ek shared inbox se saare patient inquiries manage karein",
    ],
    stat: "Clinics typically see 35% fewer no-shows with WhatsApp reminders.",
  },
  other: {
    points: [
      "Vbuild works for ANY business that talks to customers on WhatsApp",
      "Shared inbox, sales pipeline, broadcasts, storefront, automations, Google reviews — sab ek mein",
      "Core benefit: 5 alag tools ki jagah ek platform. Paise bachte hain, time bachta hai",
      "Starting at ₹999/month with free trial",
      "Most businesses see ROI within the first month itself",
    ],
    stat: "Koi bhi business ho, WhatsApp par customers se baat karte hain toh Vbuild aapka time aur paisa dono bachayega.",
  },
}

function stripEmoji(t: string) {
  return t.replace(/[^\p{L}\p{N}\p{P}\p{Z}$]/gu, "").trim()
}

function BotAvatar() {
  return (
    <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-primary to-violet-500 shadow-sm ring-1 ring-white/20">
      <span className="text-[10px] font-bold text-white">V</span>
      <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-1 ring-white" />
      </span>
    </div>
  )
}

function TypeWriter({ text, speed = 30, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("")
  const idx = useRef(0)

  useEffect(() => {
    idx.current = 0
    setDisplayed("")
    const interval = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1))
        idx.current++
      } else {
        clearInterval(interval)
        onDone?.()
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed, onDone])

  return <span>{displayed}</span>
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("greeting")
  const [messages, setMessages] = useState<Message[]>([])
  const [lang, setLang] = useState<"en" | "hi" | null>(null)
  const [typing, setTyping] = useState(false)
  const [botDone, setBotDone] = useState(false)
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null)
  const [pulse, setPulse] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const thinkingTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "bot", text: "Hey there! 👋 I'm Vbuild's assistant. I can explain what we do in simple English or Hinglish — whatever works for you!" }])
      setStep("choose_lang")
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, botDone, typing])

  // Pulse timer for floating button
  useEffect(() => {
    if (open) return
    let count = 0
    const interval = setInterval(() => { count++; if ([3, 8, 15].includes(count)) { setPulse(true); setTimeout(() => setPulse(false), 2000) } }, 5000)
    return () => clearInterval(interval)
  }, [open])

  // Scroll-based pulse
  useEffect(() => {
    const fn = () => { if (!open && !pulse && window.scrollY > 400 && window.scrollY % 800 < 50) { setPulse(true); setTimeout(() => setPulse(false), 2500) } }
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [open, pulse])

  function botRespond(text: string, next: Step) {
    if (thinkingTimer.current) clearTimeout(thinkingTimer.current)
    setTyping(true)
    setBotDone(false)
    setMessages((prev) => [...prev, { role: "bot", text }])
    setStep(next)
    const delay = Math.max(1200, text.length * 20)
    thinkingTimer.current = setTimeout(() => {
      setTyping(false)
    }, delay)
  }

  const speak = useCallback((text: string, msgIdx: number) => {
    if (typeof window === "undefined") return
    try {
      const synth = window.speechSynthesis
      if (!synth) { console.warn("no speechSynthesis"); return }

      if (speakingIdx === msgIdx) { synth.cancel(); setSpeakingIdx(null); return }

      synth.cancel()
      const clean = stripEmoji(text)
      if (!clean) return

      const u = new SpeechSynthesisUtterance(clean)
      u.lang = lang === "hi" ? "hi-IN" : "en-IN"
      u.rate = 0.85
      u.volume = 1
      u.onend = () => setSpeakingIdx(null)
      u.onerror = () => setSpeakingIdx(null)

      setSpeakingIdx(msgIdx)
      synth.speak(u)
    } catch (e) { console.warn("speak failed", e); setSpeakingIdx(null) }
  }, [lang, speakingIdx])

  function handleLang(selected: "en" | "hi") {
    setLang(selected)
    setMessages((prev) => [...prev, { role: "user", text: selected === "en" ? "English" : "Hinglish" }])
    if (selected === "en") {
      botRespond("Great choice! Here's the simple version of what Vbuild CRM does for you:\n\nVbuild CRM is a complete business platform that runs inside WhatsApp. Think of it as your WhatsApp control center:\n\n• Manage all customer chats as a team (shared inbox)\n• Track sales deals from start to finish (pipeline)\n• Send bulk updates and offers (broadcasts)\n• Run your own online store (storefront)\n• Collect Google Reviews automatically\n• Automate follow-ups and workflows without coding\n\nThe best part? Everything works together in one place. No more switching between 5 different apps.", "ask_business")
    } else {
      botRespond("Bahut badhiya! Chalo simple language mein samajhte hain:\n\nVbuild CRM aapko WhatsApp par apna poora business chalane mein help karta hai. Aap WhatsApp par hi ye sab kar sakte hain:\n\n• Saare customer chats ko team ke saath manage karein\n• Sales deals ko track karein\n• Bulk messages aur offers bhejein\n• Apna online store chalaayein\n• Google Reviews automatically collect karein\n• Follow-ups aur workflows automate karein bina coding ke\n\nSabse acchi baat? Sab kuch ek hi jagah kaam karta hai. 5 alag apps mein switch karne ki zaroorat nahi.", "ask_business")
    }
  }

  function handleBiz(value: string) {
    const opt = BUSINESS_OPTIONS.find((o) => o.value === value)
    setMessages((prev) => [...prev, { role: "user", text: opt?.label || value }])
    const r = RESULTS[value]
    if (!r) return
    const t = (lang === "en" ? "Here's how Vbuild CRM can help you generate profit:\n\n" : "Aapke business ke liye Vbuild CRM:\n\n") + r.points.map((p) => "• " + p).join("\n") + "\n\n" + r.stat
    botRespond(t, "closing")
  }

  function handleStartTrial() {
    window.open("/signup", "_blank")
    setMessages((prev) => [...prev, { role: "user", text: "Start free trial" }])
    botRespond(lang === "en" ? "Amazing! Head over to vbuildcrm.com/signup to start your free trial. No credit card needed. If you have any questions, just come back and ask!" : "Shaandaar! Aap vbuildcrm.com/signup par jaake free trial start kar sakte hain. Credit card ki zaroorat nahi. Koi sawaal ho toh wapas aa ke poochhiye!", "closing")
  }

  function handleQuestion() {
    setMessages((prev) => [...prev, { role: "user", text: "I have more questions" }])
    botRespond(lang === "en" ? "You can email us at sales@vbuildcrm.com or start a free trial to explore the platform yourself!" : "Aap humein sales@vbuildcrm.com par email kar sakte hain ya free trial start karke platform explore kar sakte hain!", "closing")
  }

  const lastBotIdx = (() => { for (let i = messages.length - 1; i >= 0; i--) { if (messages[i].role === "bot") return i } return -1 })()

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-4 flex w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/40 animate-in slide-in-from-bottom-6 fade-in duration-300">
          <div className="flex items-center justify-between bg-gradient-to-r from-primary via-primary to-violet-600 px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2.5">
              <BotAvatar />
              <div>
                <p className="text-sm font-semibold">Vbuild Assistant</p>
                <p className="text-[10px] opacity-80">Online — I speak English & Hinglish</p>
              </div>
            </div>
            <button onClick={() => { setOpen(false); setSpeakingIdx(null); try { window.speechSynthesis?.cancel() } catch {} }} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px] min-h-[300px]">
            {messages.map((msg, idx) => {
              const isLastBot = msg.role === "bot" && idx === lastBotIdx
              const showTw = isLastBot && !typing
              const showThinking = isLastBot && typing

              return (
                <div key={idx} className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "bot" && <BotAvatar />}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line relative ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm border border-border/50"}`}>
                    {showTw ? (
                      <TypeWriter text={msg.text} speed={18} onDone={() => setBotDone(true)} />
                    ) : showThinking ? (
                      <div className="flex items-center gap-1 py-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              )
            })}

            {/* Speak button — always visible below the last bot message */}
            {lastBotIdx >= 0 && !typing && botDone && (
              <div className="flex justify-start pl-9">
                <button
                  onClick={() => speak(messages[lastBotIdx].text, lastBotIdx)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95"
                >
                  {speakingIdx === lastBotIdx ? (
                    <><VolumeX className="h-3 w-3" /> Stop</>
                  ) : (
                    <><Volume2 className="h-3 w-3" /> Listen ({lang === "hi" ? "हिंदी" : "English"})</>
                  )}
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {step === "choose_lang" && botDone && (
            <div className="flex gap-2 px-4 pb-4">
              <button onClick={() => handleLang("en")} className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-md active:scale-[0.98]">🇬🇧 English</button>
              <button onClick={() => handleLang("hi")} className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-md active:scale-[0.98]">🗣️ Hinglish</button>
            </div>
          )}

          {step === "ask_business" && botDone && (
            <div className="flex flex-col gap-1.5 px-4 pb-4">
              <p className="text-xs text-muted-foreground px-1">{lang === "en" ? "What kind of business do you have?" : "Aapka business kis type ka hai?"}</p>
              {BUSINESS_OPTIONS.map((o) => (
                <button key={o.value} onClick={() => handleBiz(o.value)} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-left text-sm font-medium transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-md active:scale-[0.98]">{o.label}</button>
              ))}
            </div>
          )}

          {step === "closing" && botDone && (
            <div className="flex gap-2 px-4 pb-4">
              <button onClick={handleStartTrial} className="flex-1 rounded-xl bg-gradient-to-r from-primary to-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]">🚀 Start Free Trial</button>
              <button onClick={handleQuestion} className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted active:scale-[0.98]">❓ More Questions</button>
            </div>
          )}
        </div>
      )}

      <div className="relative">
        {!open && (
          <>
            <span className={`absolute -inset-3 rounded-full bg-primary/20 blur-xl transition-opacity duration-1000 ${pulse ? "opacity-100 scale-110" : "opacity-0"}`} />
            <span className={`absolute -inset-1.5 rounded-full border-2 border-primary/30 transition-all duration-1000 ${pulse ? "scale-110 opacity-0" : "scale-90 opacity-0"}`} style={pulse ? { animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" } : {}} />
          </>
        )}
        <button onClick={() => setOpen(!open)} className={`relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 ${open ? "bg-muted-foreground rotate-90 scale-95" : `bg-gradient-to-r from-primary to-violet-600 hover:scale-105 hover:shadow-lg hover:shadow-primary/40 ${pulse ? "scale-110 animate-pulse" : ""}`}`}>
          {open ? <X className="h-6 w-6 text-white" /> : (
            <div className="relative">
              <MessageCircle className="h-6 w-6 text-primary-foreground" />
              {pulse && (
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
                </span>
              )}
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
