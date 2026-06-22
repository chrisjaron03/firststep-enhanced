export interface Env {
  DB: D1Database
  ALLOWED_ORIGINS: string
  JWT_SECRET: string
}

export interface LeadRecord {
  source: string
  name: string
  email: string
  phone: string
  monthly_investment?: number
  expected_return?: number
  tenure_years?: number
  projected_value?: number
  page_url?: string
  referrer?: string
  user_agent?: string
  ip_hash?: string
  session_id?: string
}

export interface ContactRecord {
  first_name: string
  last_name: string
  email: string
  phone: string
  investment_range?: string
  service?: string
  message?: string
  page_url?: string
  referrer?: string
  user_agent?: string
  ip_hash?: string
  session_id?: string
}

export interface AnalyticsEvent {
  session_id: string
  type: 'pageview' | 'click' | 'scroll' | 'custom'
  page_url: string
  page_path: string
  referrer?: string
  element_id?: string
  element_class?: string
  element_text?: string
  element_href?: string
  scroll_depth?: number
  event_name?: string
  event_data?: string
  user_agent?: string
  ip_hash?: string
  country?: string
  city?: string
  device?: string
  browser?: string
}
