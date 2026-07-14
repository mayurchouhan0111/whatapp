"use client"

import { useState } from "react"
import { MessageSquare, GitBranch, Radio, BarChart3, Users, Bell, Clock, CheckCircle, TrendingUp, Target } from "lucide-react"
import { SectionKicker } from "./section-kicker"

const TABS = [
  {
    id: "inbox",
    icon: MessageSquare,
    label: "Inbox",
    description: "Unified team inbox for all WhatsApp conversations. Assign, tag, and track every message.",
    color: "from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
    borderColor: "border-violet-500/30",
    metrics: [
      { label: "Active chats", value: "12", color: "text-emerald-500" },
      { label: "Unread", value: "4", color: "text-rose-500" },
      { label: "Avg response", value: "2m", color: "text-amber-500" },
    ],
    chats: [
      { name: "Priya Sharma", msg: "Hi! I'm interested in your premium plan...", time: "2m ago", active: true },
      { name: "Rahul Verma", msg: "Can you share the product catalog?", time: "15m ago", active: false },
      { name: "Ananya Gupta", msg: "When will my order be delivered?", time: "1h ago", active: false },
    ],
  },
  {
    id: "pipeline",
    icon: GitBranch,
    label: "Pipeline",
    description: "Visual Kanban board synced with WhatsApp. Drag deals, track value, message customers.",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500/30",
    stages: [
      { name: "New Lead", count: "8", value: "$12.4K" },
      { name: "Qualified", count: "5", value: "$18.7K" },
      { name: "Proposal", count: "3", value: "$24.1K" },
    ],
  },
  {
    id: "broadcast",
    icon: Radio,
    label: "Broadcast",
    description: "Send template messages with delivery tracking, read receipts, and smart segmentation.",
    color: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/30",
    campaigns: [
      { name: "Weekend Offer", sent: "2,450", delivered: "2,328", rate: "95%" },
      { name: "New Product Launch", sent: "1,200", delivered: "1,152", rate: "96%" },
    ],
  },
  {
    id: "analytics",
    icon: BarChart3,
    label: "Analytics",
    description: "Real-time dashboards for response times, deal velocity, agent performance, and more.",
    color: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-500",
    borderColor: "border-rose-500/30",
    stats: [
      { label: "Messages Today", value: "1,847", change: "+12%", positive: true },
      { label: "Deals Closed", value: "23", change: "+8%", positive: true },
      { label: "Response Time", value: "1.8m", change: "-15%", positive: true },
    ],
  },
]

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const tab = TABS.find((t) => t.id === activeTab)!

  return (
    <section className="border-b border-border/40 bg-card/10">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Product</SectionKicker>
          <h2 className="text-balance text-3xl font-bold text-foreground sm:text-4xl">
            See the CRM in Action
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Every feature designed to help you sell faster on WhatsApp.
          </p>
        </div>

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-5">
          {/* Tab list */}
          <div className="flex flex-col gap-2 lg:col-span-2">
            {TABS.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`group flex items-start gap-4 rounded-xl border p-4 text-left transition-all duration-300 ${
                    activeTab === t.id
                      ? `border-primary/30 bg-primary/5 shadow-sm shadow-primary/5`
                      : "border-transparent hover:border-border/40 hover:bg-accent/50"
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${t.color} ${t.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${activeTab === t.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                      {t.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Mockup card */}
          <div className="lg:col-span-3">
            <div className="relative transition-all duration-300">
              <div className={`absolute -inset-4 rounded-2xl bg-gradient-to-br ${tab.color} blur-xl opacity-60`} />
              <div className={`relative overflow-hidden rounded-xl border ${tab.borderColor} bg-card shadow-xl`}>
                {/* Chrome */}
                <div className="flex items-center gap-1.5 border-b border-border/40 px-4 py-2.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                  <span className="ml-3 text-xs text-muted-foreground/60 font-medium">{tab.label}</span>
                </div>

                <div className="p-5">
                  {/* Inbox tab */}
                  {tab.id === "inbox" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">3 agents online</span>
                        </div>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">12 active</span>
                      </div>
                      {tab.chats!.map((chat) => (
                        <div
                          key={chat.name}
                          className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                            chat.active ? "bg-primary/5 ring-1 ring-primary/20" : "hover:bg-accent"
                          }`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-[10px] font-bold text-primary">
                            {chat.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-foreground">{chat.name}</span>
                              <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                            </div>
                            <p className="truncate text-[11px] text-muted-foreground">{chat.msg}</p>
                          </div>
                          {chat.active && <span className="flex h-2 w-2 rounded-full bg-emerald-500" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pipeline tab */}
                  {tab.id === "pipeline" && (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-emerald-500" />
                          <span className="text-xs text-muted-foreground">Total pipeline: $55.2K</span>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-500">16 deals</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {tab.stages!.map((stage) => (
                          <div key={stage.name} className="rounded-xl border border-border/40 bg-card-2 p-4 text-center">
                            <p className="text-[11px] font-medium text-muted-foreground">{stage.name}</p>
                            <p className="mt-2 text-2xl font-bold text-foreground">{stage.count}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{stage.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between rounded-xl bg-card-2 px-4 py-2.5">
                        <span className="text-xs text-muted-foreground">Conversion rate</span>
                        <span className="text-sm font-semibold text-emerald-500">24%</span>
                      </div>
                    </div>
                  )}

                  {/* Broadcast tab */}
                  {tab.id === "broadcast" && (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-amber-500" />
                          <span className="text-xs text-muted-foreground">Last 30 days</span>
                        </div>
                        <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium text-amber-500">3 campaigns</span>
                      </div>
                      <div className="space-y-3">
                        {tab.campaigns!.map((camp) => (
                          <div key={camp.name} className="rounded-xl border border-border/40 bg-card-2 p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">{camp.name}</span>
                              <span className="text-xs font-medium text-emerald-500">{camp.rate} delivery</span>
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-foreground">
                              <span>Sent: {camp.sent}</span>
                              <span>Delivered: {camp.delivered}</span>
                            </div>
                            <div className="mt-2 h-1.5 w-full rounded-full bg-border">
                              <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" style={{ width: camp.rate }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Analytics tab */}
                  {tab.id === "analytics" && (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-rose-500" />
                          <span className="text-xs text-muted-foreground">Real-time overview</span>
                        </div>
                        <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-medium text-rose-500">Live</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {tab.stats!.map((stat) => (
                          <div key={stat.label} className="rounded-xl border border-border/40 bg-card-2 p-4">
                            <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                            <p className="mt-1.5 text-xl font-bold text-foreground">{stat.value}</p>
                            <p className={`text-[11px] font-medium ${stat.positive ? "text-emerald-500" : "text-rose-500"}`}>
                              {stat.change}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex h-16 items-end gap-2 rounded-xl border border-border/40 bg-card-2 p-3">
                        {[45, 65, 50, 80, 55, 90, 70].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-rose-500 to-rose-400" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
