"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, Trash2, Loader2, Users, Calendar, Mail, Phone, Filter, Download, RefreshCw } from "lucide-react"
import { adminApi } from "@/lib/admin-api"

interface Registration {
  id: number
  event_id: number
  name: string
  email: string
  phone: string | null
  status: string
  created_at: string
  event_slug: string | null
  event_title: string | null
}

interface EventOption {
  id: number
  slug: string
  title: string
}

export function RegistrationsManager() {
  const [regs, setRegs] = useState<Registration[]>([])
  const [events, setEvents] = useState<EventOption[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [eventFilter, setEventFilter] = useState<string>("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, eventFilter])

  const fetchRegs = useCallback(async () => {
    setLoading(true)
    const params: Record<string, string | number> = { page, limit }
    if (eventFilter) (params as any).event_id = Number(eventFilter)
    if (debouncedSearch) (params as any).search = debouncedSearch
    const res = await adminApi.getRegistrations(params as any)
    if (res.ok && res.data) {
      const d = res.data as { data: Registration[]; total: number; events: EventOption[] }
      setRegs(d.data || [])
      setTotal(d.total || 0)
      if (d.events) setEvents(d.events)
    }
    setLoading(false)
  }, [page, limit, eventFilter, debouncedSearch])

  useEffect(() => {
    fetchRegs()
  }, [fetchRegs])

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this registration? This will also free up one seat.")) return
    const res = await adminApi.deleteRegistration(id)
    if (res.ok) fetchRegs()
    else alert((res as any).error || "Failed to delete")
  }

  const handleExport = () => {
    const headers = ["Name", "Email", "Phone", "Event", "Status", "Registered At"]
    const rows = regs.map((r) => [
      `"${r.name.replace(/"/g, '""')}"`,
      r.email,
      r.phone || "",
      `"${(r.event_title || r.event_slug || "").replace(/"/g, '""')}"`,
      r.status,
      new Date(r.created_at + "Z").toLocaleString("en-IN"),
    ].join(","))
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `registrations-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">Registrations <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs text-emerald-400">{total} total</span></h2>
          <p className="text-xs text-white/50 mt-1">All event sign-ups. Filter by event, search by name/email/phone. Export CSV for WhatsApp broadcast.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} disabled={regs.length === 0} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/10 disabled:opacity-40">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={fetchRegs} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white/70 hover:bg-white/10">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone..." className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-white/30 hidden sm:block" />
          <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 focus:outline-none [&>option]:bg-[#0a0f1c] min-w-[180px]">
            <option value="">All events</option>
            {events.map((ev) => (
              <option key={ev.id} value={String(ev.id)}>{ev.title} (/{ev.slug})</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="flex items-center gap-2 text-sm text-white/40"><Loader2 className="h-4 w-4 animate-spin" /> Loading registrations...</div>}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left text-xs uppercase tracking-wider text-white/40">
              <th className="px-4 py-3">Attendee</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Registered</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {regs.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-6 py-16 text-center">
                <Users className="mx-auto h-8 w-8 text-white/20" />
                <p className="mt-2 text-sm font-medium text-white/60">No registrations yet</p>
                <p className="text-xs text-white/40">Share <span className="text-emerald-400">/events/the-money-blueprint</span> to get sign-ups. They appear here instantly.</p>
              </td></tr>
            )}
            {regs.map((r) => (
              <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-3">
                  <div className="font-semibold text-white flex items-center gap-2"><Users className="h-3.5 w-3.5 text-white/30" />{r.name}</div>
                  <div className="text-xs text-white/30">#{r.id}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-white/80 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-white/30" />{r.email}</div>
                  <div className="text-xs text-white/50 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-white/30" />{r.phone || "—"}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs font-semibold text-white">{r.event_title || r.event_slug || `Event #${r.event_id}`}</div>
                  <div className="text-xs text-white/40">/{r.event_slug || r.event_id}</div>
                </td>
                <td className="px-4 py-3"><span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400">{r.status}</span></td>
                <td className="px-4 py-3 text-xs text-white/50">
                  <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-white/30" />{new Date(r.created_at + "Z").toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/40 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-white/40">Page {page} of {totalPages} • {total} registrations</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs disabled:opacity-30">Prev</button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs disabled:opacity-30">Next</button>
        </div>
      </div>
    </div>
  )
}
