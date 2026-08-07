#!/usr/bin/env python3
"""Vbuild CRM Lead Processing — scores, deduplicates, generates outreach"""

import json, os, sys
from datetime import date
from pathlib import Path

CONFIG_PATH = Path(__file__).parent / "sdr_config.json"
LEADS_DIR = Path(__file__).parent / "leads"
LEADS_FILE = LEADS_DIR / "vbuild_leads.json"
REPORT_FILE = LEADS_DIR / "daily_report.md"

with open(CONFIG_PATH) as f:
    config = json.load(f)

LEADS_FILE.parent.mkdir(exist_ok=True)

def load_leads():
    if LEADS_FILE.exists():
        with open(LEADS_FILE) as f:
            return json.load(f)
    return []

def save_leads(leads):
    with open(LEADS_FILE, "w", encoding="utf-8") as f:
        json.dump(leads, f, indent=2, default=str, ensure_ascii=False)

def calculate_score(lead):
    score = 5
    domain = lead.get("domain", "").lower()
    notes = (lead.get("notes", "") + " " + lead.get("pain_points", "")).lower()

    if any(w in notes for w in ["whatsapp crm", "crm for", "crm software", "need a crm", "looking for crm"]):
        score += 3
    if any(w in notes for w in ["automation", "chatbot", "support", "customer service"]):
        score += 2
    if ".in" in domain:
        score += 1
    if lead.get("icp_score", 0) > 0:
        score += lead["icp_score"]
    if lead.get("intent_score", 0) > 0:
        return lead["intent_score"]
    return min(score, 10)

def add_leads(new_leads):
    existing = load_leads()
    existing_domains = {l.get("domain", "") for l in existing if "domain" in l}
    existing_names = {l.get("company", "").lower() for l in existing if "company" in l}
    added = 0
    for lead in new_leads:
        name = lead.get("company", lead.get("company_name", "")).lower()
        domain = lead.get("domain", "")
        if domain and domain in existing_domains:
            continue
        if name and name in existing_names:
            continue
        if "intent_score" not in lead:
            lead["intent_score"] = calculate_score(lead)
        if "found_date" not in lead:
            lead["found_date"] = str(date.today())
        if "status" not in lead:
            lead["status"] = "new"
        if "outreach_status" not in lead:
            lead["outreach_status"] = "pending"
        existing.append(lead)
        existing_domains.add(domain)
        existing_names.add(name)
        added += 1
    save_leads(existing)
    return added, len(existing)

def generate_outreach(lead):
    company = lead.get("company", lead.get("company_name", "there"))
    kw = lead.get("keyword_found", lead.get("search_keyword", "WhatsApp CRM"))
    return f"""Subject: Quick question about your WhatsApp setup

Hi {company} Team,

I noticed you're exploring {kw}. We built Vbuild CRM — a self-hostable WhatsApp CRM that brings your inbox, sales pipelines, broadcast campaigns, automations, and e-commerce storefront into one platform.

Unlike tools like Zoho or HubSpot, we're built for WhatsApp-first businesses. Self-hosted means you own your data completely.

Free tier: Rs.0 (1 user, 500 contacts). No credit card needed.

Would you be open to a quick 5-min call this week?

Best,
Vbuild CRM
vbuildcrm.com"""

def generate_linkedin_message(lead):
    company = lead.get("company", lead.get("company_name", "there"))
    kw = lead.get("keyword_found", lead.get("search_keyword", "solutions"))
    return f"""Hi {{first_name}},

I saw {company} is exploring {kw}. We built Vbuild CRM — a self-hostable WhatsApp CRM with inbox, pipelines, broadcasts, and automation.

WhatsApp-native, self-hosted, and free to start. Would you be open to seeing how it works?

Best,
Vbuild CRM"""

def generate_daily_report(all_leads, new_count=0):
    today = date.today()
    top = sorted(all_leads, key=lambda l: l.get("intent_score", 0) or 0, reverse=True)[:50]

    md = f"# Vbuild SDR Daily Report — {today}\n\n"
    md += f"**Total Leads in CRM:** {len(all_leads)}\n"
    md += f"**New Today:** {new_count}\n"
    md += f"**Pending Outreach:** {sum(1 for l in all_leads if l.get('outreach_status') == 'pending')}\n\n"
    md += "## Top 50 Prospects\n\n"
    md += "| # | Company | Domain | Intent Score | Keyword Found | Status |\n"
    md += "|---|---------|--------|-------------|--------------|--------|\n"
    for i, l in enumerate(top, 1):
        md += f"| {i} | {l.get('company', l.get('company_name', '?'))} | {l.get('domain', '?')} | {l.get('intent_score', 0)}/10 | {l.get('keyword_found', l.get('search_keyword', '?'))} | {l.get('status', 'new')} |\n"

    md += "\n## Recommended Outreach (Top 10)\n\n"
    for l in top[:10]:
        company = l.get('company', l.get('company_name', '?'))
        domain = l.get('domain', '?')
        md += f"### {company} ({domain})\n"
        md += f"**Score:** {l.get('intent_score', 0)}/10\n\n"
        md += f"**Email:**\n```\n{generate_outreach(l)}\n```\n\n"
        md += f"**LinkedIn:**\n```\n{generate_linkedin_message(l)}\n```\n\n---\n\n"

    return md

def process_manual_leads():
    """Process leads from stdin (JSON array of lead objects)."""
    raw = sys.stdin.read()
    new_leads = json.loads(raw)
    added, total = add_leads(new_leads)
    all_leads = load_leads()
    report = generate_daily_report(all_leads, added)
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        f.write(report)
    print(json.dumps({
        "added": added,
        "total": total,
        "report_file": str(REPORT_FILE),
        "pending_outreach": sum(1 for l in all_leads if l.get("outreach_status") == "pending"),
        "message": f"Added {added} leads. Total: {total}. Report: {REPORT_FILE}"
    }))

def show_dashboard():
    all_leads = load_leads()
    report = generate_daily_report(all_leads)
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        f.write(report)
    print(report)

if __name__ == "__main__":
    if not sys.stdin.isatty():
        process_manual_leads()
    else:
        show_dashboard()
