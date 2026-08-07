"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquareCode,
  LogIn,
  Sparkles,
  Zap,
  LayoutDashboard,
  MessageSquare,
  Users,
  Kanban,
  Send,
  Bot,
  GitFork,
  Settings,
  MessagesSquare,
  Rocket,
} from "lucide-react";

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState({
    image: "07_dashboard.png",
    title: "Dashboard Analytics",
  });

  const [simMessages, setSimMessages] = useState([
    {
      type: "inbound",
      text: '👋 Hi! Welcome to Vbuild CRM! Type "DEMO" or tap send to test our instant automated WhatsApp bot live!',
      time: "19:45",
    },
  ]);
  const [simInput, setSimInput] = useState("");

  const handleSendSim = () => {
    if (!simInput.trim()) return;
    const text = simInput.trim();
    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setSimMessages((prev) => [
      ...prev,
      { type: "outbound", text, time: timeStr },
    ]);
    setSimInput("");

    setTimeout(() => {
      const lower = text.toLowerCase();
      let botResponse = `Thanks for messaging: "${text}"! Vbuild CRM automatically routes this chat to your assigned sales agent and updates your pipeline stage in real-time. ⚡`;
      if (lower.includes("demo")) {
        botResponse = `🚀 Vbuild CRM Live Demo Bot:\n\n✓ 10-Second Lead Response\n✓ Shared Team Inbox\n✓ Visual Sales Pipeline\n\nClick here to explore your live dashboard: https://vbuild-automation.netlify.app/dashboard`;
      }
      setSimMessages((prev) => [
        ...prev,
        { type: "inbound", text: botResponse, time: timeStr },
      ]);
    }, 800);
  };

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      image: "07_dashboard.png",
      title: "Dashboard Analytics",
    },
    {
      id: "inbox",
      label: "Shared Inbox",
      icon: MessageSquare,
      image: "08_inbox.png",
      title: "Shared Team WhatsApp Inbox",
    },
    {
      id: "contacts",
      label: "Contacts",
      icon: Users,
      image: "09_contacts.png",
      title: "Contact Database & Tags",
    },
    {
      id: "pipelines",
      label: "Sales Pipeline",
      icon: Kanban,
      image: "10_sales_pipelines.png",
      title: "Kanban Sales Pipelines",
    },
    {
      id: "broadcasts",
      label: "Broadcasts",
      icon: Send,
      image: "11_broadcasts.png",
      title: "Mass Campaign Broadcasts",
    },
    {
      id: "automations",
      label: "Automations",
      icon: Bot,
      image: "12_automations.png",
      title: "No-Code Automation Engine",
    },
    {
      id: "flows",
      label: "Visual Flows",
      icon: GitFork,
      image: "13_visual_flows.png",
      title: "Visual Chatbot Builder",
    },
    {
      id: "settings",
      label: "Meta Config",
      icon: Settings,
      image: "15_settings.png",
      title: "Meta API & Settings",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-100px] left-[20%] w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-100px] right-[10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-[5%] py-4 backdrop-blur-md bg-[#030712]/80 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold text-white tracking-tight">
          <MessageSquareCode className="w-7 h-7 text-emerald-400" />
          Vbuild CRM
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-bold text-[10px] px-2 py-0.5 rounded uppercase">
            Live Demo
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gray-800/60 border border-gray-700 hover:border-emerald-500 transition-all text-white"
          >
            <LogIn className="w-4 h-4" /> Log In
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center px-[5%] pt-16 pb-10 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
          <Zap className="w-4 h-4" /> Interactive Product Showcase
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          The WhatsApp Revenue Engine Built for{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Rapid Sales Growth
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
          Explore the complete live user journey from lead discovery, team inbox collaboration, kanban sales pipelines, to 24/7 automated chatbot workflows.
        </p>
      </section>

      {/* Showcase Screen Tabs */}
      <section className="max-w-7xl mx-auto px-[5%] mb-20">
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab.image === tab.image;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab({ image: tab.image, title: tab.title })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold border transition-all ${
                  isActive
                    ? "bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-gray-900/60 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Screen Window Box */}
        <div className="bg-[#0d1117] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-950/20">
          <div className="bg-[#161b22] px-4 py-3 flex items-center justify-between border-b border-gray-800">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs text-gray-400 font-medium">
              {activeTab.title} — Vbuild CRM
            </div>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Preview
            </div>
          </div>
          <div className="relative bg-black min-h-[500px]">
            <img
              src={`/crm_screenshots/${activeTab.image}`}
              alt={activeTab.title}
              className="w-full h-auto block transition-all duration-300"
            />
          </div>
        </div>
      </section>

      {/* Feature Cards + Live Simulator */}
      <section className="max-w-7xl mx-auto px-[5%] mb-24 grid md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-7 grid sm:grid-cols-2 gap-4">
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <MessagesSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">Shared WhatsApp Team Inbox</h3>
            <p className="text-sm text-gray-400">
              Multiple sales agents can respond to customer chats simultaneously using one single official WhatsApp Business number.
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">24/7 AI Lead Qualification</h3>
            <p className="text-sm text-gray-400">
              Qualify student, real-estate, and medical leads instantly with visual interactive chatbot questions before routing to reps.
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Kanban className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">Kanban Sales Pipelines</h3>
            <p className="text-sm text-gray-400">
              Drag-and-drop deals across customized sales stages to make sure no prospect drops through the cracks.
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Send className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">Targeted WhatsApp Broadcasts</h3>
            <p className="text-sm text-gray-400">
              Send personalized promotional campaigns with high open rates safely using Meta Cloud API.
            </p>
          </div>
        </div>

        {/* Live Phone Chatbot Simulator */}
        <div className="md:col-span-5 bg-slate-900 border-8 border-slate-800 rounded-[36px] overflow-hidden shadow-2xl h-[560px] flex flex-col">
          <div className="bg-[#075e54] text-white p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#128c7e] font-bold text-xs flex items-center justify-center">
              V
            </div>
            <div>
              <div className="font-bold text-sm">Vbuild Assistant</div>
              <div className="text-[10px] text-emerald-300">online</div>
            </div>
          </div>

          <div className="flex-1 bg-[#0b141a] p-3 overflow-y-auto flex flex-col gap-2">
            {simMessages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] p-2.5 rounded-xl text-xs whitespace-pre-line ${
                  msg.type === "inbound"
                    ? "bg-[#202c33] text-gray-100 self-start rounded-tl-none"
                    : "bg-[#005c4b] text-gray-100 self-end rounded-tr-none"
                }`}
              >
                {msg.text}
                <div className="text-[9px] text-gray-400 text-right mt-1">{msg.time}</div>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-[#202c33] flex gap-2">
            <input
              type="text"
              value={simInput}
              onChange={(e) => setSimInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendSim()}
              placeholder='Type "DEMO"...'
              className="flex-1 bg-[#2a3942] text-white px-3 py-1.5 rounded-full text-xs outline-none"
            />
            <button
              onClick={handleSendSim}
              className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:scale-105 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="text-center py-16 px-[5%] border-t border-gray-800 bg-[#030712]">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          Ready to Transform Your WhatsApp Sales?
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">
          Join businesses using Vbuild CRM to automate lead qualification, unify team communications, and close 3x more deals.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/signup"
            className="flex items-center gap-2 px-8 py-3.5 text-base font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all"
          >
            <Rocket className="w-5 h-5" /> Start Free Setup Today
          </Link>
        </div>
      </footer>
    </div>
  );
}
