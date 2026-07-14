"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle, X, Send, Sparkles } from "lucide-react"

interface Message {
  role: "bot" | "user"
  text: string
}

type Step =
  | "greeting"
  | "choose_lang"
  | "explain_en"
  | "explain_hi"
  | "ask_business"
  | "result_ecommerce"
  | "result_service"
  | "result_realestate"
  | "result_education"
  | "result_healthcare"
  | "result_other"
  | "closing"

const BUSINESS_OPTIONS = [
  { value: "ecommerce", label: "🛍️  E-commerce / Retail", emoji: "🛍️" },
  { value: "service", label: "💼  Service Business", emoji: "💼" },
  { value: "realestate", label: "🏠  Real Estate", emoji: "🏠" },
  { value: "education", label: "📚  Education / Coaching", emoji: "📚" },
  { value: "healthcare", label: "🏥  Healthcare", emoji: "🏥" },
  { value: "other", label: "🤔  Something else", emoji: "🤔" },
]

const RESULTS: Record<string, { title: string; points: string[]; stat: string }> = {
  ecommerce: {
    title: "E-commerce ke liye Vbuild CRM",
    points: [
      "WhatsApp Storefront — customers directly browse karein aur order karein, website ki zaroorat nahi",
      "Auto order confirmation aur delivery updates — WhatsApp template messages se",
      "Naye products aur offers ka broadcast — ek click mein saare customers ko bhejein",
      "Delivery ke baad auto Google Review request — zyada reviews, zyada trust",
    ],
    stat: "E-commerce businesses typically see 3X more ROI and 30% shorter sales cycles.",
  },
  service: {
    title: "Service Business ke liye Vbuild CRM",
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
    title: "Real Estate ke liye Vbuild CRM",
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
    title: "Education / Coaching ke liye Vbuild CRM",
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
    title: "Healthcare ke liye Vbuild CRM",
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
    title: "Aapke business ke liye Vbuild CRM",
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

function TypeWriter({ text, speed = 30, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("")
  const indexRef = useRef(0)

  useEffect(() => {
    indexRef.current = 0
    setDisplayed("")
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1))
        indexRef.current++
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "bot",
          text: "Hey there! 👋 I'm Vbuild's assistant. I can explain what we do in simple English or Hinglish — whatever works for you!",
        },
      ])
      setStep("choose_lang")
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typing])

  function addBotMessage(text: string, newStep: Step) {
    setTyping(true)
    setBotDone(false)
    setMessages((prev) => [...prev, { role: "bot", text }])
    setStep(newStep)

    const estimatedTime = Math.max(1500, text.length * 25)
    timeoutRef.current = setTimeout(() => {
      setTyping(false)
      setBotDone(true)
    }, estimatedTime)
  }

  function botSay(text: string, newStep: Step) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setTyping(false)
    setBotDone(false)
    addBotMessage(text, newStep)
  }

  function handleLang(selected: "en" | "hi") {
    setLang(selected)
    if (selected === "en") {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: "English" },
      ])
      botSay(
        `Great choice! Here's the simple version of what Vbuild CRM does for you:

Vbuild CRM is a complete business platform that runs inside WhatsApp. Think of it as your WhatsApp control center — you can:

• Manage all customer chats as a team (shared inbox)
• Track sales deals from start to finish (pipeline)
• Send bulk updates and offers (broadcasts)
• Run your own online store (storefront)
• Collect Google Reviews automatically
• Automate follow-ups and workflows without coding

And the best part? Everything works together in one place. No more switching between 5 different apps.`,
        "ask_business",
      )
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: "Hinglish" },
      ])
      botSay(
        `Bahut badhiya! 🎉 Chalo simple language mein samajhte hain:

Vbuild CRM aapko WhatsApp par apna poora business chalane mein help karta hai. Ek dum simple — aap WhatsApp par hi ye sab kar sakte hain:

• Saare customer chats ko team ke saath manage karein (shared inbox)
• Sales deals ko track karein (pipeline)
• Bulk messages aur offers bhejein (broadcasts)
• Apna online store chalaayein (storefront)
• Google Reviews automatically collect karein
• Follow-ups aur workflows automate karein bina coding ke

Aur sabse acchi baat? Sab kuch ek hi jagah kaam karta hai. 5 alag apps mein switch karne ki zaroorat nahi.`,
        "ask_business",
      )
    }
  }

  function handleBusinessSelect(value: string) {
    const opt = BUSINESS_OPTIONS.find((o) => o.value === value)
    setMessages((prev) => [...prev, { role: "user", text: opt?.label || value }])

    const result = RESULTS[value]
    if (!result) return

    const resultText = [
      lang === "en" ? `Awesome! Here's how Vbuild CRM can help you generate profit:` : `${result.title}:`,
      "",
      ...result.points.map((p) => `• ${p}`),
      "",
      lang === "en" ? `💡 ${result.stat}` : `💡 ${result.stat}`,
    ].join("\n")

    botSay(resultText, "closing")
  }

  function handleStartTrial() {
    window.open("/signup", "_blank")
    setMessages((prev) => [...prev, { role: "user", text: "Start free trial" }])
    botSay(
      lang === "en"
        ? "Amazing! Head over to vbuildcrm.com/signup to start your free trial. No credit card needed. If you have any questions, just come back and ask — I'm always here! 🚀"
        : "Shaandaar! 🚀 Aap vbuildcrm.com/signup par jaake free trial start kar sakte hain. Credit card ki zaroorat nahi. Koi sawaal ho toh wapas aa ke poochhiye — mein hamesha yahaan hoon! 😊",
      "closing",
    )
  }

  function handleQuestion() {
    setMessages((prev) => [...prev, { role: "user", text: "I have more questions" }])
    botSay(
      lang === "en"
        ? "Sure! You can reach our team at sales@vbuildcrm.com or start a free trial to explore the platform yourself. What would you like to know more about?"
        : "Bilkul! Aap humein sales@vbuildcrm.com par email kar sakte hain ya free trial start karke platform khud explore kar sakte hain. Aap kya aur jaanna chahenge?",
      "closing",
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-4 flex w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/40 animate-in slide-in-from-bottom-6 fade-in duration-300">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Vbuild Assistant</p>
                <p className="text-[10px] opacity-80">Online — I speak English & Hinglish</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px] min-h-[300px]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm border border-border/50"
                  }`}
                >
                  {msg.role === "bot" && idx === messages.length - 1 ? (
                    <TypeWriter
                      text={msg.text}
                      speed={18}
                      onDone={() => {
                        setBotDone(true)
                        setTyping(false)
                      }}
                    />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-muted border border-border/50 px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {step === "choose_lang" && botDone && (
            <div className="flex gap-2 px-4 pb-4">
              <button
                onClick={() => handleLang("en")}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                🇬🇧 English
              </button>
              <button
                onClick={() => handleLang("hi")}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
              >
                🗣️ Hinglish
              </button>
            </div>
          )}

          {step === "ask_business" && botDone && (
            <div className="flex flex-col gap-1.5 px-4 pb-4">
              <p className="text-xs text-muted-foreground px-1">
                {lang === "en" ? "What kind of business do you have?" : "Aapka business kis type ka hai?"}
              </p>
              {BUSINESS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleBusinessSelect(opt.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {step === "closing" && botDone && (
            <div className="flex gap-2 px-4 pb-4">
              <button
                onClick={handleStartTrial}
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                🚀 Start Free Trial
              </button>
              <button
                onClick={handleQuestion}
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                ❓ More Questions
              </button>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 ${
          open
            ? "bg-muted-foreground rotate-90 scale-95"
            : "bg-primary hover:scale-105 hover:shadow-primary/30"
        }`}
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        )}
      </button>
    </div>
  )
}
