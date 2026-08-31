export interface Env {
  DB: D1Database
  ALLOWED_ORIGINS: string
  JWT_SECRET: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  RESEND_API_KEY?: string
  RESEND_FROM_EMAIL?: string
  ADMIN_EMAIL?: string
  FRONTEND_URL?: string
}

export interface EventRecord {
  id: number
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  agenda: string
  venue: string | null
  event_date: string | null
  price: number
  original_price: number | null
  currency: string
  cover_image: string | null
  gallery: string
  video_url: string | null
  cta_label: string
  cta_url: string | null
  status: string
  featured: number
  max_seats: number | null
  seats_sold: number
  is_free: number
  delivery_mode: string
  duration_mins: number | null
  language: string
  timezone: string
  curriculum: string
  learn_items: string
  outcomes: string
  for_you: string
  not_for_you: string
  inside_flow: string
  tagline: string | null
  value_anchor_price: number | null
  instructor_note: string | null
  meeting_link: string | null
  whatsapp_community_link: string | null
  section_headings: string
  created_by: number | null
  created_at: string
  updated_at: string
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

export interface AppointmentRecord {
  client_name: string
  client_email: string
  client_phone?: string
  date: string
  start_time: string
  end_time: string
  timezone?: string
}

export interface AvailabilitySlot {
  day_of_week: number
  start_time: string
  end_time: string
  slot_duration: number
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
