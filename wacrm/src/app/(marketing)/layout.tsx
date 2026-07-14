import { type ReactNode } from "react"
import { ChatbotWidget } from "@/components/marketing/chatbot-widget"

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ChatbotWidget />
    </>
  )
}
