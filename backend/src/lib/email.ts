/**
 * Email utility using the Resend HTTP API (global fetch, Cloudflare Workers compatible).
 * Uses admin@firststepcs.com / firststepcs.com branding for First Step Consultancy Services.
 * All senders are best-effort: they log and swallow errors so a failed email never breaks the API request.
 */

const RESEND_API_URL = "https://api.resend.com/emails"

export const DEFAULT_FROM_EMAIL = "First Step Consultancy Services <admin@firststepcs.com>"
export const ADMIN_EMAIL = "francis@firststepcs.com"

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  replyTo?: string
}

export interface EmailSendResult {
  success: boolean
  error?: string
  messageId?: string
}

export async function sendEmail(
  apiKey: string,
  options: SendEmailOptions,
  fromEmail: string = DEFAULT_FROM_EMAIL
): Promise<EmailSendResult> {
  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        ...(options.replyTo ? { reply_to: options.replyTo } : {}),
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("[email] send failed", response.status, String(errorBody).slice(0, 1000))
      return { success: false, error: `Resend API error: ${response.status}` }
    }

    const body = (await response.json().catch(() => null)) as { id?: string } | null
    const messageId = body?.id ? String(body.id) : undefined
    console.log("[email] send success", { to: options.to, messageId })
    return { success: true, messageId }
  } catch (error) {
    console.error("[email] send error", error instanceof Error ? error.message : String(error))
    return { success: false, error: "Failed to send email" }
  }
}

export function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function formatINR(amount: number): string {
  try {
    return `₹${Number(amount).toLocaleString("en-IN")}`
  } catch {
    return `₹${amount}`
  }
}

function formatDateLong(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00")
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  } catch {
    return dateStr
  }
}

function formatTime12h(time: string): string {
  const [h, m] = time.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const hr = h % 12 || 12
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`
}

// ── Branded HTML Layout ──
function layout(options: { heading: string; badge?: string; body: string; footerNote?: string }): string {
  const heading = escapeHtml(options.heading)
  const badge = options.badge ? escapeHtml(options.badge) : "First Step Consultancy Services"
  const footerNote = options.footerNote
    ? `<p style="margin:10px 0 0; font-size:12px; line-height:1.6; color:#64748b;">${escapeHtml(options.footerNote)}</p>`
    : ""

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
    </head>
    <body style="margin:0; padding:0; background:#f1f5f9; font-family:'Segoe UI', Arial, Helvetica, sans-serif; color:#0f172a;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9; padding:28px 14px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; background:#ffffff; border:1px solid #dbe4f0; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(15,23,42,0.08);">
              <tr>
                <td style="background:#101c30; padding:26px 30px 20px;">
                  <div style="display:inline-block; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#D4AF37; background:rgba(255,255,255,0.08); padding:6px 12px; border-radius:999px;">
                    ${badge}
                  </div>
                  <h1 style="margin:14px 0 0; font-size:22px; line-height:1.3; font-weight:800; color:#ffffff;">
                    ${heading}
                  </h1>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 30px 10px; font-size:15px; line-height:1.7; color:#334155;">
                  ${options.body}
                </td>
              </tr>
              <tr>
                <td style="padding:16px 30px 22px; border-top:1px solid #e2e8f0; text-align:center;">
                  <p style="margin:0; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#94a3b8;">
                    First Step Consultancy Services &bull; AMFI Registered MFD &bull; firststepcs.com
                  </p>
                  <p style="margin:6px 0 0; font-size:11px; color:#94a3b8;">Francis J. &bull; Coimbatore &bull; +91 72007 43010 &bull; francis@firststepcs.com</p>
                  ${footerNote}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

function detailBox(rows: Array<{ label: string; value: string }>): string {
  const rowsHtml = rows
    .map(
      (row) =>
        `<tr>
          <td style="padding:8px 14px; border-bottom:1px solid #eef2f7; vertical-align:top; white-space:nowrap; font-weight:700; color:#101c30; font-size:13px; width:38%;">${row.label}</td>
          <td style="padding:8px 14px; border-bottom:1px solid #eef2f7; color:#334155; font-size:13px;">${row.value}</td>
        </tr>`
    )
    .join("")

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0; border-radius:12px; margin:18px 0; background:#fbfcfe;">
      <tr>
        <td style="padding:0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${rowsHtml}
          </table>
        </td>
      </tr>
    </table>
  `
}

function ctaButton(href: string, label: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 8px;">
      <tr>
        <td align="left">
          <a href="${escapeHtml(href)}" style="display:inline-block; padding:13px 26px; background:#DC2626; color:#ffffff; text-decoration:none; border-radius:10px; font-size:14px; font-weight:800; letter-spacing:0.01em;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `
}

// ══════════════════════════════════════════
// Customer-facing emails
// ══════════════════════════════════════════

export async function sendLeadCustomerEmail(
  apiKey: string | undefined,
  options: { to: string; name: string; source: string; projectedValue?: number | null },
  fromEmail?: string
): Promise<void> {
  if (!apiKey) {
    console.warn("[email] skip lead customer — RESEND_API_KEY missing")
    return
  }
  const name = escapeHtml(options.name)
  const html = layout({
    heading: "Thank You — We've Received Your Details!",
    badge: "First Step CS",
    body: `
      <p style="margin:0 0 12px;">Dear <strong>${name}</strong>,</p>
      <p style="margin:0 0 12px;">
        Thank you for your interest in <strong>First Step Consultancy Services</strong>. We have received your details
        and one of our advisors (Francis J., AMFI Registered MFD) will reach out to you shortly.
      </p>
      ${options.projectedValue ? detailBox([{ label: "Your Projection", value: formatINR(options.projectedValue) }]) : ""}
      <p style="margin:0 0 12px; font-size:14px; color:#475569;">
        In the meantime, feel free to explore our <a href="https://firststepcs.com/calculators" style="color:#DC2626; text-decoration:none; font-weight:600;">financial calculators</a>
        or book a consultation directly at <a href="https://firststepcs.com/book" style="color:#DC2626; text-decoration:none; font-weight:600;">firststepcs.com/book</a>.
      </p>
      <p style="margin:16px 0 0; font-size:13px; color:#64748b;">
        Questions? Call <strong>+91 72007 43010</strong> or write to <strong>francis@firststepcs.com</strong>.
      </p>
    `,
  })
  await sendEmail(apiKey, { to: options.to, subject: "Thank you — First Step Consultancy Services", html }, fromEmail)
}

export async function sendContactCustomerEmail(
  apiKey: string | undefined,
  options: { to: string; firstName: string; lastName: string; service?: string | null },
  fromEmail?: string
): Promise<void> {
  if (!apiKey) {
    console.warn("[email] skip contact customer — RESEND_API_KEY missing")
    return
  }
  const firstName = escapeHtml(options.firstName)
  const serviceLabel = options.service ? escapeHtml(options.service) : "Comprehensive Wealth Management"
  const html = layout({
    heading: "Your Consultation Request is Received!",
    badge: "Consultation Confirmed",
    body: `
      <p style="margin:0 0 12px;">Dear <strong>${firstName}</strong>,</p>
      <p style="margin:0 0 12px;">
        Thank you for contacting <strong>First Step Consultancy Services</strong>. Your consultation request for
        <strong>${serviceLabel}</strong> has been received. Our advisor will get back to you within <strong>24 hours</strong>.
      </p>
      ${ctaButton("https://firststepcs.com/book", "Book Your Consultation Slot")}
      <p style="margin:16px 0 0; font-size:13px; color:#64748b;">
        Need immediate assistance? Call <strong>+91 72007 43010</strong> or WhatsApp us. We typically respond within a few hours.
      </p>
    `,
  })
  await sendEmail(apiKey, { to: options.to, subject: "Consultation Request Received — First Step CS", html }, fromEmail)
}

export async function sendBookingCustomerEmail(
  apiKey: string | undefined,
  options: {
    to: string
    name: string
    date: string
    startTime: string
    endTime: string
    service?: string | null
    meetLink?: string | null
  },
  fromEmail?: string
): Promise<void> {
  if (!apiKey) {
    console.warn("[email] skip booking customer — RESEND_API_KEY missing")
    return
  }
  const name = escapeHtml(options.name)
  const dateLong = formatDateLong(options.date)
  const timeRange = `${formatTime12h(options.startTime)} – ${formatTime12h(options.endTime)} IST`
  const meetSection = options.meetLink
    ? `<p style="margin:12px 0 0;"><strong>Google Meet:</strong> <a href="${escapeHtml(options.meetLink)}" style="color:#DC2626; text-decoration:none;">${escapeHtml(options.meetLink)}</a></p>
       ${ctaButton(options.meetLink, "Join Google Meet")}`
    : `<p style="margin:12px 0 0; font-size:13px; color:#475569;">A calendar invite with the meeting link will be sent shortly. You can also join via the link in your confirmation.</p>`

  const html = layout({
    heading: "Your Consultation is Confirmed!",
    badge: "Booking Confirmed",
    body: `
      <p style="margin:0 0 12px;">Dear <strong>${name}</strong>,</p>
      <p style="margin:0 0 6px;">
        Your 1-on-1 consultation with <strong>Francis J. (AMFI Registered MFD)</strong> is confirmed.
      </p>
      ${detailBox([
        { label: "Date", value: escapeHtml(dateLong) },
        { label: "Time", value: escapeHtml(timeRange) },
        { label: "Service", value: options.service ? escapeHtml(options.service) : "Comprehensive Advisory" },
        { label: "Duration", value: "30 minutes" },
      ])}
      ${meetSection}
      <p style="margin:18px 0 0; font-size:13px; color:#64748b;">
        Add to calendar: <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Consultation: Francis J. & ${options.name}`)}&dates=${options.date.replace(/-/g, "")}T${options.startTime.replace(/:/g, "")}00/${options.date.replace(/-/g, "")}T${options.endTime.replace(/:/g, "")}00" style="color:#DC2626; text-decoration:none;">Google Calendar</a>
        &bull; Need to reschedule? Reply to this email or call <strong>+91 72007 43010</strong>.
      </p>
    `,
  })
  await sendEmail(
    apiKey,
    { to: options.to, subject: `Consultation Confirmed — ${dateLong} at ${formatTime12h(options.startTime)}`, html },
    fromEmail
  )
}

export async function sendEventRegistrationCustomerEmail(
  apiKey: string | undefined,
  options: { to: string; name: string; eventTitle: string; eventDate?: string | null; meetingLink?: string | null },
  fromEmail?: string
): Promise<void> {
  if (!apiKey) {
    console.warn("[email] skip event registration customer — RESEND_API_KEY missing")
    return
  }
  const name = escapeHtml(options.name)
  const html = layout({
    heading: "You're Registered!",
    badge: "Event Registration",
    body: `
      <p style="margin:0 0 12px;">Dear <strong>${name}</strong>,</p>
      <p style="margin:0 0 12px;">
        You're registered for <strong>${escapeHtml(options.eventTitle)}</strong>. We're excited to have you!
      </p>
      ${options.eventDate ? detailBox([{ label: "Event Date", value: escapeHtml(options.eventDate) }]) : ""}
      ${options.meetingLink ? ctaButton(options.meetingLink, "Join Event") : ""}
      <p style="margin:16px 0 0; font-size:13px; color:#64748b;">
        We'll send you a reminder before the event. For questions, write to <strong>francis@firststepcs.com</strong>.
      </p>
    `,
  })
  await sendEmail(apiKey, { to: options.to, subject: `Registered — ${escapeHtml(options.eventTitle)}`, html }, fromEmail)
}

// ══════════════════════════════════════════
// Admin notifications (to francis@firststepcs.com)
// ══════════════════════════════════════════

export async function sendAdminNotification(
  apiKey: string | undefined,
  options: { subject: string; heading: string; intro: string; rows: Array<{ label: string; value: string }> },
  fromEmail?: string
): Promise<void> {
  if (!apiKey) {
    console.warn("[email] skip admin notification — RESEND_API_KEY missing")
    return
  }
  const html = layout({
    heading: options.heading,
    badge: "Admin Alert",
    body: `
      <p style="margin:0 0 12px;">${options.intro}</p>
      ${detailBox(options.rows)}
      <p style="margin:0; font-size:13px; color:#64748b;">
        View in admin dashboard: <a href="https://firststepcs.com/admin" style="color:#DC2626; text-decoration:none;">firststepcs.com/admin</a>
      </p>
    `,
  })
  const to = ADMIN_EMAIL
  const result = await sendEmail(apiKey, { to, subject: options.subject, html }, fromEmail)
  if (!result.success) {
    console.error("[email] admin notification failed", result.error)
  }
}

export async function sendAdminLeadEmail(
  apiKey: string | undefined,
  options: { name: string; email: string; phone?: string | null; source: string; pageUrl?: string | null; projectedValue?: number | null; monthlyInvestment?: number | null; expectedReturn?: number | null; tenureYears?: number | null },
  fromEmail?: string
): Promise<void> {
  await sendAdminNotification(
    apiKey,
    {
      subject: `FirstStep: New Lead — ${options.name} (${options.source})`,
      heading: "New Lead Captured",
      intro: `A new lead was submitted via <strong>${escapeHtml(options.source)}</strong>.`,
      rows: [
        { label: "Name", value: escapeHtml(options.name) },
        { label: "Email", value: escapeHtml(options.email) },
        ...(options.phone ? [{ label: "Phone", value: escapeHtml(options.phone) }] : []),
        { label: "Source", value: escapeHtml(options.source) },
        ...(options.monthlyInvestment ? [{ label: "Monthly SIP", value: formatINR(options.monthlyInvestment) }] : []),
        ...(options.expectedReturn ? [{ label: "Expected Return", value: `${options.expectedReturn}%` }] : []),
        ...(options.tenureYears ? [{ label: "Tenure", value: `${options.tenureYears} years` }] : []),
        ...(options.projectedValue ? [{ label: "Projected Value", value: formatINR(options.projectedValue) }] : []),
        ...(options.pageUrl ? [{ label: "Page", value: `<a href="${escapeHtml(options.pageUrl)}" style="color:#DC2626; text-decoration:none;">${escapeHtml(options.pageUrl)}</a>` }] : []),
      ],
    },
    fromEmail
  )
}

export async function sendAdminContactEmail(
  apiKey: string | undefined,
  options: { firstName: string; lastName: string; email: string; phone: string; investmentRange?: string | null; service?: string | null; message?: string | null; pageUrl?: string | null },
  fromEmail?: string
): Promise<void> {
  await sendAdminNotification(
    apiKey,
    {
      subject: `FirstStep: New Contact — ${options.firstName} ${options.lastName}`,
      heading: "New Consultation Request",
      intro: `A new consultation request was submitted via the <strong>Contact Form</strong>.`,
      rows: [
        { label: "Name", value: escapeHtml(`${options.firstName} ${options.lastName}`) },
        { label: "Email", value: escapeHtml(options.email) },
        { label: "Phone", value: escapeHtml(options.phone) },
        ...(options.investmentRange ? [{ label: "Investment Range", value: escapeHtml(options.investmentRange) }] : []),
        ...(options.service ? [{ label: "Service", value: escapeHtml(options.service) }] : []),
        ...(options.message ? [{ label: "Message", value: escapeHtml(options.message) }] : []),
        ...(options.pageUrl ? [{ label: "Page", value: `<a href="${escapeHtml(options.pageUrl)}" style="color:#DC2626; text-decoration:none;">${escapeHtml(options.pageUrl)}</a>` }] : []),
      ],
    },
    fromEmail
  )
}

export async function sendAdminBookingEmail(
  apiKey: string | undefined,
  options: { clientName: string; clientEmail: string; clientPhone?: string | null; date: string; startTime: string; endTime: string; service?: string | null; notes?: string | null },
  fromEmail?: string
): Promise<void> {
  await sendAdminNotification(
    apiKey,
    {
      subject: `FirstStep: New Booking — ${options.clientName} on ${options.date} ${options.startTime}`,
      heading: "New Consultation Booked",
      intro: `A new consultation has been scheduled. Please confirm and prepare for the session.`,
      rows: [
        { label: "Client", value: escapeHtml(options.clientName) },
        { label: "Email", value: escapeHtml(options.clientEmail) },
        ...(options.clientPhone ? [{ label: "Phone", value: escapeHtml(options.clientPhone) }] : []),
        { label: "Date", value: escapeHtml(formatDateLong(options.date)) },
        { label: "Time", value: `${escapeHtml(formatTime12h(options.startTime))} – ${escapeHtml(formatTime12h(options.endTime))} IST` },
        ...(options.service ? [{ label: "Service", value: escapeHtml(options.service) }] : []),
        ...(options.notes ? [{ label: "Notes", value: escapeHtml(options.notes) }] : []),
      ],
    },
    fromEmail
  )
}

export async function sendAdminEventRegistrationEmail(
  apiKey: string | undefined,
  options: { eventTitle: string; name: string; email: string; phone?: string | null },
  fromEmail?: string
): Promise<void> {
  await sendAdminNotification(
    apiKey,
    {
      subject: `FirstStep: New Event Registration — ${options.eventTitle}`,
      heading: "New Event Registration",
      intro: `A new registration was received for <strong>${escapeHtml(options.eventTitle)}</strong>.`,
      rows: [
        { label: "Name", value: escapeHtml(options.name) },
        { label: "Email", value: escapeHtml(options.email) },
        ...(options.phone ? [{ label: "Phone", value: escapeHtml(options.phone) }] : []),
        { label: "Event", value: escapeHtml(options.eventTitle) },
      ],
    },
    fromEmail
  )
}
