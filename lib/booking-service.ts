export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://firststep-backend.chrisjaron99.workers.dev'

export interface DaySchedule {
  day_of_week: number // 0=Sun, 1=Mon, ..., 6=Sat
  start_time: string // '09:30'
  end_time: string // '18:00'
  slot_duration: number // in minutes, e.g. 30
  is_active: boolean | number
}

export interface BlockedDate {
  date: string // 'YYYY-MM-DD'
  reason?: string | null
}

export interface Booking {
  id?: number | string
  client_name: string
  client_email: string
  client_phone?: string | null
  date: string // 'YYYY-MM-DD'
  start_time: string // '10:00'
  end_time: string // '10:30'
  timezone: string
  meet_link?: string | null
  status: 'confirmed' | 'completed' | 'cancelled'
  service?: string
  meeting_type?: 'meet' | 'phone'
  notes?: string | null
  created_at?: string
}

export interface BookingPayload {
  client_name: string
  client_email: string
  client_phone?: string
  date: string
  start_time: string
  timezone?: string
  service?: string
  meeting_type?: 'meet' | 'phone'
  notes?: string
}

export const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day_of_week: 1, start_time: '09:30', end_time: '18:00', slot_duration: 30, is_active: true },
  { day_of_week: 2, start_time: '09:30', end_time: '18:00', slot_duration: 30, is_active: true },
  { day_of_week: 3, start_time: '09:30', end_time: '18:00', slot_duration: 30, is_active: true },
  { day_of_week: 4, start_time: '09:30', end_time: '18:00', slot_duration: 30, is_active: true },
  { day_of_week: 5, start_time: '09:30', end_time: '18:00', slot_duration: 30, is_active: true },
  { day_of_week: 6, start_time: '10:00', end_time: '14:00', slot_duration: 30, is_active: true },
  { day_of_week: 0, start_time: '10:00', end_time: '14:00', slot_duration: 30, is_active: false },
]

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAY_SHORT_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// ─── Local Storage Keys (Fallback Sync) ───
const STORAGE_AVAILABILITY = 'fscs_availability_schedule'
const STORAGE_BLOCKED_DATES = 'fscs_blocked_dates'
const STORAGE_LOCAL_BOOKINGS = 'fscs_local_bookings'

export function getLocalSchedule(): DaySchedule[] {
  if (typeof window === 'undefined') return DEFAULT_SCHEDULE
  try {
    const raw = localStorage.getItem(STORAGE_AVAILABILITY)
    if (!raw) return DEFAULT_SCHEDULE
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCHEDULE
  } catch {
    return DEFAULT_SCHEDULE
  }
}

export function saveLocalSchedule(schedule: DaySchedule[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_AVAILABILITY, JSON.stringify(schedule))
  } catch {
    // ignore
  }
}

export function getLocalBlockedDates(): BlockedDate[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_BLOCKED_DATES)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveLocalBlockedDates(blocked: BlockedDate[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_BLOCKED_DATES, JSON.stringify(blocked))
  } catch {
    // ignore
  }
}

export function getLocalBookings(): Booking[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_LOCAL_BOOKINGS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveLocalBooking(booking: Booking): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getLocalBookings()
    localStorage.setItem(STORAGE_LOCAL_BOOKINGS, JSON.stringify([booking, ...existing]))
  } catch {
    // ignore
  }
}

// ─── Time & Date Calculations ───
export function formatTime12h(timeStr: string): string {
  if (!timeStr) return ''
  const [hStr, mStr] = timeStr.split(':')
  const h = Number(hStr)
  const m = Number(mStr) || 0
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hh = h % 12 || 12
  return `${hh}:${m.toString().padStart(2, '0')} ${ampm}`
}

export function computeEndTime(startTime: string, durationMins: number): string {
  const [sh, sm] = startTime.split(':').map(Number)
  const totalMins = sh * 60 + sm + durationMins
  const endH = Math.floor(totalMins / 60) % 24
  const endM = totalMins % 60
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`
}

export function generateSlotsBetween(startTime: string, endTime: string, durationMins: number): string[] {
  const slots: string[] = []
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  let curr = sh * 60 + sm
  const end = eh * 60 + em

  while (curr + durationMins <= end) {
    const h = Math.floor(curr / 60).toString().padStart(2, '0')
    const m = (curr % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
    curr += durationMins
  }
  return slots
}

// ─── Slot Categorization ───
export function categorizeSlots(slots: string[]): {
  morning: string[]
  afternoon: string[]
  evening: string[]
} {
  const morning: string[] = []
  const afternoon: string[] = []
  const evening: string[] = []

  for (const s of slots) {
    const [h] = s.split(':').map(Number)
    if (h < 12) {
      morning.push(s)
    } else if (h < 16) {
      afternoon.push(s)
    } else {
      evening.push(s)
    }
  }

  return { morning, afternoon, evening }
}

// ─── API Client Methods ───

export async function fetchPublicAvailability(): Promise<{
  activeDays: DaySchedule[]
  blockedDates: BlockedDate[]
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/availability/public`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (data.active_days && Array.isArray(data.active_days)) {
        const fullSchedule = DEFAULT_SCHEDULE.map((def) => {
          const found = data.active_days.find((a: DaySchedule) => a.day_of_week === def.day_of_week)
          return found
            ? { ...def, ...found, is_active: Boolean(found.is_active ?? true) }
            : { ...def, is_active: false }
        })
        saveLocalSchedule(fullSchedule)
        saveLocalBlockedDates(data.blocked_dates || [])
        return {
          activeDays: fullSchedule,
          blockedDates: data.blocked_dates || [],
        }
      }
    }
  } catch {
    // fallback
  }

  return {
    activeDays: getLocalSchedule(),
    blockedDates: getLocalBlockedDates(),
  }
}

export async function fetchAvailableSlots(dateStr: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/bookings/slots?date=${dateStr}`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.slots)) {
        return data.slots
      }
    }
  } catch {
    // fallback below
  }

  // Local fallback calculation
  const reqDate = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (reqDate < today) return []

  const blocked = getLocalBlockedDates().some((b) => b.date === dateStr)
  if (blocked) return []

  const dayOfWeek = reqDate.getDay()
  const schedule = getLocalSchedule().find((s) => s.day_of_week === dayOfWeek)

  if (!schedule || !schedule.is_active) return []

  const duration = schedule.slot_duration || 30
  const allSlots = generateSlotsBetween(schedule.start_time, schedule.end_time, duration)

  // Filter local booked appointments
  const localBooked = new Set(
    getLocalBookings()
      .filter((b) => b.date === dateStr && b.status === 'confirmed')
      .map((b) => b.start_time)
  )

  const isToday = reqDate.getTime() === today.getTime()
  const nowMins = now.getHours() * 60 + now.getMinutes()

  return allSlots.filter((slot) => {
    if (localBooked.has(slot)) return false
    if (isToday) {
      const [sh, sm] = slot.split(':').map(Number)
      if (sh * 60 + sm <= nowMins + 15) return false // at least 15 mins notice
    }
    return true
  })
}

export async function createBooking(payload: BookingPayload): Promise<{
  success: boolean
  booking?: Booking
  error?: string
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: payload.client_name,
        client_email: payload.client_email,
        client_phone: payload.client_phone || undefined,
        date: payload.date,
        start_time: payload.start_time,
        timezone: payload.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
      }),
    })

    const data = await res.json().catch(() => null)

    if (res.ok && data) {
      const newBooking: Booking = {
        id: data.id,
        client_name: payload.client_name,
        client_email: payload.client_email,
        client_phone: payload.client_phone,
        date: payload.date,
        start_time: payload.start_time,
        end_time: data.end_time || computeEndTime(payload.start_time, 30),
        timezone: payload.timezone || 'Asia/Kolkata',
        status: 'confirmed',
        service: payload.service,
        notes: payload.notes,
        created_at: new Date().toISOString(),
      }
      saveLocalBooking(newBooking)
      return { success: true, booking: newBooking }
    } else if (data?.error && res.status < 500 && data.error !== 'Internal server error') {
      return { success: false, error: data.error }
    }
  } catch {
    // offline fallback
  }

  // Local fallback save
  const newBooking: Booking = {
    id: `local-${Date.now()}`,
    client_name: payload.client_name,
    client_email: payload.client_email,
    client_phone: payload.client_phone,
    date: payload.date,
    start_time: payload.start_time,
    end_time: computeEndTime(payload.start_time, 30),
    timezone: payload.timezone || 'Asia/Kolkata',
    status: 'confirmed',
    service: payload.service,
    notes: payload.notes,
    created_at: new Date().toISOString(),
  }
  saveLocalBooking(newBooking)

  return { success: true, booking: newBooking }
}

// ─── Calendar Integrations (.ics & Google Calendar) ───

export function getGoogleCalendarUrl(booking: Booking): string {
  const [sy, sm, sd] = booking.date.split('-').map(Number)
  const [sh, smin] = booking.start_time.split(':').map(Number)
  const [eh, emin] = (booking.end_time || computeEndTime(booking.start_time, 30)).split(':').map(Number)

  const startIso = `${booking.date.replace(/-/g, '')}T${booking.start_time.replace(/:/g, '')}00`
  const endIso = `${booking.date.replace(/-/g, '')}T${(booking.end_time || computeEndTime(booking.start_time, 30)).replace(/:/g, '')}00`

  const title = encodeURIComponent(`Consultation: Francis J. & ${booking.client_name}`)
  const details = encodeURIComponent(
    `Financial Consultation with Francis J. (First Step Consultancy Services).\n\nService: ${booking.service || 'Financial Advisory'}\nClient: ${booking.client_name} (${booking.client_email})\n${booking.client_phone ? `Phone: ${booking.client_phone}\n` : ''}${booking.notes ? `Client Notes: ${booking.notes}\n` : ''}`
  )
  const location = encodeURIComponent('First Step Consultancy Services')

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`
}

export function downloadIcsFile(booking: Booking): void {
  if (typeof window === 'undefined') return

  const startIso = `${booking.date.replace(/-/g, '')}T${booking.start_time.replace(/:/g, '')}00`
  const endIso = `${booking.date.replace(/-/g, '')}T${(booking.end_time || computeEndTime(booking.start_time, 30)).replace(/:/g, '')}00`

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//First Step Consultancy Services//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:fscs-${booking.id || Date.now()}@firststepcs.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART;TZID=${booking.timezone || 'Asia/Kolkata'}:${startIso}`,
    `DTEND;TZID=${booking.timezone || 'Asia/Kolkata'}:${endIso}`,
    `SUMMARY:Consultation: Francis J. & ${booking.client_name}`,
    `DESCRIPTION:Consultation with Francis J. - AMFI Registered MFD.\\nService: ${booking.service || 'Financial Advisory'}\\nClient: ${booking.client_name}`,
    'LOCATION:First Step Consultancy Services',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `FirstStep_Consultation_${booking.date}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
