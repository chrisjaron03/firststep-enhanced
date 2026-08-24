"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Users, Mail, BarChart3, ScrollText,
  LogOut, Trash2, Edit2, Check, X, Loader2,
  TrendingUp, MousePointerClick, Eye,
  Shield, RefreshCw, Calendar, Video, ExternalLink,
  Clock, Plus, CalendarOff, Settings, CheckCircle2, AlertCircle,
  ChevronLeft, ChevronRight, Sparkles, Phone, Search, Ticket, Megaphone,
} from "lucide-react"
import { adminApi, hasAdminSession, getAdminUser, clearAdminSession, type AdminUser } from "@/lib/admin-api"
import {
  DEFAULT_SCHEDULE,
  DAY_NAMES,
  DAY_SHORT_NAMES,
  MONTH_NAMES,
  formatTime12h,
  getLocalSchedule,
  saveLocalSchedule,
  getLocalBlockedDates,
  saveLocalBlockedDates,
  type DaySchedule,
  type BlockedDate,
} from "@/lib/booking-service"
import { EventsManager } from "@/components/admin/events-manager"
import { RegistrationsManager } from "@/components/admin/registrations-manager"

type Tab = "overview" | "leads" | "contacts" | "analytics" | "audit" | "bookings" | "events" | "registrations"

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
  new: "bg-red-500/15 text-red-400 border-red-500/30",
  contacted: "bg-white/10 text-white/80 border-white/20",
  qualified: "bg-[#1a2744]/40 text-white/90 border-[#1a2744]/50",
  scheduled: "bg-[#1a2744]/20 text-white/70 border-[#1a2744]/30",
  converted: "bg-red-500/25 text-red-300 border-red-500/40",
  completed: "bg-red-500/25 text-red-300 border-red-500/40",
  lost: "bg-red-950/20 text-red-500/60 border-red-950/30",
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
  const [bookings, setBookings] = useState<any[]>([])
  const [bookingsFilter, setBookingsFilter] = useState("")
  const [bookingSearch, setBookingSearch] = useState("")
  const [bookingSubTab, setBookingSubTab] = useState<"list" | "weekly" | "blocked" | "calendar">("list")
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [scheduleSaving, setScheduleSaving] = useState(false)
  const [scheduleSuccess, setScheduleSuccess] = useState("")
  const [newBlockedDate, setNewBlockedDate] = useState("")
  const [newBlockedReason, setNewBlockedReason] = useState("")
  const [adminCalMonth, setAdminCalMonth] = useState(() => new Date())
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [manualName, setManualName] = useState("")
  const [manualEmail, setManualEmail] = useState("")
  const [manualPhone, setManualPhone] = useState("")
  const [manualDate, setManualDate] = useState("")
  const [manualTime, setManualTime] = useState("10:00")
  const [manualService, setManualService] = useState("Mutual Funds & SIP")
  const [manualNotes, setManualNotes] = useState("")
  const [manualSubmitting, setManualSubmitting] = useState(false)
  const [manualError, setManualError] = useState("")
  const [insightsRange, setInsightsRange] = useState("7d")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")

  // Filters
  const [leadFilter, setLeadFilter] = useState("")
  const [contactFilter, setContactFilter] = useState("")

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editStatus, setEditStatus] = useState("")
  const [editNotes, setEditNotes] = useState("")

  useEffect(() => {
    if (!hasAdminSession()) {
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
    const res = await adminApi.getInsights(insightsRange, customStartDate || undefined, customEndDate || undefined)
    if (res.ok && res.data) {
      setInsights(res.data as Insights)
    }
    setLoading(false)
  }, [insightsRange, customStartDate, customEndDate])

  const fetchAudit = useCallback(async () => {
    setLoading(true)
    const res = await adminApi.getAuditLog(1, 100)
    if (res.ok && res.data) {
      const d = res.data as { data: AuditEntry[] }
      setAuditLog(d.data)
    }
    setLoading(false)
  }, [])

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    const res = await adminApi.getBookings({ status: bookingsFilter || undefined })
    if (res.ok && res.data) {
      const d = res.data as { data: any[] }
      setBookings(d.data)
    }
    setLoading(false)
  }, [bookingsFilter])

  const fetchAvailability = useCallback(async () => {
    const res = await adminApi.getAvailability()
    if (res.ok && res.data) {
      const d = res.data as { schedule: DaySchedule[]; blocked_dates: BlockedDate[] }
      if (Array.isArray(d.schedule) && d.schedule.length > 0) {
        const merged = DEFAULT_SCHEDULE.map((def) => {
          const found = d.schedule.find((s) => s.day_of_week === def.day_of_week)
          return found ? { ...def, ...found, is_active: Boolean(found.is_active) } : def
        })
        setSchedule(merged)
        saveLocalSchedule(merged)
      }
      if (Array.isArray(d.blocked_dates)) {
        setBlockedDates(d.blocked_dates)
        saveLocalBlockedDates(d.blocked_dates)
      }
    } else {
      setSchedule(getLocalSchedule())
      setBlockedDates(getLocalBlockedDates())
    }
  }, [])

  useEffect(() => {
    if (!authChecked) return
    if (tab === "leads") fetchLeads()
    if (tab === "contacts") fetchContacts()
    if (tab === "analytics") fetchInsights()
    if (tab === "audit") fetchAudit()
    if (tab === "overview") fetchInsights()
    if (tab === "bookings") {
      fetchBookings()
      fetchAvailability()
    }
  }, [tab, authChecked, fetchLeads, fetchContacts, fetchInsights, fetchAudit, fetchBookings, fetchAvailability])

  const handleUpdateBooking = async (id: number, status: string) => {
    await adminApi.updateBooking(id, { status })
    fetchBookings()
  }

  const handleDeleteBooking = async (id: number) => {
    if (!confirm("Delete this booking?")) return
    await adminApi.deleteBooking(id)
    fetchBookings()
  }

  const handleScheduleChange = (dayOfWeek: number, field: keyof DaySchedule, value: any) => {
    setSchedule((prev) =>
      prev.map((item) => (item.day_of_week === dayOfWeek ? { ...item, [field]: value } : item))
    )
  }

  const handleSaveSchedule = async () => {
    setScheduleSaving(true)
    setScheduleSuccess("")
    saveLocalSchedule(schedule)
    const res = await adminApi.updateAvailability(schedule)
    if (res.ok) {
      setScheduleSuccess("Weekly working hours saved successfully!")
    } else {
      setScheduleSuccess("Saved locally. Changes will apply immediately.")
    }
    setScheduleSaving(false)
    setTimeout(() => setScheduleSuccess(""), 4000)
  }

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBlockedDate) return
    const updated = [
      { date: newBlockedDate, reason: newBlockedReason || "Out of Office / Holiday" },
      ...blockedDates.filter((b) => b.date !== newBlockedDate),
    ]
    setBlockedDates(updated)
    saveLocalBlockedDates(updated)
    await adminApi.addBlockedDate(newBlockedDate, newBlockedReason || undefined)
    setNewBlockedDate("")
    setNewBlockedReason("")
    fetchAvailability()
  }

  const handleRemoveBlockedDate = async (date: string) => {
    const updated = blockedDates.filter((b) => b.date !== date)
    setBlockedDates(updated)
    saveLocalBlockedDates(updated)
    await adminApi.deleteBlockedDate(date)
    fetchAvailability()
  }

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualName || !manualEmail || !manualDate || !manualTime) {
      setManualError("Please fill in required fields: Name, Email, Date, Time")
      return
    }
    setManualSubmitting(true)
    setManualError("")
    const res = await adminApi.createBooking({
      client_name: manualName,
      client_email: manualEmail,
      client_phone: manualPhone || undefined,
      date: manualDate,
      start_time: manualTime,
      notes: manualNotes ? `[Manual Phone Booking] Service: ${manualService}. Notes: ${manualNotes}` : `[Manual Phone Booking] Service: ${manualService}`,
    })
    if (res.ok) {
      setManualModalOpen(false)
      setManualName("")
      setManualEmail("")
      setManualPhone("")
      setManualDate("")
      setManualTime("10:00")
      setManualNotes("")
      fetchBookings()
    } else {
      setManualError(res.error || "Failed to create appointment")
    }
    setManualSubmitting(false)
  }

  const handleCalendarAuth = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://firststep-backend.chrisjaron99.workers.dev"
    window.open(`${apiUrl}/api/admin/calendar/auth`, "_blank", "width=600,height=700")
  }

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
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "leads", label: "Leads", icon: Users },
    { id: "contacts", label: "Contacts", icon: Mail },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "events", label: "Events", icon: Ticket },
    { id: "registrations", label: "Registrations", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "audit", label: "Audit Log", icon: ScrollText },
  ]

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0f1c]/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-[#1a2744]">
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
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
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
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="text-xl font-bold">Overview</h2>
                    <div className="flex items-center gap-3">
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => { setCustomStartDate(e.target.value); setInsightsRange("") }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 focus:outline-none [color-scheme:dark]"
                      />
                      <span className="text-white/30">—</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => { setCustomEndDate(e.target.value); setInsightsRange("") }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 focus:outline-none [color-scheme:dark]"
                      />
                      <select
                        value={insightsRange}
                        onChange={(e) => { setInsightsRange(e.target.value); setCustomStartDate(""); setCustomEndDate("") }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 focus:outline-none"
                      >
                        <option value="today" className="bg-[#0a0f1c]">Today</option>
                        <option value="7d" className="bg-[#0a0f1c]">Last 7 days</option>
                        <option value="30d" className="bg-[#0a0f1c]">Last 30 days</option>
                        <option value="90d" className="bg-[#0a0f1c]">Last 90 days</option>
                      </select>
                    </div>
                  </div>

                  {/* Stat cards — unique to overview: business metrics */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    <StatCard icon={TrendingUp} label="Leads" value={insights.summary.leads} color="green" />
                    <StatCard icon={Mail} label="Contacts" value={insights.summary.contacts} color="orange" />
                  </div>

                  {/* Leads by source + Contacts by service */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card title="Leads by Source">
                      <div className="space-y-3">
                        {insights.leads_by_source.length === 0 && <EmptyState />}
                        {insights.leads_by_source.map((s, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-white/70">{s.source.replace(/_/g, " ")}</span>
                            <span className="font-semibold text-red-400">{s.count}</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card title="Contacts by Service">
                      <div className="space-y-3">
                        {insights.contacts_by_service.length === 0 && <EmptyState />}
                        {insights.contacts_by_service.map((s, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-white/70">{SERVICE_LABELS[s.service] || s.service}</span>
                            <span className="font-semibold text-white/80">{s.count}</span>
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
                                    <button onClick={() => handleUpdateLead(lead.id)} className="text-red-400 hover:text-red-300">
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
                                      className="text-white/40 hover:text-red-400"
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
                                    <button onClick={() => handleUpdateContact(c.id)} className="text-red-400 hover:text-red-300">
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
                                      className="text-white/40 hover:text-red-400"
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

              {/* Bookings & Availability Tab */}
              {tab === "bookings" && (
                <div className="space-y-6">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <span>Bookings & Availability</span>
                        <span className="rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/30 px-2.5 py-0.5 text-xs text-[var(--gold)]">
                          {bookings.length} Total Bookings
                        </span>
                      </h2>
                      <p className="text-xs text-white/50 mt-0.5">
                        Manage client appointments, weekly consultation hours, and holiday blocker.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setManualModalOpen(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-[var(--gold)] px-3.5 py-2 text-xs font-bold text-[var(--navy-deep)] transition-all hover:opacity-90 cursor-pointer shadow-md shadow-[var(--gold)]/20"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Manual Booking
                      </button>

                      <button
                        type="button"
                        onClick={handleCalendarAuth}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-[var(--gold)]" />
                        Google Calendar
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          fetchBookings()
                          fetchAvailability()
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                      </button>
                    </div>
                  </div>

                  {/* Sub Tabs Pill Navigation */}
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setBookingSubTab("list")}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        bookingSubTab === "list"
                          ? "bg-[var(--gold)] text-[var(--navy-deep)] shadow-md shadow-[var(--gold)]/20"
                          : "border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Appointments ({bookings.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingSubTab("weekly")}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        bookingSubTab === "weekly"
                          ? "bg-[var(--gold)] text-[var(--navy-deep)] shadow-md shadow-[var(--gold)]/20"
                          : "border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Weekly Schedule & Hours
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingSubTab("blocked")}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        bookingSubTab === "blocked"
                          ? "bg-[var(--gold)] text-[var(--navy-deep)] shadow-md shadow-[var(--gold)]/20"
                          : "border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <CalendarOff className="h-3.5 w-3.5" />
                      Blocked Dates & Holidays ({blockedDates.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingSubTab("calendar")}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        bookingSubTab === "calendar"
                          ? "bg-[var(--gold)] text-[var(--navy-deep)] shadow-md shadow-[var(--gold)]/20"
                          : "border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Monthly Visual Calendar
                    </button>
                  </div>

                  {/* ────────────────── SUB-TAB 1: APPOINTMENTS LIST ────────────────── */}
                  {bookingSubTab === "list" && (
                    <div className="space-y-4">
                      {/* Search & Filter */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/10">
                        <div className="relative w-full sm:w-80">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                          <input
                            type="text"
                            placeholder="Search client, email, or date..."
                            value={bookingSearch}
                            onChange={(e) => setBookingSearch(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-[var(--gold)]"
                          />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <select
                            value={bookingsFilter}
                            onChange={(e) => setBookingsFilter(e.target.value)}
                            className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 focus:outline-none [&>option]:bg-[#0a0f1c]"
                          >
                            <option value="">All Statuses</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Appointments Table */}
                      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-white/40">
                              <th className="px-4 py-3">Client</th>
                              <th className="px-4 py-3">Date & Time</th>
                              <th className="px-4 py-3">Service / Topic</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Booked On</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookings
                              .filter((b: any) => {
                                if (!bookingSearch) return true
                                const q = bookingSearch.toLowerCase()
                                return (
                                  b.client_name?.toLowerCase().includes(q) ||
                                  b.client_email?.toLowerCase().includes(q) ||
                                  b.client_phone?.toLowerCase().includes(q) ||
                                  b.date?.includes(q)
                                )
                              })
                              .map((b: any) => (
                                <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="font-semibold text-white">{b.client_name}</div>
                                    <div className="text-xs text-white/50">{b.client_email}</div>
                                    {b.client_phone && (
                                      <div className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
                                        <Phone className="h-3 w-3" />
                                        {b.client_phone}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="font-medium text-white/90">
                                      {new Date(b.date + "T00:00:00").toLocaleDateString("en-IN", {
                                        weekday: "short",
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </div>
                                    <div className="text-xs text-[var(--gold)] flex items-center gap-1 mt-0.5">
                                      <Clock className="h-3 w-3" />
                                      {formatTime12h(b.start_time)} – {formatTime12h(b.end_time)}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-xs font-semibold text-white/90">{b.service || "Comprehensive Advisory"}</div>
                                    {b.notes && (
                                      <div className="text-[11px] text-white/40 truncate max-w-xs mt-0.5" title={b.notes}>
                                        {b.notes}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`rounded-md border px-2.5 py-1 text-xs uppercase tracking-wider font-semibold ${
                                      b.status === "confirmed"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                        : b.status === "completed"
                                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                          : "bg-red-500/10 text-red-400 border-red-500/30"
                                    }`}>
                                      {b.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-xs text-white/40">
                                    {b.created_at ? new Date(b.created_at + (b.created_at.endsWith("Z") ? "" : "Z")).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {b.status === "confirmed" && (
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateBooking(b.id, "completed")}
                                          className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs text-emerald-400 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                                        >
                                          Mark Done
                                        </button>
                                      )}
                                      {b.status !== "cancelled" && (
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateBooking(b.id, "cancelled")}
                                          className="rounded-lg bg-red-500/15 border border-red-500/30 px-2.5 py-1 text-xs text-red-400 hover:bg-red-500/25 transition-colors cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteBooking(b.id)}
                                        className="text-white/30 hover:text-red-400 p-1 transition-colors cursor-pointer"
                                        title="Delete Booking"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            {bookings.length === 0 && (
                              <tr>
                                <td colSpan={6} className="px-4 py-16 text-center text-white/30">
                                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                  <p className="font-medium text-white/60">No consultations booked yet</p>
                                  <p className="text-xs text-white/40 mt-1">
                                    Clients will appear here once they book on /book or when you create a manual booking.
                                  </p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ────────────────── SUB-TAB 2: WEEKLY SCHEDULE ────────────────── */}
                  {bookingSubTab === "weekly" && (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                          <div>
                            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                              <Clock className="h-5 w-5 text-[var(--gold)]" />
                              Recurring Weekly Working Hours
                            </h3>
                            <p className="text-xs text-white/50 mt-1">
                              Configure which days Francis J. accepts bookings, starting & ending hours, and consultation slot durations.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleSaveSchedule}
                            disabled={scheduleSaving}
                            className="flex items-center gap-2 rounded-xl bg-[var(--gold)] px-5 py-2.5 text-xs font-bold text-[var(--navy-deep)] shadow-lg shadow-[var(--gold)]/20 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shrink-0"
                          >
                            {scheduleSaving ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4" />
                                <span>Save Weekly Hours</span>
                              </>
                            )}
                          </button>
                        </div>

                        {scheduleSuccess && (
                          <div className="my-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span>{scheduleSuccess}</span>
                          </div>
                        )}

                        {/* Days List */}
                        <div className="divide-y divide-white/5 pt-4 space-y-4">
                          {[1, 2, 3, 4, 5, 6, 0].map((dayNum) => {
                            const item = schedule.find((s) => s.day_of_week === dayNum) || {
                              day_of_week: dayNum,
                              start_time: "09:30",
                              end_time: "18:00",
                              slot_duration: 30,
                              is_active: dayNum !== 0,
                            }
                            const isActive = Boolean(item.is_active)

                            return (
                              <div
                                key={dayNum}
                                className={`pt-4 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl transition-colors ${
                                  isActive ? "bg-white/[0.02]" : "bg-white/[0.01] opacity-60"
                                }`}
                              >
                                <div className="flex items-center gap-3 w-44">
                                  <input
                                    type="checkbox"
                                    id={`active-${dayNum}`}
                                    checked={isActive}
                                    onChange={(e) => handleScheduleChange(dayNum, "is_active", e.target.checked)}
                                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-[var(--gold)] focus:ring-[var(--gold)] cursor-pointer"
                                  />
                                  <label htmlFor={`active-${dayNum}`} className="font-semibold text-sm cursor-pointer select-none">
                                    {DAY_NAMES[dayNum]}
                                  </label>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                  {isActive ? (
                                    <>
                                      <div className="flex items-center gap-2 text-xs">
                                        <span className="text-white/40">From:</span>
                                        <input
                                          type="time"
                                          value={item.start_time}
                                          onChange={(e) => handleScheduleChange(dayNum, "start_time", e.target.value)}
                                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:border-[var(--gold)] outline-none [color-scheme:dark]"
                                        />
                                      </div>

                                      <div className="flex items-center gap-2 text-xs">
                                        <span className="text-white/40">To:</span>
                                        <input
                                          type="time"
                                          value={item.end_time}
                                          onChange={(e) => handleScheduleChange(dayNum, "end_time", e.target.value)}
                                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white focus:border-[var(--gold)] outline-none [color-scheme:dark]"
                                        />
                                      </div>

                                      <div className="flex items-center gap-2 text-xs">
                                        <span className="text-white/40">Slot Duration:</span>
                                        <select
                                          value={item.slot_duration || 30}
                                          onChange={(e) => handleScheduleChange(dayNum, "slot_duration", Number(e.target.value))}
                                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none focus:border-[var(--gold)] [&>option]:bg-[#0a0f1c]"
                                        >
                                          <option value={15}>15 mins</option>
                                          <option value={30}>30 mins</option>
                                          <option value={45}>45 mins</option>
                                          <option value={60}>60 mins</option>
                                        </select>
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-xs text-white/40 italic">
                                      Closed / Unavailable on {DAY_NAMES[dayNum]}s
                                    </span>
                                  )}
                                </div>

                                <div className="text-xs text-[var(--gold)]/80 font-medium">
                                  {isActive ? `${formatTime12h(item.start_time)} – ${formatTime12h(item.end_time)}` : "Closed"}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ────────────────── SUB-TAB 3: BLOCKED DATES ────────────────── */}
                  {bookingSubTab === "blocked" && (
                    <div className="space-y-6">
                      {/* Add Blocked Date Form */}
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <h3 className="font-serif text-lg font-bold text-white mb-2 flex items-center gap-2">
                          <CalendarOff className="h-5 w-5 text-accent" />
                          Block a Specific Date or Holiday
                        </h3>
                        <p className="text-xs text-white/50 mb-5">
                          Mark specific full days as unavailable for festivals, travel, personal leave, or public holidays.
                        </p>

                        <form onSubmit={handleAddBlockedDate} className="flex flex-col sm:flex-row items-end gap-3">
                          <div className="w-full sm:w-48">
                            <label className="block text-xs text-white/60 mb-1.5 font-medium">Date to Block</label>
                            <input
                              type="date"
                              required
                              value={newBlockedDate}
                              onChange={(e) => setNewBlockedDate(e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-[var(--gold)] outline-none [color-scheme:dark]"
                            />
                          </div>

                          <div className="w-full sm:flex-1">
                            <label className="block text-xs text-white/60 mb-1.5 font-medium">Reason / Label</label>
                            <input
                              type="text"
                              placeholder="e.g. Diwali Holiday, Out of Station, Client Meetings..."
                              value={newBlockedReason}
                              onChange={(e) => setNewBlockedReason(e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[var(--gold)] outline-none"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={!newBlockedDate}
                            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shrink-0"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Block Date
                          </button>
                        </form>
                      </div>

                      {/* Blocked Dates List */}
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                        <h4 className="font-semibold text-sm text-white mb-4">
                          Currently Blocked Dates ({blockedDates.length})
                        </h4>

                        {blockedDates.length === 0 ? (
                          <p className="text-xs text-white/40 py-6 text-center">No dates are currently blocked.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {blockedDates.map((b) => {
                              const d = new Date(b.date + "T00:00:00")
                              const formatted = d.toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })

                              return (
                                <div
                                  key={b.date}
                                  className="flex items-center justify-between p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-xs"
                                >
                                  <div>
                                    <p className="font-semibold text-white">{formatted}</p>
                                    <p className="text-white/50 text-[11px] mt-0.5">{b.reason || "Out of Office"}</p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBlockedDate(b.date)}
                                    className="p-1 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                                    title="Unblock Date"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ────────────────── SUB-TAB 4: MONTHLY VISUAL CALENDAR ────────────────── */}
                  {bookingSubTab === "calendar" && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-serif text-lg font-bold text-white">
                            {MONTH_NAMES[adminCalMonth.getMonth()]} {adminCalMonth.getFullYear()}
                          </h3>
                          <p className="text-xs text-white/50">
                            Overview of confirmed bookings and blocked dates this month.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setAdminCalMonth(new Date(adminCalMonth.getFullYear(), adminCalMonth.getMonth() - 1, 1))}
                            className="p-2 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 cursor-pointer"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setAdminCalMonth(new Date(adminCalMonth.getFullYear(), adminCalMonth.getMonth() + 1, 1))}
                            className="p-2 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 cursor-pointer"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Admin Visual Calendar Grid */}
                      <div className="grid grid-cols-7 gap-2">
                        {DAY_SHORT_NAMES.map((d) => (
                          <div key={d} className="text-center text-xs font-semibold uppercase text-white/40 py-1">
                            {d}
                          </div>
                        ))}

                        {(() => {
                          const year = adminCalMonth.getFullYear()
                          const month = adminCalMonth.getMonth()
                          const numDays = new Date(year, month + 1, 0).getDate()
                          const firstDay = new Date(year, month, 1).getDay()

                          const cells = []
                          for (let i = 0; i < firstDay; i++) {
                            cells.push(<div key={`empty-${i}`} className="h-24 rounded-xl bg-white/[0.01]" />)
                          }

                          for (let day = 1; day <= numDays; day++) {
                            const dateStr = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
                            const dayOfWeek = new Date(year, month, day).getDay()
                            const sched = schedule.find((s) => s.day_of_week === dayOfWeek)
                            const isSchedActive = sched ? Boolean(sched.is_active) : dayOfWeek !== 0

                            const isBlocked = blockedDates.some((b) => b.date === dateStr)
                            const dayBookings = bookings.filter((b: any) => b.date === dateStr && b.status === "confirmed")

                            cells.push(
                              <div
                                key={dateStr}
                                className={`h-24 rounded-xl border p-2 flex flex-col justify-between transition-all ${
                                  isBlocked
                                    ? "border-red-500/20 bg-red-500/5 text-white/40"
                                    : !isSchedActive
                                      ? "border-white/5 bg-white/[0.01] text-white/30"
                                      : dayBookings.length > 0
                                        ? "border-[var(--gold)]/30 bg-[var(--gold)]/5 text-white"
                                        : "border-white/10 bg-white/[0.02] text-white/80 hover:border-white/20"
                                }`}
                              >
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold">{day}</span>
                                  {isBlocked ? (
                                    <span className="text-[10px] text-red-400 font-semibold">Blocked</span>
                                  ) : !isSchedActive ? (
                                    <span className="text-[10px] text-white/30">Off</span>
                                  ) : (
                                    <span className="text-[10px] text-emerald-400">Open</span>
                                  )}
                                </div>

                                <div className="space-y-1">
                                  {dayBookings.length > 0 && (
                                    <div className="rounded-md bg-[var(--gold)]/20 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--gold)] text-center">
                                      {dayBookings.length} Booked
                                    </div>
                                  )}
                                </div>

                                <div className="flex justify-end">
                                  {isBlocked ? (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveBlockedDate(dateStr)}
                                      className="text-[10px] text-white/40 hover:text-emerald-400 cursor-pointer"
                                    >
                                      Unblock
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setNewBlockedDate(dateStr)
                                        setBookingSubTab("blocked")
                                      }}
                                      className="text-[10px] text-white/30 hover:text-red-400 cursor-pointer"
                                    >
                                      Block
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          }

                          return cells
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Manual Booking Modal */}
                  {manualModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                      <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-gradient-to-b from-[#101c30] to-[#0a0f1c] p-6 sm:p-8 shadow-2xl text-white">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-serif text-xl font-bold">Add Manual Appointment</h3>
                          <button
                            type="button"
                            onClick={() => setManualModalOpen(false)}
                            className="text-white/50 hover:text-white cursor-pointer"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <form onSubmit={handleCreateManualBooking} className="space-y-4">
                          <div>
                            <label className="block text-xs text-white/60 mb-1">Client Full Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Anand Kumar"
                              value={manualName}
                              onChange={(e) => setManualName(e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white outline-none focus:border-[var(--gold)]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-white/60 mb-1">Client Email *</label>
                              <input
                                type="email"
                                required
                                placeholder="client@example.com"
                                value={manualEmail}
                                onChange={(e) => setManualEmail(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white outline-none focus:border-[var(--gold)]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-white/60 mb-1">Client Phone</label>
                              <input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={manualPhone}
                                onChange={(e) => setManualPhone(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white outline-none focus:border-[var(--gold)]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-white/60 mb-1">Date *</label>
                              <input
                                type="date"
                                required
                                value={manualDate}
                                onChange={(e) => setManualDate(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white outline-none focus:border-[var(--gold)] [color-scheme:dark]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-white/60 mb-1">Start Time *</label>
                              <input
                                type="time"
                                required
                                value={manualTime}
                                onChange={(e) => setManualTime(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white outline-none focus:border-[var(--gold)] [color-scheme:dark]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs text-white/60 mb-1">Service</label>
                            <select
                              value={manualService}
                              onChange={(e) => setManualService(e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white outline-none focus:border-[var(--gold)] [&>option]:bg-[#0a0f1c]"
                            >
                              <option value="Mutual Funds & SIP">Mutual Funds & SIP</option>
                              <option value="PMS">Portfolio Management Services (PMS)</option>
                              <option value="AIF">Alternative Investment Funds (AIF)</option>
                              <option value="NRI Investment">NRI Investment Solutions</option>
                              <option value="Comprehensive Planning">Comprehensive Wealth Planning</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs text-white/60 mb-1">Internal Notes</label>
                            <textarea
                              rows={2}
                              placeholder="Notes about client request, phone call conversation..."
                              value={manualNotes}
                              onChange={(e) => setManualNotes(e.target.value)}
                              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none focus:border-[var(--gold)] resize-none"
                            />
                          </div>

                          {manualError && (
                            <p className="text-xs text-red-400">{manualError}</p>
                          )}

                          <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setManualModalOpen(false)}
                              className="rounded-xl border border-white/10 px-4 py-2 text-xs text-white/60 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={manualSubmitting}
                              className="flex items-center gap-2 rounded-xl bg-[var(--gold)] px-5 py-2 text-xs font-bold text-[var(--navy-deep)] hover:opacity-90 disabled:opacity-50"
                            >
                              {manualSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Appointment"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Events Tab */}
              {tab === "events" && (
                <EventsManager />
              )}

              {/* Registrations Tab */}
              {tab === "registrations" && (
                <RegistrationsManager />
              )}

              {/* Analytics Tab */}
              {tab === "analytics" && insights && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="text-xl font-bold">Analytics</h2>
                    <div className="flex items-center gap-3">
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => { setCustomStartDate(e.target.value); setInsightsRange("") }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 focus:outline-none [color-scheme:dark]"
                      />
                      <span className="text-white/30">—</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => { setCustomEndDate(e.target.value); setInsightsRange("") }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 focus:outline-none [color-scheme:dark]"
                      />
                      <select
                        value={insightsRange}
                        onChange={(e) => { setInsightsRange(e.target.value); setCustomStartDate(""); setCustomEndDate("") }}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 focus:outline-none"
                      >
                        <option value="today" className="bg-[#0a0f1c]">Today</option>
                        <option value="7d" className="bg-[#0a0f1c]">Last 7 days</option>
                        <option value="30d" className="bg-[#0a0f1c]">Last 30 days</option>
                        <option value="90d" className="bg-[#0a0f1c]">Last 90 days</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard icon={Eye} label="Page Views" value={insights.summary.pageviews} color="red" />
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
                                  className="h-full rounded-full bg-red-500"
                                  style={{ width: `${(p.views / Math.max(...insights.top_pages.map((x) => x.views), 1)) * 100}%` }}
                                />
                              </div>
                              <span className="font-semibold text-red-400">{p.views}</span>
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
                            <span className="font-semibold text-red-400">{c.clicks}</span>
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
                            <span className="font-semibold text-red-400">{c.count}</span>
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
                            <span className="font-semibold text-red-400">{d.count}</span>
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
    blue: "from-red-500/20 to-red-600/5 text-red-400 border-red-500/20",
    cyan: "from-[#1a2744]/25 to-[#1a2744]/5 text-white/80 border-[#1a2744]/30",
    purple: "from-red-500/10 to-red-600/5 text-red-400 border-red-500/15",
    green: "from-red-500/20 to-red-600/5 text-red-400 border-red-500/20",
    orange: "from-[#1a2744]/20 to-[#1a2744]/5 text-white/70 border-[#1a2744]/20",
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
