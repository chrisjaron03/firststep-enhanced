export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://firststep-backend.chrisjaron99.workers.dev'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  const key = 'fscs_session_id'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}

async function postJSON(path: string, data: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': getSessionId(),
      },
      body: JSON.stringify(data),
      keepalive: true,
    })
    return res.ok
  } catch {
    return false
  }
}

export interface LeadPayload {
  source: 'lead_capture_modal' | 'exit_intent_modal' | 'sip_calculator' | 'general-guide' | 'contact-download' | 'nri-guide-popup' | 'nri-guide-download'
  name: string
  email: string
  phone: string
  website?: string
  monthly_investment?: number
  expected_return?: number
  tenure_years?: number
  projected_value?: number
  page_url?: string
  referrer?: string
}

export interface ContactPayload {
  first_name: string
  last_name: string
  email: string
  phone: string
  website?: string
  investment_range?: string
  service?: string
  message?: string
  page_url?: string
  referrer?: string
}

export const api = {
  submitLead: (data: LeadPayload) =>
    postJSON('/api/leads', {
      ...data,
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer || undefined : undefined,
    }),

  submitContact: (data: ContactPayload) =>
    postJSON('/api/contacts', {
      ...data,
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
      referrer: typeof window !== 'undefined' ? document.referrer || undefined : undefined,
    }),

  trackEvent: (data: {
    type: 'pageview' | 'click' | 'scroll' | 'custom'
    page_url?: string
    page_path?: string
    referrer?: string
    element_id?: string
    element_class?: string
    element_text?: string
    element_href?: string
    scroll_depth?: number
    event_name?: string
    event_data?: string
  }) =>
    postJSON('/api/analytics', {
      session_id: getSessionId(),
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
      ...data,
    }),
}
