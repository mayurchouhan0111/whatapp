"use client";

import { useStore } from "./store-context";
import { MessageCircle, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function FloatingWhatsAppCTA() {
  const { store } = useStore();
  const [expanded, setExpanded] = useState(false);

  if (!store?.whatsapp_number) return null;

  const waNumber = store.whatsapp_number.replace(/\D/g, "");

  return (
    <div className="fixed bottom-24 right-4 z-30 hidden md:block">
      {expanded && (
        <div className="animate-slide-in-bottom mb-2">
          <a
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Hi! I need help with my order.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white shadow-xl rounded-2xl px-4 py-3 border border-[#E2E8F0]/60 hover:shadow-2xl transition-all group"
          >
            <div className="size-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-md">
              <MessageCircle className="size-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#0B0F19]">Need Help?</p>
              <p className="text-[10px] text-[#64748B]">Chat on WhatsApp</p>
            </div>
            <ChevronRight className="size-4 text-[#64748B] group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      )}
      <button
        onClick={() => setExpanded(!expanded)}
        className="size-14 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer"
        style={{ boxShadow: "0 4px 20px rgba(37,211,102,0.35)" }}
      >
        <MessageCircle className="size-6" />
      </button>
    </div>
  );
}
