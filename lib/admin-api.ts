export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://firststep-backend.chrisjaron99.workers.dev'

const ADMIN_KEY = 'fscs_admin_user'

export interface AdminUser {
  id: number
  username: string
  email: string
  role: string
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(ADMIN_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AdminUser
  } catch {
    return null
  }
}

export function setAdminUser(admin: AdminUser): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ADMIN_KEY)
}

export function hasAdminSession(): boolean {
  return getAdminUser() !== null
}

async function adminFetch(path: string, options: RequestInit = {}): Promise<{ ok: boolean; data?: unknown; error?: string; status: number }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) {
      if (res.status === 401) {
        clearAdminSession()
      }
      return { ok: false, error: (data as { error?: string })?.error || 'Request failed', status: res.status }
    }
    return { ok: true, data, status: res.status }
  } catch {
    return { ok: false, error: 'Network error', status: 0 }
  }
}

export const adminApi = {
  login: async (username: string, password: string) => {
    const result = await adminFetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    if (result.ok && result.data) {
      const data = result.data as { admin: AdminUser }
      setAdminUser(data.admin)
      return { success: true, admin: data.admin }
    }
    return { success: false, error: result.error }
  },

  logout: async () => {
    await adminFetch('/api/admin/logout', { method: 'POST' })
    clearAdminSession()
    return { success: true }
  },

  verify: async () => {
    const result = await adminFetch('/api/admin/verify')
    if (result.ok && result.data) {
      const data = result.data as { valid: boolean; admin: AdminUser }
      if (data.valid) {
        setAdminUser(data.admin)
      }
      return data.valid
    }
    clearAdminSession()
    return false
  },

  getLeads: (params?: { page?: number; limit?: number; status?: string; source?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.status) qs.set('status', params.status)
    if (params?.source) qs.set('source', params.source)
    return adminFetch(`/api/admin/leads?${qs.toString()}`)
  },

  updateLead: (id: number, data: { status?: string; notes?: string }) =>
    adminFetch(`/api/admin/leads?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteLead: (id: number) =>
    adminFetch(`/api/admin/leads?id=${id}`, { method: 'DELETE' }),

  getContacts: (params?: { page?: number; limit?: number; status?: string; service?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.status) qs.set('status', params.status)
    if (params?.service) qs.set('service', params.service)
    return adminFetch(`/api/admin/contacts?${qs.toString()}`)
  },

  updateContact: (id: number, data: { status?: string; notes?: string }) =>
    adminFetch(`/api/admin/contacts?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteContact: (id: number) =>
    adminFetch(`/api/admin/contacts?id=${id}`, { method: 'DELETE' }),

  getInsights: (range = '7d', startDate?: string, endDate?: string) => {
    const qs = new URLSearchParams()
    qs.set('range', range)
    if (startDate) qs.set('start_date', startDate)
    if (endDate) qs.set('end_date', endDate)
    return adminFetch(`/api/insights?${qs.toString()}`)
  },

  getAuditLog: (page = 1, limit = 50) =>
    adminFetch(`/api/admin/audit?page=${page}&limit=${limit}`),

  // Bookings
  getBookings: (params?: { status?: string; date?: string }) => {
    const qs = new URLSearchParams()
    if (params?.status) qs.set('status', params.status)
    if (params?.date) qs.set('date', params.date)
    return adminFetch(`/api/admin/bookings?${qs.toString()}`)
  },

  createBooking: (data: {
    client_name: string
    client_email: string
    client_phone?: string
    date: string
    start_time: string
    timezone?: string
    notes?: string
  }) =>
    adminFetch(`/api/bookings`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateBooking: (id: number, data: { status: string; notes?: string }) =>
    adminFetch(`/api/admin/bookings`, {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    }),

  deleteBooking: (id: number) =>
    adminFetch(`/api/admin/bookings?id=${id}`, { method: 'DELETE' }),

  // Availability & Blocked Dates
  getAvailability: () => adminFetch('/api/admin/availability'),

  updateAvailability: (schedule: {
    day_of_week: number
    start_time: string
    end_time: string
    slot_duration: number
    is_active: number | boolean
  }[]) =>
    adminFetch('/api/admin/availability', {
      method: 'PUT',
      body: JSON.stringify({ schedule }),
    }),

  addBlockedDate: (date: string, reason?: string) =>
    adminFetch('/api/admin/blocked-dates', {
      method: 'POST',
      body: JSON.stringify({ date, reason }),
    }),

  deleteBlockedDate: (date: string) =>
    adminFetch(`/api/admin/blocked-dates?date=${date}`, {
      method: 'DELETE',
    }),

  // Events (admin CRUD)
  getEvents: (params?: { page?: number; limit?: number; status?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.status) qs.set('status', params.status)
    return adminFetch(`/api/admin/events?${qs.toString()}`)
  },

  createEvent: (data: Record<string, unknown>) =>
    adminFetch('/api/admin/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateEvent: (id: number, data: Record<string, unknown>) =>
    adminFetch('/api/admin/events', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    }),

  deleteEvent: (id: number) =>
    adminFetch(`/api/admin/events?id=${id}`, { method: 'DELETE' }),

  // Event registrations
  getRegistrations: (params?: { page?: number; limit?: number; event_id?: number; event_slug?: string; search?: string }) => {
    const qs = new URLSearchParams()
    if (params?.page) qs.set('page', String(params.page))
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.event_id) qs.set('event_id', String(params.event_id))
    if (params?.event_slug) qs.set('event_slug', params.event_slug)
    if (params?.search) qs.set('search', params.search)
    return adminFetch(`/api/admin/event-registrations?${qs.toString()}`)
  },

  deleteRegistration: (id: number) =>
    adminFetch(`/api/admin/event-registrations?id=${id}`, { method: 'DELETE' }),
}

