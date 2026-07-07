# WACRM Production Deployment Guide

## Overview

WACRM is a Next.js 16 application that requires:
- A Supabase project (Postgres + Auth + Storage)
- Node.js 20+ runtime
- Meta WhatsApp Business API credentials

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10
- A Supabase project (free tier works)
- A Meta for Developers account with WhatsApp Cloud API app

---

## Step 1: Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. In SQL Editor, run all migrations from `supabase/migrations/` in order (001 to 026)
3. Enable the email/password auth provider in Authentication → Providers
4. Copy the Project URL, anon key, and service-role key from Project Settings → API

### Storage Buckets
Create these public buckets in Storage:
- `avatars` — profile pictures (2 MB limit)
- `flow-media` — flow attachment media (16 MB)
- `chat-media` — chat attachment media (16 MB)

### Auth Settings
- Site URL: `http://localhost:3000` (dev) or `https://yourdomain.com` (prod)
- Redirect URLs: Include your frontend URL

---

## Step 2: Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
META_APP_SECRET=your-meta-app-secret

# Recommended
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## Step 3: WhatsApp Setup

1. Create a Meta App at [developers.facebook.com](https://developers.facebook.com)
2. Add WhatsApp → WhatsApp Cloud API product
3. Create a System User in Business Settings with `whatsapp_business_messaging` + `whatsapp_business_management` permissions
4. Get a Phone Number (test or production)
5. Configure Webhook URL: `https://yourdomain.com/api/whatsapp/webhook`
6. Subscribe to webhook fields: `messages`, `message_template_status_update`, `message_template_quality_update`, `message_template_components_update`

---

## VPS Deployment (Manual)

### 1. Setup Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

### 2. Clone and Build

```bash
git clone https://github.com/your-username/wacrm.git /opt/wacrm
cd /opt/wacrm
cp .env.local.example .env.local
# Edit .env.local with your values
npm ci
npm run build
```

### 3. Process Manager (PM2)

```bash
npm install -g pm2
pm2 start npm --name "wacrm" -- start
pm2 save
pm2 startup
```

### 4. Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. SSL Setup

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Auto-renewal is configured automatically by certbot. Verify with:
```bash
sudo certbot renew --dry-run
```

---

## Docker Deployment

### Dockerfile

Create a `Dockerfile` in the project root:

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

### docker-compose.yml

```yaml
version: '3.8'
services:
  wacrm:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/account"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Run:
```bash
docker-compose up -d
```

---

## Hostinger One-Click Deploy

1. Fork the repo on GitHub
2. In Hostinger hPanel → Websites → Create → Node.js
3. Connect your fork
4. Set env vars in hPanel (SUPABASE_*, ENCRYPTION_KEY, META_APP_SECRET)
5. Push to main. Hostinger auto-builds and deploys.

---

## Backup Strategy

### Database Backups (Supabase)
- Supabase provides daily backups on Pro plan ($25/mo)
- Manual: Use `pg_dump` via Supabase connection string
- Schedule: `0 3 * * * pg_dump "$SUPABASE_CONNECTION_STRING" | gzip > /backups/wacrm-$(date +%Y%m%d).sql.gz`

### Storage Backups
- Supabase storage files are included in database backups
- Additional: Use `rclone` to sync buckets to S3-compatible storage

### Application Backups
- The .env.local file and any custom files
- Version-controlled in git

### Retention Policy
- Daily backups: 7 days
- Weekly backups: 4 weeks
- Monthly backups: 12 months

---

## Monitoring Recommendations

### Application Monitoring
- **Sentry** — error tracking and performance monitoring
- **Logtail** or **Logflare** — Supabase log shipping
- Hostinger hPanel provides live application logs

### Uptime Monitoring
- **Better Stack** (formerly Better Uptime) — free tier
- **Pingdom** — uptime monitoring
- Health check endpoint: `/api/account` (requires no auth)

### Database Monitoring
- Supabase project dashboard has built-in monitoring
- Key metrics: connections, CPU, RAM, disk I/O

### WhatsApp Monitoring
- Meta Business Dashboard shows delivery rates
- Webhook health endpoint (GET /api/whatsapp/webhook with verify_token)
- Alert on webhook failures (your endpoint returns non-200)

### Alert Setup
```bash
# Health check script (cron)
curl -fsS -m 10 --retry 3 \
  -H "Authorization: Bearer your-healthcheck-token" \
  https://hc-ping.com/your-uuid/start
```

### Rate Limit Monitoring
- In-memory rate limiter logs warnings when limits are hit
- For production: swap to Redis-based rate limiting for horizontal scaling

---

## Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service-role key (server-side operations) |
| `ENCRYPTION_KEY` | Yes | 64 hex chars for AES-256-GCM encryption |
| `META_APP_SECRET` | Yes | Meta App Secret for webhook HMAC |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical public URL |
| `WHATSAPP_TEMPLATES_DRY_RUN` | No | Set 'true' for local testing |
| `META_APP_ID` | No | Required for image-header templates |
| `AUTOMATION_CRON_SECRET` | No | Shared secret for automation cron |
| `ALLOWED_INVITE_HOSTS` | No | Comma-separated host allow-list |

---

## Scaling Considerations

- **Single instance**: Works for small teams (in-memory rate limiting)
- **Horizontal scaling**: Swap in-memory rate limiting for Redis/Upstash
- **Database**: Supabase Pro plan autoscales storage
- **CDN**: Static assets cached via Next.js built-in CDN
- **Webhooks**: Idempotent processing allows multiple instances
