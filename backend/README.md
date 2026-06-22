# FirstStep Backend — Cloudflare Worker

Stores lead data, contact submissions, and analytics events from the First Step Consultancy Services website.

## Setup

```bash
cd backend
npm install
```

### Create D1 Database

```bash
npm run db:create
```

Copy the `database_id` from the output into `wrangler.jsonc` (replace `YOUR_D1_DATABASE_ID`).

### Run Migrations

```bash
# Local
npm run db:migrate

# Remote (production)
npm run db:migrate:remote
```

### Dev Server

```bash
npm run dev
```

Worker runs at `http://localhost:8787`.

### Deploy

```bash
npm run deploy
```

## API Endpoints

| Method | Path             | Description                          |
|--------|------------------|--------------------------------------|
| POST   | `/api/leads`     | Store a lead (modals, SIP calculator)|
| POST   | `/api/contacts`  | Store a contact form submission      |
| POST   | `/api/analytics` | Store an analytics event             |
| GET    | `/api/insights`  | Get aggregated analytics dashboard   |
| GET    | `/health`        | Health check                         |

## Request Bodies

### POST /api/leads

```json
{
  "source": "lead_capture_modal",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 98765 43210",
  "monthly_investment": 5000,
  "expected_return": 12,
  "tenure_years": 10,
  "projected_value": 1165000,
  "page_url": "https://firststepcs.com/",
  "referrer": "https://google.com"
}
```

### POST /api/contacts

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+91 98765 43210",
  "investment_range": "5to25",
  "service": "mf",
  "message": "I want to start investing in mutual funds.",
  "page_url": "https://firststepcs.com/contact"
}
```

### POST /api/analytics

```json
{
  "session_id": "uuid-session-string",
  "type": "pageview",
  "page_url": "https://firststepcs.com/",
  "page_path": "/",
  "referrer": "https://google.com"
}
```

For click events:

```json
{
  "session_id": "uuid-session-string",
  "type": "click",
  "page_url": "https://firststepcs.com/",
  "page_path": "/",
  "element_id": "book-cta",
  "element_class": "btn-primary",
  "element_text": "Book Consultation",
  "element_href": "/contact"
}
```

### GET /api/insights?range=7d

Returns aggregated analytics. Supports `range=7d`, `30d`, `90d`.

## Admin Authentication

### Set JWT Secret

```bash
# Local
echo "your-secret-key-here" | wrangler secret put JWT_SECRET

# For dev, add to .dev.vars:
echo "JWT_SECRET=your-secret-key-here" > .dev.vars
```

### Seed Admin User

After running migrations, set the admin password:

```bash
npm run db:seed-admin -- "YourSecurePassword@123"
```

This outputs a SQL UPDATE statement. Run it against your D1 database:

```bash
# Local
npm run db:query "UPDATE admin_users SET password_hash='...', password_salt='...' WHERE username='admin'"

# Remote
npm run db:query:remote "UPDATE admin_users SET password_hash='...', password_salt='...' WHERE username='admin'"
```

Default credentials (if not seeded):
- Username: `admin`
- Email: `admin@firststepcs.com`

### Admin API Endpoints

| Method | Path                  | Auth | Description                    |
|--------|-----------------------|------|--------------------------------|
| POST   | `/api/admin/login`    | No   | Login, returns JWT token       |
| POST   | `/api/admin/logout`   | Yes  | Revoke current session         |
| GET    | `/api/admin/verify`   | Yes  | Verify token is valid          |
| GET    | `/api/admin/leads`    | Yes  | List leads (paginated)         |
| PUT    | `/api/admin/leads?id` | Yes  | Update lead status/notes       |
| DELETE | `/api/admin/leads?id` | Yes  | Delete a lead                  |
| GET    | `/api/admin/contacts` | Yes  | List contacts (paginated)      |
| PUT    | `/api/admin/contacts?id` | Yes | Update contact status/notes   |
| DELETE | `/api/admin/contacts?id` | Yes | Delete a contact              |
| GET    | `/api/admin/audit`    | Yes  | View audit log                 |

### Security Features

- **PBKDF2-SHA256** password hashing (100,000 iterations + per-user salt)
- **JWT tokens** with HMAC-SHA256 signing (24h expiry)
- **Session tracking** — every login creates a DB session record
- **Token revocation** — logout revokes the JWT in the database
- **Rate limiting** — 5 failed login attempts locks the account for 15 minutes
- **Audit logging** — all admin actions (login, view, update, delete) are logged
- **IP hashing** — visitor IPs are SHA-256 hashed (never stored raw)
- **Constant-time comparison** — password verification resistant to timing attacks

## Configuration

Update `ALLOWED_ORIGINS` in `wrangler.jsonc` to include your production domain.
