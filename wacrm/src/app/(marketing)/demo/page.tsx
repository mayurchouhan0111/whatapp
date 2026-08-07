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
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Play,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState({
    id: "dashboard",
    image: "07_dashboard.png",
    title: "Dashboard Analytics & KPI Overview",
    description:
      "Real-time visibility into message volume, agent performance, lead response speed, and total pipeline revenue.",
    hotspots: [
      { x: "20%", y: "25%", label: "Live Conversion Rate", detail: "Tracks lead response times under 10 seconds" },
      { x: "75%", y: "30%", label: "Message Delivery SLA", detail: "99.9% WhatsApp Meta Cloud API delivery rate" },
    ],
  });

  const [monthlyLeads, setMonthlyLeads] = useState(300);
  const [dealValue, setDealValue] = useState(15000);

  const [simMessages, setSimMessages] = useState([
    {
      type: "inbound",
      text: "👋 Hi! Welcome to Vbuild CRM! Tap any option below to test our instant 2-way automated WhatsApp engine live:",
      time: "19:45",
    },
  ]);
  const [simInput, setSimInput] = useState("");

  const handleSendSim = (customText?: string) => {
    const text = (customText || simInput).trim();
    if (!text) return;
    const timeStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setSimMessages((prev) => [
      ...prev,
      { type: "outbound", text, time: timeStr },
    ]);
    if (!customText) setSimInput("");

    setTimeout(() => {
      const lower = text.toLowerCase();
      let botResponse = `Thanks for messaging: "${text}"! Vbuild CRM automatically assigned this contact to your sales rep and moved their pipeline stage to 'Qualified Lead' ⚡`;
      
      if (lower.includes("pricing") || lower.includes("plan")) {
        botResponse = `💰 **Vbuild CRM Starter Plan**:\n\n• Shared WhatsApp Team Inbox (5 Agents)\n• Automated Qualification Chatbot\n• Unlimited Contacts & Broadcasts\n\nStarting at just ₹2,999/mo! Reply 'START' to activate.`;
      } else if (lower.includes("demo") || lower.includes("how")) {
        botResponse = `🚀 **How Vbuild CRM Automates Sales**:\n\n1. Lead clicks your Meta/Google Ad\n2. Vbuild CRM sends WhatsApp catalog in 10s\n3. Chatbot qualifies the buyer automatically\n4. Sales rep closes deal in Team Inbox!`;
      } else if (lower.includes("book") || lower.includes("setup")) {
        botResponse = `📅 **Done-For-You Free Setup**:\nOur technical team will configure your Meta Business API, WhatsApp templates, and CRM pipeline for FREE!\n\nOpen Calendar: https://vbuild-automation.netlify.app/dashboard`;
      }

      setSimMessages((prev) => [
        ...prev,
        { type: "inbound", text: botResponse, time: timeStr },
      ]);
    }, 700);
  };

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      image: "07_dashboard.png",
      title: "Dashboard Analytics & KPI Overview",
      description: "Real-time visibility into response times, message volume, and total deal conversions.",
      hotspots: [
        { x: "25%", y: "22%", label: "Lead Response Time", detail: "Average response speed: 8.4 seconds" },
        { x: "70%", y: "25%", label: "Active Revenue", detail: "Calculated live across open pipeline deals" },
      ],
    },
    {
      id: "inbox",
      label: "Shared Inbox",
      icon: MessageSquare,
      image: "08_inbox.png",
      title: "Unified Team WhatsApp Inbox",
      description: "Allow 5+ sales reps to handle customer conversations from a single official WhatsApp Business number.",
      hotspots: [
        { x: "20%", y: "40%", label: "Multi-Agent Queue", detail: "Assign chats to reps in 1 click" },
        { x: "65%", y: "50%", label: "Rich Media Attachments", detail: "Send PDFs, property brochures, and catalogs" },
      ],
    },
    {
      id: "contacts",
      label: "Contacts",
      icon: Users,
      image: "09_contacts.png",
      title: "Smart Contact Management & Tags",
      description: "Automatically segment contacts with custom tags, custom fields, and automated opt-out safety.",
      hotspots: [
        { x: "30%", y: "35%", label: "Tag Segmentation", detail: "Filter by 'Hot Lead', 'Real Estate', or 'Coaching'" },
      ],
    },
    {
      id: "pipelines",
      label: "Sales Pipelines",
      icon: Kanban,
      image: "10_sales_pipelines.png",
      title: "Kanban Visual Sales Pipeline",
      description: "Drag-and-drop deals across custom stages to track lead progress from inquiry to closed-won.",
      hotspots: [
        { x: "22%", y: "30%", label: "Inquiry Stage", detail: "Auto-created when lead messages on WhatsApp" },
        { x: "80%", y: "30%", label: "Closed-Won Deals", detail: "Tracks total revenue generated per rep" },
      ],
    },
    {
      id: "broadcasts",
      label: "Broadcasts",
      icon: Send,
      image: "11_broadcasts.png",
      title: "Targeted WhatsApp Broadcast Campaigns",
      description: "Send high-converting promotional broadcasts with Meta-approved templates and high open rates.",
      hotspots: [
        { x: "50%", y: "35%", label: "Meta Approved Templates", detail: "98% open rates compared to 15% in email" },
      ],
    },
    {
      id: "automations",
      label: "Automations",
      icon: Bot,
      image: "12_automations.png",
      title: "No-Code Automation Engine",
      description: "Create automated welcome series, keyword auto-replies, and instant CRM deal triggers.",
      hotspots: [
        { x: "40%", y: "45%", label: "Keyword Triggers", detail: "Fires when prospects text DEMO, INFO, or YES" },
      ],
    },
    {
      id: "flows",
      label: "Visual Chatbot Flows",
      icon: GitFork,
      image: "13_visual_flows.png",
      title: "Drag-and-Drop Visual Flow Builder",
      description: "Design multi-branch interactive chatbot questionnaires without writing a single line of code.",
      hotspots: [
        { x: "45%", y: "40%", label: "Interactive Buttons", detail: "1-tap quick reply options for clients" },
      ],
    },
    {
      id: "settings",
      label: "Meta Config",
      icon: Settings,
      image: "15_settings.png",
      title: "Meta Cloud API & WhatsApp Setup",
      description: "Connect your official WhatsApp Business number, API keys, and verify webhook routing in 2 minutes.",
      hotspots: [
        { x: "35%", y: "30%", label: "Meta Official API", detail: "Green Badge verified business number support" },
      ],
    },
  ];

  // ROI Calculator Math
  const estimatedRevenueIncrease = Math.round((monthlyLeads * 0.15) * dealValue);

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Background Ambient Glow Effects */}
      <div className="fixed top-[-150px] left-[15%] w-[650px] h-[650px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-[-100px] right-[10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-[5%] py-4 backdrop-blur-xl bg-[#030712]/85 border-b border-gray-800/80">
        <Link href="/" className="flex items-center gap-3 text-xl font-extrabold text-white tracking-tight">
          <MessageSquareCode className="w-8 h-8 text-emerald-400" />
          Vbuild CRM
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
            Ultra Demo 2.0
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gray-900 border border-gray-800 hover:border-emerald-500/60 transition-all text-white"
          >
            <LogIn className="w-4 h-4" /> Log In
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="w-4 h-4" /> Start Free Setup
          </Link>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="text-center px-[5%] pt-16 pb-12 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6 shadow-inner">
          <Zap className="w-4 h-4" /> Interactive WhatsApp Product Tour
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.12] mb-6">
          Convert 3x More Leads with Our{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            WhatsApp Revenue Engine
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
          Stop losing ad prospects to slow follow-ups. Experience how Vbuild CRM unifies your sales team, automates qualification chatbots, and tracks every deal in real-time.
        </p>
      </section>

      {/* Device Showcase Frame with Interactive Hotspots */}
      <section className="max-w-7xl mx-auto px-[5%] mb-24">
        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab.id === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab({
                    id: tab.id,
                    image: tab.image,
                    title: tab.title,
                    description: tab.description,
                    hotspots: tab.hotspots,
                  })
                }
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold border transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/15 border-emerald-500 text-white shadow-xl shadow-emerald-500/20 scale-105"
                    : "bg-gray-900/70 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* MacBook Pro Sleek Shell */}
        <div className="bg-[#0f172a] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-950/30">
          <div className="bg-[#1e293b] px-5 py-3.5 flex items-center justify-between border-b border-gray-800">
            <div className="flex gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs md:text-sm text-gray-300 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> {activeTab.title}
            </div>
            <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" /> Live Preview
            </div>
          </div>

          <div className="relative bg-black min-h-[550px] overflow-hidden group">
            <img
              src={`/crm_screenshots/${activeTab.image}`}
              alt={activeTab.title}
              className="w-full h-auto block transition-all duration-300 group-hover:scale-[1.01]"
            />

            {/* Pulsing Feature Hotspots */}
            {activeTab.hotspots.map((spot, idx) => (
              <div
                key={idx}
                className="absolute z-20 group/spot cursor-pointer"
                style={{ top: spot.y, left: spot.x }}
              >
                <span className="relative flex h-6 w-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-500 text-black font-extrabold text-[10px] items-center justify-center shadow-lg">
                    {idx + 1}
                  </span>
                </span>

                {/* Tooltip Card */}
                <div className="absolute left-8 top-0 hidden group-hover/spot:block bg-gray-900/95 border border-emerald-500/50 p-3 rounded-xl shadow-2xl w-60 z-30 backdrop-blur-md">
                  <div className="text-xs font-bold text-emerald-400 mb-1">{spot.label}</div>
                  <div className="text-[11px] text-gray-300">{spot.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#1e293b]/70 p-4 px-6 border-t border-gray-800 text-center text-sm text-gray-300">
            💡 <span className="font-semibold text-emerald-400">{activeTab.title}:</span> {activeTab.description}
          </div>
        </div>
      </section>

      {/* Feature Grid + Interactive Phone Chatbot Simulator */}
      <section className="max-w-7xl mx-auto px-[5%] mb-28 grid md:grid-cols-12 gap-8 items-start">
        {/* Core Benefits Breakdown */}
        <div className="md:col-span-7 space-y-4">
          <h2 className="text-2xl md:text-3xl font-black mb-6 flex items-center gap-3">
            <MessagesSquare className="w-7 h-7 text-emerald-400" />
            Why Top Brands Choose Vbuild CRM
          </h2>

          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/60 transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Shared WhatsApp Team Number</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Connect 1 official Meta WhatsApp Business number and let your entire sales & support staff manage customer chats simultaneously without sharing phone OTPs.
              </p>
            </div>
          </div>

          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/60 transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">24/7 Automated Qualification Bot</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Automatically reply to Facebook and Google ad leads within 10 seconds. Collect requirements, share digital brochures, and filter hot prospects automatically.
              </p>
            </div>
          </div>

          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 hover:border-emerald-500/60 transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Kanban className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Kanban Sales Pipeline</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Never lose track of a lead. Drag and drop deals across stages like Inquiry, Demo Scheduled, Proposal Sent, and Closed-Won.
              </p>
            </div>
          </div>
        </div>

        {/* Live Phone WhatsApp Bot Simulator */}
        <div className="md:col-span-5 bg-[#0f172a] border-[10px] border-slate-800 rounded-[42px] overflow-hidden shadow-2xl h-[600px] flex flex-col">
          <div className="bg-[#075e54] text-white p-3.5 flex items-center gap-3 shadow-md">
            <div className="w-9 h-9 rounded-full bg-[#128c7e] font-extrabold text-sm flex items-center justify-center shadow-inner">
              V
            </div>
            <div>
              <div className="font-bold text-sm">Vbuild Sales Assistant</div>
              <div className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Online (24/7 Bot)
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0b141a] p-3.5 overflow-y-auto flex flex-col gap-2.5">
            {simMessages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                  msg.type === "inbound"
                    ? "bg-[#202c33] text-gray-100 self-start rounded-tl-none shadow"
                    : "bg-[#005c4b] text-gray-100 self-end rounded-tr-none shadow"
                }`}
              >
                {msg.text}
                <div className="text-[9px] text-gray-400 text-right mt-1.5">{msg.time}</div>
              </div>
            ))}
          </div>

          {/* Preset Interactive Chips */}
          <div className="bg-[#111b21] p-2 flex gap-1.5 overflow-x-auto border-t border-gray-800">
            <button
              onClick={() => handleSendSim("🔥 See Pricing Plans")}
              className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold whitespace-nowrap hover:bg-emerald-500/25"
            >
              🔥 Pricing Plans
            </button>
            <button
              onClick={() => handleSendSim("⚡ How CRM Auto-Responder Works")}
              className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 text-[10px] font-bold whitespace-nowrap hover:bg-cyan-500/25"
            >
              ⚡ How It Works
            </button>
            <button
              onClick={() => handleSendSim("📅 Book Free Setup Call")}
              className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[10px] font-bold whitespace-nowrap hover:bg-amber-500/25"
            >
              📅 Book Setup
            </button>
          </div>

          {/* Simulator Input Box */}
          <div className="p-3 bg-[#202c33] flex gap-2">
            <input
              type="text"
              value={simInput}
              onChange={(e) => setSimInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendSim()}
              placeholder="Type your message..."
              className="flex-1 bg-[#2a3942] text-white px-3.5 py-2 rounded-full text-xs outline-none placeholder:text-gray-400"
            />
            <button
              onClick={() => handleSendSim()}
              className="w-8 h-8 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:scale-105 transition-all shadow"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Revenue & ROI Calculator */}
      <section className="max-w-5xl mx-auto px-[5%] mb-28">
        <div className="bg-gradient-to-br from-gray-900 via-[#0f172a] to-gray-900 border border-emerald-500/30 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-3">
              <TrendingUp className="w-4 h-4" /> Revenue Increase Calculator
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold">Calculate Your Extra Revenue with Vbuild CRM</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span>Monthly Ad Leads</span>
                  <span className="text-emerald-400 font-bold">{monthlyLeads} leads/mo</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="50"
                  value={monthlyLeads}
                  onChange={(e) => setMonthlyLeads(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span>Average Deal Value (₹)</span>
                  <span className="text-emerald-400 font-bold">₹{dealValue.toLocaleString("en-IN")}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="100000"
                  step="1000"
                  value={dealValue}
                  onChange={(e) => setDealValue(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-black/60 border border-gray-800 rounded-2xl p-6 text-center">
              <div className="text-xs text-gray-400 font-medium mb-1">Estimated Additional Monthly Revenue</div>
              <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
                +₹{estimatedRevenueIncrease.toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-emerald-400 font-semibold">
                *Based on a 15% increase in lead conversion speed via Instant WhatsApp Automation
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="text-center py-20 px-[5%] border-t border-gray-800/80 bg-[#030712]">
        <h2 className="text-3xl md:text-5xl font-black mb-4">
          Ready to Start Generating Paid Sales?
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-8 text-base">
          Join leading real estate agencies, coaching institutes, and clinics using Vbuild CRM.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/signup"
            className="flex items-center gap-2 px-8 py-4 text-base font-bold rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all"
          >
            <Rocket className="w-5 h-5" /> Start Free Setup Today
          </Link>
        </div>
      </footer>
    </div>
  );
}
