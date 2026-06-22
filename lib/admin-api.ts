export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://firststep-backend.chrisjaron99.workers.dev'

const TOKEN_KEY = 'fscs_admin_token'
const ADMIN_KEY = 'fscs_admin_user'
const EXPIRY_KEY = 'fscs_admin_expiry'
const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000 // 8 hours, matching JWT expiry

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  // Check if session has expired locally
  const expiry = localStorage.getItem(EXPIRY_KEY)
  if (expiry && Date.now() > parseInt(expiry, 10)) {
    clearAdminSession()
    return null
  }
  return localStorage.getItem(TOKEN_KEY)
}

export function setAdminSession(token: string, admin: AdminUser): void {
  if (typeof window === 'undefined') return
  const expiry = Date.now() + SESSION_TIMEOUT_MS
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
  localStorage.setItem(EXPIRY_KEY, String(expiry))
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ADMIN_KEY)
  localStorage.removeItem(EXPIRY_KEY)
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

export interface AdminUser {
  id: number
  username: string
  email: string
  role: string
}

async function adminFetch(path: string, options: RequestInit = {}): Promise<{ ok: boolean; data?: unknown; error?: string; status: number }> {
  const token = getAdminToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
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
      const data = result.data as { token: string; admin: AdminUser }
      setAdminSession(data.token, data.admin)
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
        setAdminSession(getAdminToken()!, data.admin)
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
