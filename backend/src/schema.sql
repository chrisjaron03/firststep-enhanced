-- FirstStep Consultancy Services — D1 Schema
-- Tables: leads, contacts, analytics_events, analytics_sessions

-- ─── Leads ───
-- Captured from: Lead Capture Modal, Exit Intent Modal, SIP Calculator
CREATE TABLE IF NOT EXISTS leads (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  source        TEXT    NOT NULL,          -- 'lead_capture_modal' | 'exit_intent_modal' | 'sip_calculator'
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL,
  phone         TEXT,
  -- SIP-specific fields (nullable for other sources)
  monthly_investment INTEGER,
  expected_return    REAL,
  tenure_years       INTEGER,
  projected_value    REAL,
  -- metadata
  page_url      TEXT,
  referrer      TEXT,
  user_agent    TEXT,
  ip_hash       TEXT,                      -- SHA-256 hash of IP (never raw IP)
  session_id    TEXT,
  status        TEXT    NOT NULL DEFAULT 'new',  -- 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  notes         TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_email      ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_source     ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status     ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- ─── Contacts ───
-- Captured from: Contact Form (full consultation request)
CREATE TABLE IF NOT EXISTS contacts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name      TEXT    NOT NULL,
  last_name       TEXT    NOT NULL,
  email           TEXT    NOT NULL,
  phone           TEXT    NOT NULL,
  investment_range TEXT,                    -- 'under5' | '5to25' | etc.
  service         TEXT,                     -- 'mf' | 'pms' | 'aif' | etc.
  message         TEXT,
  -- metadata
  page_url        TEXT,
  referrer        TEXT,
  user_agent      TEXT,
  ip_hash         TEXT,
  session_id      TEXT,
  status          TEXT    NOT NULL DEFAULT 'new',  -- 'new' | 'contacted' | 'scheduled' | 'completed' | 'lost'
  notes           TEXT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_contacts_email      ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status     ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_service    ON contacts(service);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- ─── Analytics Events ───
-- Clicks, page views, scrolls, custom events
CREATE TABLE IF NOT EXISTS analytics_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT    NOT NULL,
  type        TEXT    NOT NULL,             -- 'pageview' | 'click' | 'scroll' | 'custom'
  -- page context
  page_url    TEXT    NOT NULL,
  page_path   TEXT    NOT NULL,
  referrer    TEXT,
  -- click-specific
  element_id     TEXT,
  element_class  TEXT,
  element_text   TEXT,
  element_href   TEXT,
  -- scroll-specific
  scroll_depth   REAL,
  -- custom event
  event_name     TEXT,
  event_data     TEXT,                      -- JSON string
  -- visitor metadata
  user_agent  TEXT,
  ip_hash     TEXT,
  country     TEXT,                         -- from Cf-IPCountry header
  city        TEXT,
  device      TEXT,                         -- 'desktop' | 'mobile' | 'tablet'
  browser     TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_analytics_session   ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_type      ON analytics_events(type);
CREATE INDEX IF NOT EXISTS idx_analytics_page_path ON analytics_events(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_created   ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);

-- ─── Analytics Sessions (aggregated) ───
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT    NOT NULL UNIQUE,
  first_page  TEXT,
  last_page   TEXT,
  page_count  INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  country     TEXT,
  city        TEXT,
  device      TEXT,
  browser     TEXT,
  referrer    TEXT,
  ip_hash     TEXT,
  started_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  last_active TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_started  ON analytics_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_country  ON analytics_sessions(country);
CREATE INDEX IF NOT EXISTS idx_sessions_device   ON analytics_sessions(device);

-- ─── Admin Users ───
CREATE TABLE IF NOT EXISTS admin_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL UNIQUE,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,              -- PBKDF2 hash
  password_salt TEXT    NOT NULL,              -- random salt per user
  role          TEXT    NOT NULL DEFAULT 'admin',  -- 'admin' | 'super_admin'
  failed_attempts  INTEGER NOT NULL DEFAULT 0,
  locked_until     TEXT,                       -- timestamp for lockout
  last_login       TEXT,
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─── Admin Sessions (JWT blacklist + audit log) ───
CREATE TABLE IF NOT EXISTS admin_sessions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  token_id      TEXT    NOT NULL UNIQUE,       -- jti from JWT
  admin_id      INTEGER NOT NULL,
  ip_hash       TEXT,
  user_agent    TEXT,
  revoked       INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  expires_at    TEXT    NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES admin_users(id)
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token  ON admin_sessions(token_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin  ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiry ON admin_sessions(expires_at);

-- ─── Admin Audit Log ───
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id      INTEGER,
  action        TEXT    NOT NULL,              -- 'login' | 'logout' | 'view_leads' | 'update_lead' | 'delete_lead' | etc.
  resource_type TEXT,
  resource_id   INTEGER,
  ip_hash       TEXT,
  details       TEXT,                          -- JSON string
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_admin   ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_action  ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_log(created_at);

-- ─── Bookings / Appointments ─────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  client_name     TEXT    NOT NULL,
  client_email    TEXT    NOT NULL,
  client_phone    TEXT,
  date            TEXT    NOT NULL,
  start_time      TEXT    NOT NULL,
  end_time        TEXT    NOT NULL,
  timezone        TEXT    NOT NULL DEFAULT 'Asia/Kolkata',
  meet_link       TEXT,
  calendar_event_id TEXT,
  status          TEXT    NOT NULL DEFAULT 'confirmed',
  notes           TEXT,
  reminder_sent   INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_appointments_date   ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_email  ON appointments(client_email);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- ─── Consultant Availability ───────────────────
CREATE TABLE IF NOT EXISTS availability (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  day_of_week INTEGER NOT NULL UNIQUE,       -- 0=Sun, 1=Mon ... 6=Sat
  start_time  TEXT    NOT NULL,        -- e.g. '09:30'
  end_time    TEXT    NOT NULL,        -- e.g. '18:00'
  slot_duration INTEGER NOT NULL DEFAULT 30,
  is_active   INTEGER NOT NULL DEFAULT 1
);

-- Default availability schedule: Mon-Fri 09:30-18:00, Sat 10:00-14:00, Sun Closed
INSERT OR IGNORE INTO availability (day_of_week, start_time, end_time, slot_duration, is_active)
VALUES
  (1, '09:30', '18:00', 30, 1),
  (2, '09:30', '18:00', 30, 1),
  (3, '09:30', '18:00', 30, 1),
  (4, '09:30', '18:00', 30, 1),
  (5, '09:30', '18:00', 30, 1),
  (6, '10:00', '14:00', 30, 1),
  (0, '10:00', '14:00', 30, 0);

-- ─── Blocked Dates ────────────────────────────
CREATE TABLE IF NOT EXISTS blocked_dates (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  date    TEXT NOT NULL,
  reason  TEXT,
  UNIQUE(date)
);

-- ─── Google Calendar OAuth Tokens ─────────────
CREATE TABLE IF NOT EXISTS calendar_tokens (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  access_token  TEXT,
  refresh_token TEXT NOT NULL,
  token_expiry  TEXT,
  calendar_id   TEXT,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Rate Limits (D1-backed, durable across Worker isolates) ───
CREATE TABLE IF NOT EXISTS rate_limits (
  key           TEXT PRIMARY KEY,
  count         INTEGER NOT NULL DEFAULT 0,
  window_start  INTEGER NOT NULL,
  locked_until  INTEGER
);

-- ─── Events ───
-- Admin-managed landing pages, each becomes /events/:slug
-- Extended for THE MONEY BLUEPRINT webinar: free toggle, webinar delivery, structured curriculum
CREATE TABLE IF NOT EXISTS events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT    NOT NULL UNIQUE,
  title           TEXT    NOT NULL,
  subtitle        TEXT,
  description     TEXT,
  agenda          TEXT    NOT NULL DEFAULT '[]',
  venue           TEXT,
  event_date      TEXT,
  price           INTEGER NOT NULL DEFAULT 0,
  original_price  INTEGER,
  currency        TEXT    NOT NULL DEFAULT 'INR',
  cover_image     TEXT,
  gallery         TEXT    NOT NULL DEFAULT '[]',
  video_url       TEXT,
  cta_label       TEXT    NOT NULL DEFAULT 'Reserve Your Spot',
  cta_url         TEXT,
  status          TEXT    NOT NULL DEFAULT 'published',
  featured        INTEGER NOT NULL DEFAULT 0,
  max_seats       INTEGER,
  seats_sold      INTEGER NOT NULL DEFAULT 0,
  is_free         INTEGER NOT NULL DEFAULT 0,
  delivery_mode   TEXT    NOT NULL DEFAULT 'online',
  duration_mins   INTEGER,
  language        TEXT    NOT NULL DEFAULT 'English',
  timezone        TEXT    NOT NULL DEFAULT 'Asia/Kolkata',
  curriculum      TEXT    NOT NULL DEFAULT '[]',
  learn_items     TEXT    NOT NULL DEFAULT '[]',
  outcomes        TEXT    NOT NULL DEFAULT '[]',
  for_you         TEXT    NOT NULL DEFAULT '[]',
  not_for_you     TEXT    NOT NULL DEFAULT '[]',
  inside_flow     TEXT    NOT NULL DEFAULT '[]',
  tagline         TEXT,
  value_anchor_price INTEGER,
  instructor_note TEXT,
  meeting_link    TEXT,
  whatsapp_community_link TEXT,
  section_headings TEXT NOT NULL DEFAULT '{}',
  created_by      INTEGER REFERENCES admin_users(id),
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_slug   ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date   ON events(event_date);

CREATE TABLE IF NOT EXISTS event_registrations (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id    INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  phone       TEXT,
  status      TEXT    NOT NULL DEFAULT 'registered',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_event_regs_event ON event_registrations(event_id);

-- ─── Default admin user ───
-- Username: admin | Password: <set via seed script — do NOT hardcode>
-- (password_hash and salt are PBKDF2-SHA256, 100000 iterations)
-- Run `npm run db:seed-admin <password>` to create the admin user with a custom password.
INSERT OR IGNORE INTO admin_users (username, email, password_hash, password_salt, role)
VALUES (
  'admin',
  'admin@firststepcs.com',
  'PLACEHOLDER_RUN_SEED_SCRIPT',
  'PLACEHOLDER_RUN_SEED_SCRIPT',
  'super_admin'
);
