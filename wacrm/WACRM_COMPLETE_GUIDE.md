# WACRM Complete Setup & Operation Guide

## Overview

This document covers the complete setup, WhatsApp integration, and operation of WACRM (WhatsApp CRM) based on the repository at `https://github.com/ArnasDon/wacrm`.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Variables](#environment-variables)
4. [Supabase Setup](#supabase-setup)
5. [WhatsApp Business API Integration](#whatsapp-business-api-integration)
6. [Running the Application](#running-the-application)
7. [Creating Your Account](#creating-your-account)
8. [Inviting Team Members](#inviting-team-members)
9. [Module Overview](#module-overview)
10. [Production Deployment](#production-deployment)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10
- **Supabase project** (free tier at supabase.com)
- **Meta for Developers account** with WhatsApp Cloud API app
- **Domain with SSL** (required for WhatsApp webhook)

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/ArnasDon/wacrm.git
cd wacrm

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.local.example .env.local

# 4. Fill in .env.local with your credentials (see below)

# 5. Start development server
npm run dev
```

Open **http://localhost:3000** → you'll be redirected to `/login` or `/signup`.

---

## Environment Variables

Create a `.env.local` file in the project root with these values:

```bash
# ============================================================
# REQUIRED — the app won't start without these.
# ============================================================

# Supabase (Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase service-role key (server-side only, bypasses RLS)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# WhatsApp token encryption (64 hex chars = 32 bytes, AES-256-GCM)
# Generate with: node -node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your-64-char-hex-key-here

# Meta App Secret (Meta for Developers → App Settings → Basic)
# Verifies HMAC-SHA256 signature on every inbound webhook POST
META_APP_SECRET=your-meta-app-secret

# ============================================================
# RECOMMENDED — safe defaults exist but you'll want to set these.
# ============================================================

# Canonical public URL of this deployment (scheme + host, no trailing slash)
NEXT_PUBLIC_SITE_URL=https://crm.example.com

# ============================================================
# OPTIONAL — only needed if you use the feature.
# ============================================================

# Allow-list for invite link hostnames (comma-separated, no scheme/port)
# ALLOWED_INVITE_HOSTS=crm.example.com,crm-staging.example.com

# Shared secret protecting GET /api/automations/cron
# Required if you use Wait steps in automations
# Generate with: openssl rand -hex 32
# AUTOMATION_CRON_SECRET=generate-a-long-random-string

# Meta App ID (needed for image-header templates)
# META_APP_ID=your-meta-app-id

# WhatsApp templates dry run mode (true/false)
# Skip Meta API calls during template submission
WHATSAPP_TEMPLATES_DRY_RUN=true
```

---

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose organization, name your project, set database password
3. Wait for provisioning (~2 minutes)

### 2. Run Database Migrations

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and run each migration file from `supabase/migrations/` in order (001 → 026)
3. Each migration is idempotent (safe to re-run)

**Option B: Via Supabase CLI (requires Docker)**
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### 3. Configure Auth

1. **Authentication → Providers** → Enable **Email** provider
2. **Authentication → Settings** → Set:
   - **Site URL**: `http://localhost:3000` (dev) or your production domain
   - **Redirect URLs**: Add `http://localhost:3000/**` and your production domain

### 4. Create Storage Buckets

In **Storage** create these **public** buckets:
- `avatars` — 2 MB limit, images only
- `flow-media` — 16 MB limit, images/video/documents
- `chat-media` — 16 MB limit, images/video/documents/audio

### 5. Get API Keys

**Project Settings → API**:
- `NEXT_PUBLIC_SUPABASE_URL` — Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — `anon` public key
- `SUPABASE_SERVICE_ROLE_KEY` — `service_role` secret key (keep secure!)

---

## WhatsApp Business API Integration

### How It Works

WACRM uses **Meta WhatsApp Cloud API** (the official WhatsApp Business API). The integration flow:

```
┌─────────────────┐     Webhook (HTTPS)      ┌──────────────────┐
│  WhatsApp User  │ ──────────────────────▶  │  Your WACRM App  │
│  (Customer)     │                          │  /api/whatsapp/  │
└─────────────────┘                          │     webhook      │
        ▲                                    └────────┬─────────┘
        │                                             │
        │  Messages sent via Meta API                 │  Messages sent
        │  (Cloud API)                                │  via your app
        └─────────────────────────────────────────────┘
```

### Required Meta Setup

#### 1. Create Meta App

1. Go to [developers.facebook.com](https://developers.facebook.com) → **Create App**
2. Choose **Business** → Enter app name
3. In **Products**, add **WhatsApp** → **WhatsApp Cloud API**

#### 2. Get Credentials

From **App Settings → Basic**:
- **App ID** → `META_APP_ID` (needed for image-header templates)
- **App Secret** → `META_APP_SECRET` (required for webhook verification)

#### 3. Configure System User & Access Token

1. **Business Settings → System Users** → Create **System User**
2. Assign **Admin** role
3. **Generate Token** with scopes:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
4. Copy the **Long-lived token** (never expires)

#### 4. Get Phone Number & WABA

1. In WhatsApp product → **Configuration** → **Phone Numbers**
2. Add a phone number (test or production)
3. Note:
   - **Phone Number ID** → used in config
   - **WhatsApp Business Account ID (WABA ID)**

#### 5. Set Up Webhook

1. **WhatsApp → Configuration → Webhooks** → Edit
2. **Callback URL**: `https://yourdomain.com/api/whatsapp/webhook`
3. **Verify Token**: Create a random string (save it — you'll enter it in WACRM)
4. **Subscribe to fields**:
   - `messages`
   - `message_template_status_update`
   - `message_template_quality_update`
   - `message_template_components_update`
5. Click **Verify and Save**

#### 6. Subscribe App to WABA

1. **WhatsApp → Configuration → Subscribe to Webhooks**
2. Or use the API: `POST /{waba_id}/subscribed_apps`

---

### Connecting WhatsApp in WACRM

1. **Start the app**: `npm run dev`
2. **Sign up / Log in** → Go to **Settings → WhatsApp**
3. **Fill in the form**:
   - **Access Token** — The System User long-lived token
   - **Phone Number ID** — From Meta WhatsApp config
   - **Verify Token** — The webhook verify token you set in Meta
   - **6-digit PIN** — From Meta WhatsApp Manager → Two-step verification (required for production numbers; optional for test numbers)
4. **Click Save** — WACRM will:
   - Validate the token with Meta
   - Register the phone number (`POST /{phone_number_id}/register`)
   - Subscribe the WABA to your app
   - Encrypt and store credentials

### How Messages Flow

| Direction | Flow |
|-----------|------|
| **Outbound** (you → customer) | WACRM → Meta Cloud API (`/messages`) → WhatsApp user |
| **Inbound** (customer → you) | WhatsApp user → Meta → Webhook (`/api/whatsapp/webhook`) → WACRM database → Inbox UI (real-time) |
| **Templates** | Create in Settings → Submit to Meta → Wait for APPROVED → Use in broadcasts/inbox |

### Template Management

1. **Settings → Templates** → **New Template**
2. Fill: Name, Category, Language, Header (text/image/video/document), Body, Footer, Buttons
3. **Submit** → Meta reviews (usually minutes to hours)
4. Status updates come via webhook automatically
5. Use in **Inbox** composer or **Broadcasts**

### Media Handling

- **Inbound media**: Received via webhook → WACRM stores proxied URL (`/api/whatsapp/media/{mediaId}`) → fetches from Meta CDN on demand
- **Outbound media**: Upload to Supabase Storage (`chat-media` bucket) → send public URL via Meta API
- **Template image headers**: Must upload via Resumable Upload API to get `header_handle`

---

## Running the Application

### Development

```bash
npm run dev
```
- Frontend: http://localhost:3000
- Hot reload enabled
- TypeScript type-checking on save

### Production Build

```bash
npm run build
npm start
```

### Docker (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/next.config.ts ./
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t wacrm .
docker run -p 3000:3000 --env-file .env.local wacrm
```

---

## Creating Your Account

### Option 1: Self-Registration (Solo Use)

1. Open `http://localhost:3000/signup`
2. Enter email, password (≥6 chars), full name
3. **You become the Owner** of a new personal account
4. No additional setup needed — start using all modules

### Option 2: Join Existing Team (Invitation)

1. Team admin sends you an invite link: `https://yourdomain.com/join/<token>`
2. Click the link → if logged in, redirects to join page; if not, logs in first
3. Accept invitation → you're added to their account with the assigned role

---

## Inviting Team Members

1. Go to **Settings → Members**
2. Click **Invite Member**
3. Enter email, choose role:
   - **Owner** — full control, can delete account, transfer ownership
   - **Admin** — manage members, edit settings, API keys
   - **Agent** — send messages, create contacts, run broadcasts, edit automations
   - **Viewer** — read-only access
4. Send — they get email with invite link (expires in 7 days by default)

### Roles & Permissions

| Capability | Owner | Admin | Agent | Viewer |
|------------|-------|-------|-------|--------|
| Send WhatsApp messages | ✅ | ✅ | ✅ | ❌ |
| Create/edit contacts | ✅ | ✅ | ✅ | ❌ |
| Run broadcasts | ✅ | ✅ | ✅ | ❌ |
| Create/edit automations | ✅ | ✅ | ✅ | ❌ |
| Manage team members | ✅ | ✅ | ❌ | ❌ |
| Edit account settings | ✅ | ✅ | ❌ | ❌ |
| Manage WhatsApp config | ✅ | ✅ | ❌ | ❌ |
| Manage templates | ✅ | ✅ | ❌ | ❌ |
| Create API keys | ✅ | ✅ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ |
| Delete account | ✅ | ❌ | ❌ | ❌ |

---

## Module Overview

| Module | Route | Purpose |
|--------|-------|---------|
| **Dashboard** | `/dashboard` | Live analytics: active conversations, new contacts, open deals value, messages sent, response times, activity feed |
| **Inbox** | `/inbox` | Shared team inbox: real-time conversations, message threading, templates, reactions, quotes, contact sidebar |
| **Contacts** | `/contacts` | Contact management: search, tags, custom fields, CSV import, deduplication, notes |
| **Pipelines** | `/pipelines` | Kanban sales pipelines: drag-and-drop deals, multiple pipelines, stage analytics |
| **Broadcasts** | `/broadcasts` | Bulk WhatsApp campaigns: 4-step wizard (template → audience → personalize → schedule/send), delivery tracking |
| **Automations** | `/automations` | No-code workflows: triggers (new message, keyword, contact, schedule), conditional branches, waits, actions |
| **Flows** | `/flows` | Visual chatbot builder: keyword/first-message triggers, branching nodes, run history |
| **Settings** | `/settings` | Account, profile, security, appearance, WhatsApp config, templates, tags, fields, deals, members, API keys |

---

## Production Deployment

### Recommended: Hostinger Managed Node.js

1. Fork repo on GitHub
2. **hPanel → Websites → Create** → **Node.js** → Connect fork
3. Paste env vars in hPanel (SUPABASE_*, ENCRYPTION_KEY, META_APP_SECRET)
4. Push to `main` → Hostinger builds & deploys automatically

### Manual VPS (Nginx + PM2)

```bash
# 1. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git

# 2. Clone & build
git clone https://github.com/your-username/wacrm.git /opt/wacrm
cd /opt/wacrm
cp .env.local.example .env.local
# Edit .env.local with production values
npm ci
npm run build

# 3. Process manager
npm install -g pm2
pm2 start npm --name "wacrm" -- start
pm2 save
pm2 startup

# 4. Nginx reverse proxy
# (see deployment-guide.md for full config)

# 5. SSL with Let's Encrypt
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Backup Strategy

| What | How | Frequency |
|------|-----|-----------|
| **Database** | Supabase daily backups (Pro plan) or `pg_dump` | Daily |
| **Storage** | `rclone` sync buckets to S3 | Daily |
| **App config** | Version-controlled in Git | Continuous |
| **Retention** | Daily 7d, Weekly 4w, Monthly 12m | — |

### Monitoring

- **App logs**: Hostinger hPanel / `pm2 logs`
- **Uptime**: Better Stack / Pingdom (health check: `GET /api/account`)
- **Supabase**: Built-in dashboard (connections, CPU, disk)
- **WhatsApp**: Meta Business Dashboard (delivery rates, webhook health)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Build fails** | Run `npm run typecheck` and `npm run lint` to see errors |
| **Supabase connection fails** | Verify URL and keys in `.env.local`; check Supabase project is active |
| **Auth redirect loop** | Check `NEXT_PUBLIC_SITE_URL` matches your domain; verify Supabase Auth redirect URLs |
| **Webhook not receiving messages** | Verify Meta webhook URL is HTTPS, verify token matches, check `META_APP_SECRET` is set |
| **WhatsApp config shows "Disconnected"** | Check access token validity; re-save config; check registration PIN for production numbers |
| **Templates stuck in "Pending"** | Normal — Meta review takes minutes to 24h; check webhook is receiving status updates |
| **Real-time not working** | Ensure Supabase Realtime is enabled for `messages` and `conversations` tables |
| **Rate limit errors** | Default is in-memory; for multi-instance deploy, swap to Redis in `src/lib/rate-limit.ts` |

---

## Security Checklist

- [ ] `ENCRYPTION_KEY` is 64 random hex chars (AES-256-GCM)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` never exposed to client
- [ ] `META_APP_SECRET` set (webhook HMAC verification)
- [ ] `NEXT_PUBLIC_SITE_URL` set to your canonical domain
- [ ] SSL/TLS enabled (required for WhatsApp webhook)
- [ ] CSP in `next.config.ts` is in `Report-Only` — switch to enforced after testing
- [ ] Rate limiting works (test with rapid requests)
- [ ] API keys created with minimal scopes
- [ ] Team members have correct roles

---

## API Reference

### Public API (`/api/v1`)

Authentication: `Authorization: Bearer wacrm_live_<key>`

| Endpoint | Method | Scopes Required | Description |
|----------|--------|-----------------|-------------|
| `/api/v1/me` | GET | (any) | Probe — returns account info |
| `/api/v1/messages` | POST | `messages:send` | Send message |
| `/api/v1/contacts` | GET/POST | `contacts:read` / `contacts:write` | List/create contacts |
| `/api/v1/broadcasts` | POST | `broadcasts:send` | Launch broadcast |

Keys created in **Settings → API Keys** (Admin/Owner only).

---

## File Structure Reference

```
wacrm/
├── .env.local                 # Environment variables (not committed)
├── .env.local.example         # Template
├── package.json               # Dependencies & scripts
├── next.config.ts             # Next.js config + security headers
├── tsconfig.json              # TypeScript config
├── supabase/
│   └── migrations/            # 26 SQL migrations (001-026)
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login, signup, forgot-password
│   │   ├── (dashboard)/       # All dashboard modules
│   │   │   ├── dashboard/     # Analytics
│   │   │   ├── inbox/         # Shared inbox
│   │   │   ├── contacts/      # Contact management
│   │   │   ├── pipelines/     # Kanban pipelines
│   │   │   ├── broadcasts/    # Campaigns
│   │   │   ├── automations/   # Workflow builder
│   │   │   ├── flows/         # Chatbot builder
│   │   │   └── settings/      # All settings panels
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── lib/                   # Business logic
│   │   ├── auth/              # Auth helpers, RBAC
│   │   ├── whatsapp/          # WhatsApp integration (25 files)
│   │   ├── automations/       # Automation engine
│   │   ├── api-keys/          # Public API key management
│   │   └── supabase/          # Supabase clients
│   ├── middleware.ts          # Auth middleware
│   └── types/                 # TypeScript types
└── docs/
    ├── deployment-guide.md    # This file's extended version
    └── public-api.md          # API documentation
```

---

## Complete — Next Steps

You now have everything needed to run WACRM. The remaining operational tasks:

1. **Add WhatsApp credentials** in Settings → WhatsApp
2. **Create message templates** and submit for Meta approval
3. **Import contacts** (CSV or manual)
4. **Build your first pipeline** in Pipelines
5. **Create an automation** (e.g., welcome message on first inbound)
6. **Invite teammates** in Settings → Members

For questions or issues:
- GitHub Issues: https://github.com/ArnasDon/wacrm/issues
- Documentation: https://wacrm.tech/docs
- Security: .github/SECURITY.md