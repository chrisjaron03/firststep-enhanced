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

  getInsights: (range = '7d') =>
    adminFetch(`/api/insights?range=${range}`),

  getAuditLog: (page = 1, limit = 50) =>
    adminFetch(`/api/admin/audit?page=${page}&limit=${limit}`),
}
