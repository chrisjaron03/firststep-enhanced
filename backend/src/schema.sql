-- FirstStep Consultancy Services — D1 Schema
-- Tables: leads, contacts, analytics_events, analytics_sessions

-- ─── Leads ───
-- Captured from: Lead Capture Modal, Exit Intent Modal, SIP Calculator
CREATE TABLE IF NOT EXISTS leads (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  source        TEXT    NOT NULL,          -- 'lead_capture_modal' | 'exit_intent_modal' | 'sip_calculator'
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL,
  phone         TEXT    NOT NULL,
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

-- ─── Default admin user ───
-- Username: admin | Password: ChangeMe@2026
-- (password_hash and salt are PBKDF2-SHA256, 100000 iterations)
-- Run `npm run db:seed-admin` to create the admin user with a custom password.
INSERT OR IGNORE INTO admin_users (username, email, password_hash, password_salt, role)
VALUES (
  'admin',
  'admin@firststepcs.com',
  'PLACEHOLDER_RUN_SEED_SCRIPT',
  'PLACEHOLDER_RUN_SEED_SCRIPT',
  'super_admin'
);
