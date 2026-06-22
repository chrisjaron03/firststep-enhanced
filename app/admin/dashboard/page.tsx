"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Users, Mail, BarChart3, ScrollText,
  LogOut, Search, Trash2, Edit2, Check, X, Loader2,
  TrendingUp, MousePointerClick, Eye, Globe, Smartphone,
  Shield, ChevronDown, RefreshCw,
} from "lucide-react"
import { adminApi, getAdminToken, getAdminUser, clearAdminSession, type AdminUser } from "@/lib/admin-api"

type Tab = "overview" | "leads" | "contacts" | "analytics" | "audit"

interface Lead {
  id: number
  source: string
  name: string
  email: string
  phone: string
  monthly_investment: number | null
  expected_return: number | null
  tenure_years: number | null
  projected_value: number | null
  status: string
  notes: string | null
  created_at: string
}

interface Contact {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  investment_range: string | null
  service: string | null
  message: string | null
  status: string
  notes: string | null
  created_at: string
}

interface Insights {
  range: string
  summary: {
    pageviews: number
    clicks: number
    sessions: number
    leads: number
    contacts: number
  }
  top_pages: { page_path: string; views: number }[]
  top_clicks: { element_text: string; element_id: string; clicks: number }[]
  by_country: { country: string; count: number }[]
  by_device: { device: string; count: number }[]
  leads_by_source: { source: string; count: number }[]
  contacts_by_service: { service: string; count: number }[]
}

interface AuditEntry {
  id: number
  admin_id: number | null
  action: string
  resource_type: string | null
  resource_id: number | null
  ip_hash: string | null
  details: string | null
  created_at: string
  username: string | null
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  contacted: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  qualified: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  scheduled: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  converted: "bg-green-500/10 text-green-400 border-green-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  lost: "bg-red-500/10 text-red-400 border-red-500/20",
}

const SERVICE_LABELS: Record<string, string> = {
  mf: "Mutual Funds", pms: "PMS", aif: "AIF", unlisted: "Unlisted & Pre-IPO",
  lrs: "LRS & Global", gift: "GIFT City", demat: "Demat & Trading",
  fd: "Fixed Deposits", bonds: "Bonds", insurance: "Insurance",
  nps: "NPS", comprehensive: "Comprehensive",
}

const RANGE_LABELS: Record<string, string> = {
  under5: "Under 5L", "5to25": "5-25L", "25to50": "25-50L",
  "50to1cr": "50L-1Cr", "1to5cr": "1-5Cr", above5cr: "Above 5Cr",
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [tab, setTab] = useState<Tab>("overview")
  const [loading, setLoading] = useState(false)

  // Data states
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadsTotal, setLeadsTotal] = useState(0)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactsTotal, setContactsTotal] = useState(0)
  const [insights, setInsights] = useState<Insights | null>(null)
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])
  const [insightsRange, setInsightsRange] = useState("7d")

  // Filters
  const [leadFilter, setLeadFilter] = useState("")
  const [contactFilter, setContactFilter] = useState("")

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editStatus, setEditStatus] = useState("")
  const [editNotes, setEditNotes] = useState("")

  useEffect(() => {
    const token = getAdminToken()
    if (!token) {
      router.push("/admin")
      return
    }
    const user = getAdminUser()
    if (!user) {
      router.push("/admin")
      return
    }
    adminApi.verify().then((valid) => {
      if (valid) {
        setAdmin(user)
        setAuthChecked(true)
      } else {
        router.push("/admin")
      }
    })
  }, [router])

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const res = await adminApi.getLeads({ limit: 100, status: leadFilter || undefined })
    if (res.ok && res.data) {
      const d = res.data as { data: Lead[]; total: number }
      setLeads(d.data)
      setLeadsTotal(d.total)
    }
    setLoading(false)
  }, [leadFilter])

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    const res = await adminApi.getContacts({ limit: 100, status: contactFilter || undefined })
    if (res.ok && res.data) {
      const d = res.data as { data: Contact[]; total: number }
      setContacts(d.data)
      setContactsTotal(d.total)
    }
    setLoading(false)
  }, [contactFilter])

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    const res = await adminApi.getInsights(insightsRange)
    if (res.ok && res.data) {
      setInsights(res.data as Insights)
    }
    setLoading(false)
  }, [insightsRange])

  const fetchAudit = useCallback(async () => {
    setLoading(true)
    const res = await adminApi.getAuditLog(1, 100)
    if (res.ok && res.data) {
      const d = res.data as { data: AuditEntry[] }
      setAuditLog(d.data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!authChecked) return
    if (tab === "leads") fetchLeads()
    if (tab === "contacts") fetchContacts()
    if (tab === "analytics") fetchInsights()
    if (tab === "audit") fetchAudit()
    if (tab === "overview") fetchInsights()
  }, [tab, authChecked, fetchLeads, fetchContacts, fetchInsights, fetchAudit])

  const handleLogout = async () => {
    await adminApi.logout()
    clearAdminSession()
    router.push("/admin")
  }

  const handleUpdateLead = async (id: number) => {
    await adminApi.updateLead(id, { status: editStatus, notes: editNotes })
    setEditingId(null)
    fetchLeads()
  }

  const handleDeleteLead = async (id: number) => {
    if (!confirm("Delete this lead permanently?")) return
    await adminApi.deleteLead(id)
    fetchLeads()
  }

  const handleUpdateContact = async (id: number) => {
    await adminApi.updateContact(id, { status: editStatus, notes: editNotes })
    setEditingId(null)
    fetchContacts()
  }

  const handleDeleteContact = async (id: number) => {
    if (!confirm("Delete this contact permanently?")) return
    await adminApi.deleteContact(id)
    fetchContacts()
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1c]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "leads", label: "Leads", icon: Users },
    { id: "contacts", label: "Contacts", icon: Mail },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "audit", label: "Audit Log", icon: ScrollText },
  ]

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0f1c]/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">FirstStep Admin</p>
              <p className="text-xs text-white/40">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-medium">{admin?.username}</p>
              <p className="text-xs text-white/40">{admin?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/60 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-56 shrink-0 border-r border-white/10 p-4">
          <nav className="space-y-1">
            {tabs.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    tab === t.id
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "text-white/50 hover:bg-white/5 hover:text-white/80 border border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {loading && (
                <div className="mb-4 flex items-center gap-2 text-sm text-white/40">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              )}

              {/* Overview Tab */}
              {tab === "overview" && insights && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Overview</h2>
                    <select
                      value={insightsRange}
                      onChange={(e) => setInsightsRange(e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 focus:outline-none"
                    >
                      <option value="7d" className="bg-[#0a0f1c]">Last 7 days</option>
                      <option value="30d" className="bg-[#0a0f1c]">Last 30 days</option>
                      <option value="90d" className="bg-[#0a0f1c]">Last 90 days</option>
                    </select>
                  </div>

                  {/* Stat cards */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard icon={Eye} label="Page Views" value={insights.summary.pageviews} color="blue" />
                    <StatCard icon={MousePointerClick} label="Clicks" value={insights.summary.clicks} color="cyan" />
                    <StatCard icon={Users} label="Sessions" value={insights.summary.sessions} color="purple" />
                    <StatCard icon={TrendingUp} label="Leads" value={insights.summary.leads} color="green" />
                    <StatCard icon={Mail} label="Contacts" value={insights.summary.contacts} color="orange" />
                  </div>

                  {/* Two column layout */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Top pages */}
                    <Card title="Top Pages">
                      <div className="space-y-3">
                        {insights.top_pages.length === 0 && <EmptyState />}
                        {insights.top_pages.map((p, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-white/70">{p.page_path}</span>
                            <span className="font-semibold text-blue-400">{p.views}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Top clicks */}
                    <Card title="Most Clicked Elements">
                      <div className="space-y-3">
                        {insights.top_clicks.length === 0 && <EmptyState />}
                        {insights.top_clicks.map((c, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-white/70">{c.element_text || c.element_id || "Unknown"}</span>
                            <span className="font-semibold text-cyan-400">{c.clicks}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Leads by source */}
                    <Card title="Leads by Source">
                      <div className="space-y-3">
                        {insights.leads_by_source.length === 0 && <EmptyState />}
                        {insights.leads_by_source.map((s, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-white/70">{s.source.replace(/_/g, " ")}</span>
                            <span className="font-semibold text-green-400">{s.count}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Contacts by service */}
                    <Card title="Contacts by Service">
                      <div className="space-y-3">
                        {insights.contacts_by_service.length === 0 && <EmptyState />}
                        {insights.contacts_by_service.map((s, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-white/70">{SERVICE_LABELS[s.service] || s.service}</span>
                            <span className="font-semibold text-orange-400">{s.count}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Device + Country */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card title="Devices">
                      <div className="flex gap-4">
                        {insights.by_device.map((d, i) => {
                          const Icon = d.device === "mobile" ? Smartphone : Globe
                          return (
                            <div key={i} className="flex flex-1 flex-col items-center rounded-lg border border-white/10 bg-white/5 p-4">
                              <Icon className="mb-2 h-5 w-5 text-white/40" />
                              <span className="text-xs capitalize text-white/60">{d.device}</span>
                              <span className="text-lg font-bold">{d.count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </Card>

                    <Card title="Top Countries">
                      <div className="space-y-3">
                        {insights.by_country.length === 0 && <EmptyState />}
                        {insights.by_country.slice(0, 5).map((c, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-white/70">{c.country}</span>
                            <span className="font-semibold text-purple-400">{c.count}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* Leads Tab */}
              {tab === "leads" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Leads <span className="text-sm font-normal text-white/40">({leadsTotal})</span></h2>
                    <div className="flex gap-3">
                      <select
                        value={leadFilter}
                        onChange={(e) => setLeadFilter(e.target.value)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 focus:outline-none"
                      >
                        <option value="" className="bg-[#0a0f1c]">All statuses</option>
                        <option value="new" className="bg-[#0a0f1c]">New</option>
                        <option value="contacted" className="bg-[#0a0f1c]">Contacted</option>
                        <option value="qualified" className="bg-[#0a0f1c]">Qualified</option>
                        <option value="converted" className="bg-[#0a0f1c]">Converted</option>
                        <option value="lost" className="bg-[#0a0f1c]">Lost</option>
                      </select>
                      <button
                        onClick={fetchLeads}
                        className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 hover:bg-white/5"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-white/40">
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Contact</th>
                          <th className="px-4 py-3">Source</th>
                          <th className="px-4 py-3">SIP Details</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.length === 0 && (
                          <tr><td colSpan={7} className="px-4 py-12 text-center text-white/30">No leads found</td></tr>
                        )}
                        {leads.map((lead) => (
                          <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-3 font-medium">{lead.name}</td>
                            <td className="px-4 py-3 text-white/60">
                              <div>{lead.email}</div>
                              <div className="text-xs">{lead.phone}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-white/60">
                                {lead.source.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-white/50">
                              {lead.monthly_investment ? (
                                <>
                                  ₹{lead.monthly_investment}/mo<br />
                                  {lead.expected_return}% for {lead.tenure_years}yrs<br />
                                  → ₹{lead.projected_value?.toLocaleString("en-IN")}
                                </>
                              ) : "—"}
                            </td>
                            <td className="px-4 py-3">
                              {editingId === lead.id ? (
                                <select
                                  value={editStatus}
                                  onChange={(e) => setEditStatus(e.target.value)}
                                  className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs"
                                >
                                  {["new", "contacted", "qualified", "converted", "lost"].map((s) => (
                                    <option key={s} value={s} className="bg-[#0a0f1c]">{s}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className={`rounded-md border px-2 py-1 text-xs ${STATUS_COLORS[lead.status] || STATUS_COLORS.new}`}>
                                  {lead.status}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-white/40">
                              {new Date(lead.created_at + "Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {editingId === lead.id ? (
                                  <>
                                    <button onClick={() => handleUpdateLead(lead.id)} className="text-green-400 hover:text-green-300">
                                      <Check className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="text-white/40 hover:text-white/60">
                                      <X className="h-4 w-4" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => { setEditingId(lead.id); setEditStatus(lead.status); setEditNotes(lead.notes || "") }}
                                      className="text-white/40 hover:text-blue-400"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDeleteLead(lead.id)} className="text-white/40 hover:text-red-400">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Contacts Tab */}
              {tab === "contacts" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Contacts <span className="text-sm font-normal text-white/40">({contactsTotal})</span></h2>
                    <div className="flex gap-3">
                      <select
                        value={contactFilter}
                        onChange={(e) => setContactFilter(e.target.value)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 focus:outline-none"
                      >
                        <option value="" className="bg-[#0a0f1c]">All statuses</option>
                        <option value="new" className="bg-[#0a0f1c]">New</option>
                        <option value="contacted" className="bg-[#0a0f1c]">Contacted</option>
                        <option value="scheduled" className="bg-[#0a0f1c]">Scheduled</option>
                        <option value="completed" className="bg-[#0a0f1c]">Completed</option>
                        <option value="lost" className="bg-[#0a0f1c]">Lost</option>
                      </select>
                      <button
                        onClick={fetchContacts}
                        className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 hover:bg-white/5"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-white/40">
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Contact</th>
                          <th className="px-4 py-3">Service</th>
                          <th className="px-4 py-3">Range</th>
                          <th className="px-4 py-3">Message</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.length === 0 && (
                          <tr><td colSpan={8} className="px-4 py-12 text-center text-white/30">No contacts found</td></tr>
                        )}
                        {contacts.map((c) => (
                          <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-3 font-medium">{c.first_name} {c.last_name}</td>
                            <td className="px-4 py-3 text-white/60">
                              <div>{c.email}</div>
                              <div className="text-xs">{c.phone}</div>
                            </td>
                            <td className="px-4 py-3 text-xs text-white/60">
                              {SERVICE_LABELS[c.service || ""] || c.service || "—"}
                            </td>
                            <td className="px-4 py-3 text-xs text-white/60">
                              {RANGE_LABELS[c.investment_range || ""] || "—"}
                            </td>
                            <td className="px-4 py-3 text-xs text-white/50 max-w-xs truncate">
                              {c.message || "—"}
                            </td>
                            <td className="px-4 py-3">
                              {editingId === c.id ? (
                                <select
                                  value={editStatus}
                                  onChange={(e) => setEditStatus(e.target.value)}
                                  className="rounded border border-white/10 bg-white/5 px-2 py-1 text-xs"
                                >
                                  {["new", "contacted", "scheduled", "completed", "lost"].map((s) => (
                                    <option key={s} value={s} className="bg-[#0a0f1c]">{s}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className={`rounded-md border px-2 py-1 text-xs ${STATUS_COLORS[c.status] || STATUS_COLORS.new}`}>
                                  {c.status}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-white/40">
                              {new Date(c.created_at + "Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {editingId === c.id ? (
                                  <>
                                    <button onClick={() => handleUpdateContact(c.id)} className="text-green-400 hover:text-green-300">
                                      <Check className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="text-white/40 hover:text-white/60">
                                      <X className="h-4 w-4" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => { setEditingId(c.id); setEditStatus(c.status); setEditNotes(c.notes || "") }}
                                      className="text-white/40 hover:text-blue-400"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleDeleteContact(c.id)} className="text-white/40 hover:text-red-400">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {tab === "analytics" && insights && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Analytics</h2>
                    <select
                      value={insightsRange}
                      onChange={(e) => setInsightsRange(e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 focus:outline-none"
                    >
                      <option value="7d" className="bg-[#0a0f1c]">Last 7 days</option>
                      <option value="30d" className="bg-[#0a0f1c]">Last 30 days</option>
                      <option value="90d" className="bg-[#0a0f1c]">Last 90 days</option>
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard icon={Eye} label="Page Views" value={insights.summary.pageviews} color="blue" />
                    <StatCard icon={MousePointerClick} label="Clicks" value={insights.summary.clicks} color="cyan" />
                    <StatCard icon={Users} label="Sessions" value={insights.summary.sessions} color="purple" />
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card title="Top Pages by Views">
                      <div className="space-y-3">
                        {insights.top_pages.length === 0 && <EmptyState />}
                        {insights.top_pages.map((p, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-white/70">{p.page_path}</span>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 rounded-full bg-white/10">
                                <div
                                  className="h-full rounded-full bg-blue-500"
                                  style={{ width: `${(p.views / Math.max(...insights.top_pages.map((x) => x.views), 1)) * 100}%` }}
                                />
                              </div>
                              <span className="font-semibold text-blue-400">{p.views}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card title="Most Clicked Elements">
                      <div className="space-y-3">
                        {insights.top_clicks.length === 0 && <EmptyState />}
                        {insights.top_clicks.map((c, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-white/70 truncate max-w-[200px]">{c.element_text || c.element_id || "Unknown"}</span>
                            <span className="font-semibold text-cyan-400">{c.clicks}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card title="Visitors by Country">
                      <div className="space-y-3">
                        {insights.by_country.length === 0 && <EmptyState />}
                        {insights.by_country.map((c, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-white/70">{c.country}</span>
                            <span className="font-semibold text-purple-400">{c.count}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card title="Devices">
                      <div className="space-y-3">
                        {insights.by_device.length === 0 && <EmptyState />}
                        {insights.by_device.map((d, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-white/70 capitalize">{d.device}</span>
                            <span className="font-semibold text-green-400">{d.count}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* Audit Tab */}
              {tab === "audit" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Audit Log</h2>
                    <button
                      onClick={fetchAudit}
                      className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 hover:bg-white/5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Refresh
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-white/40">
                          <th className="px-4 py-3">Admin</th>
                          <th className="px-4 py-3">Action</th>
                          <th className="px-4 py-3">Resource</th>
                          <th className="px-4 py-3">IP Hash</th>
                          <th className="px-4 py-3">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLog.length === 0 && (
                          <tr><td colSpan={5} className="px-4 py-12 text-center text-white/30">No audit entries</td></tr>
                        )}
                        {auditLog.map((entry) => (
                          <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-3 text-white/70">{entry.username || "—"}</td>
                            <td className="px-4 py-3">
                              <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-white/60">
                                {entry.action}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-white/50">
                              {entry.resource_type ? `${entry.resource_type} #${entry.resource_id}` : "—"}
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-white/30">
                              {entry.ip_hash?.substring(0, 12) || "—"}...
                            </td>
                            <td className="px-4 py-3 text-xs text-white/40">
                              {new Date(entry.created_at + "Z").toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Eye; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20",
    cyan: "from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/20",
    purple: "from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20",
    green: "from-green-500/20 to-green-600/5 text-green-400 border-green-500/20",
    orange: "from-orange-500/20 to-orange-600/5 text-orange-400 border-orange-500/20",
  }
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 ${colors[color]}`}>
      <Icon className="mb-2 h-5 w-5" />
      <p className="text-2xl font-bold text-white">{value.toLocaleString("en-IN")}</p>
      <p className="text-xs text-white/50">{label}</p>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white/80">{title}</h3>
      {children}
    </div>
  )
}

function EmptyState() {
  return <p className="py-6 text-center text-sm text-white/30">No data available</p>
}
