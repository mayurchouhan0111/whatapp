# Vbuild CRM Lead Generation Pipeline

## Overview
Automated daily SDR pipeline that finds businesses needing WhatsApp CRM, CRM software, AI/sales automation, and chatbot development.

## Architecture

```
Google/DuckDuckGo/Reddit/LinkedIn
        │
        ▼
  Hermes Agent (daily 9am cron)
  ── Searches keywords
  ── Extracts contacts
  ── Scores leads (1-10)
  ── Adds to sdr-crm.json
        │
        ▼
  vbuild_sdr.py (daily 10am cron, no-agent mode)
  ── Processes leads
  ── Deduplicates
  ── Generates outreach
  ── Produces daily report
        │
        ▼
  Hermes Agent (daily 11am cron)
  ── Reviews top 50 prospects
  ── Sends report to Telegram
  ── Sends outreach emails
```

## Files

| File | Purpose |
|------|---------|
| `vbuild_sdr.py` | Lead processor: scores, deduplicates, generates outreach, produces reports |
| `sdr_config.json` | Configuration: keywords, scoring weights, pricing, templates |
| `outreach_templates.md` | Email, LinkedIn, SMS templates |
| `run_daily.bat` | Manual run script |
| `leads/vbuild_leads.json` | Lead database (all collected leads) |
| `leads/daily_report.md` | Latest daily report (top 50 prospects) |
| `leads/outreach_log.json` | Sent outreach log |

## Cron Jobs (set up via Hermes)

1. **Vbuild lead discovery** — Mon-Fri 9am
   - Hermes agent searches for leads using web_search tool
   - Extracts contact info, scores, saves to CRM

2. **Vbuild daily report** — Mon-Fri 11am  
   - Reads lead database, generates report of top 50 prospects
   - Sends summary to Telegram @Gen_lead_daily_bot

## Manual Run
```powershell
cd D:\UnHuman\Automation\automate-whatapp\vbuild-sdr-agent
python vbuild_sdr.py
```

## Adding Leads Manually
Pipe JSON to the processor:
```powershell
echo '[{"company":"Example Corp","domain":"example.com","intent_score":8,"notes":"looking for whatsapp crm"}]' | python vbuild_sdr.py
```

## Keywords Searched
whatsapp crm for business, best whatsapp crm india, whatsapp business api crm, whatsapp automation tool, crm software for small business, customer support automation tool, sales automation software, chatbot for whatsapp business, whatsapp marketing platform, crm for whatsapp api, whatsapp broadcast tool, business process automation software, ai automation for business, whatsapp order management system, crm for service business

## Scoring
- 8-10: Actively searching for WhatsApp CRM, posted "need CRM", asking for recommendations
- 4-7: Growing business, hiring CRM roles, complaining about WhatsApp chaos  
- 1-3: Generic business, no clear need expressed
