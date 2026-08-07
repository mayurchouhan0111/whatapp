const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = "https://vbuild-automation.netlify.app";
const EMAIL = "mayurchouhan0111@gmail.com";
const PASSWORD = "VbuildPass2026!";

const OUTPUT_DIR = path.join(__dirname, "crm_screenshots");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function captureCompleteWebsiteFlow() {
  console.log("🚀 Starting Full Website & CRM Screenshot Capture Flow...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // STAGE 1: PUBLIC LANDING & AUTH PAGES
    // -------------------------------------------------------------
    
    // 1. Homepage / Main Landing Page
    console.log("1. Capturing Main Landing Page...");
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "01_landing_page.png"), fullPage: true });

    // 2. Subscription / Pricing Page
    console.log("2. Capturing Subscription & Pricing Page...");
    await page.goto(`${BASE_URL}/subscribe`, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "02_subscribe_pricing.png"), fullPage: true });

    // 3. Privacy Policy
    console.log("3. Capturing Privacy Policy Page...");
    await page.goto(`${BASE_URL}/privacy-policy`, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "03_privacy_policy.png"), fullPage: true });

    // 4. Signup Page
    console.log("4. Capturing Sign Up Page...");
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "04_signup_page.png"), fullPage: true });

    // 5. Forgot Password Page
    console.log("5. Capturing Forgot Password Page...");
    await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "05_forgot_password.png"), fullPage: true });

    // 6. Login Page
    console.log("6. Capturing Login Page...");
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "06_login_page.png"), fullPage: true });

    // -------------------------------------------------------------
    // STAGE 2: LOGIN AUTHENTICATION
    // -------------------------------------------------------------
    console.log("🔑 Authenticating into CRM...");
    await page.fill('#email', EMAIL);
    await page.fill('#password', PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard', { timeout: 15000 }).catch(() => console.log("Navigation timeout, proceeding..."));
    await page.waitForTimeout(3000);

    // -------------------------------------------------------------
    // STAGE 3: LOGGED-IN CRM APP PAGES
    // -------------------------------------------------------------

    // 7. Dashboard Overview
    console.log("7. Capturing Dashboard Overview...");
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "07_dashboard.png"), fullPage: true });

    // 8. Team Inbox
    console.log("8. Capturing Shared Team Inbox...");
    await page.goto(`${BASE_URL}/inbox`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "08_inbox.png"), fullPage: true });

    // 9. Contacts Management
    console.log("9. Capturing Contacts...");
    await page.goto(`${BASE_URL}/contacts`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "09_contacts.png"), fullPage: true });

    // 10. Kanban Sales Pipelines
    console.log("10. Capturing Sales Pipelines...");
    await page.goto(`${BASE_URL}/pipelines`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "10_sales_pipelines.png"), fullPage: true });

    // 11. Broadcast Campaigns
    console.log("11. Capturing Broadcasts...");
    await page.goto(`${BASE_URL}/broadcasts`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "11_broadcasts.png"), fullPage: true });

    // 12. Automations Engine
    console.log("12. Capturing Automations Engine...");
    await page.goto(`${BASE_URL}/automations`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "12_automations.png"), fullPage: true });

    // 13. Visual Flow Builder
    console.log("13. Capturing Visual Flow Builder...");
    await page.goto(`${BASE_URL}/flows`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "13_visual_flows.png"), fullPage: true });

    // 14. Reputation & Reviews
    console.log("14. Capturing Reputation Management...");
    await page.goto(`${BASE_URL}/reputation`, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "14_reputation_reviews.png"), fullPage: true });

    // 15. Settings & API Keys
    console.log("15. Capturing Settings & Config...");
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "15_settings.png"), fullPage: true });

    console.log(`\n🎉 SUCCESS! All 15 website & CRM screenshots captured and saved in: ${OUTPUT_DIR}`);
  } catch (err) {
    console.error("❌ Error during screenshot capture flow:", err);
  } finally {
    await browser.close();
  }
}

captureCompleteWebsiteFlow();
