# Client Onboarding Guide — WhatsApp Business API (WABA)

## Prerequisites

Before onboarding a client, ensure they have:

- A **Facebook Business Manager** account
- A **WhatsApp Business Account (WABA)** linked to that Business Manager
- A **phone number** (not registered with WhatsApp Messenger or WhatsApp Business app)
- A **payment method** added in Meta Business Manager

---

## Step 1: Create Meta Business Manager

1. Go to https://business.facebook.com/overview
2. Click **Create Account**
3. Enter business name, name, email
4. Add the client as a **Business Admin**

---

## Step 2: Set up WhatsApp Business Account

1. Open the [WhatsApp Account Settings](https://business.facebook.com/latest/settings/whatsapp_account/?business_id=1424318811954158&selected_asset_id=2127143364812812&selected_asset_type=whatsapp-business-account)
2. Click **Add WhatsApp Business Account**
3. Enter the business name
4. Select the business category

---

## Step 3: Register a Phone Number

1. Inside the WABA, go to **Phone Numbers**
2. Click **Add Phone Number**
3. Enter the phone number (must not be registered with WhatsApp Messenger)
4. Verify via SMS or voice call
5. Set up the Business Profile (display name, description, email, website)

---

## Step 4: Configure Payment Method

1. Go to **Business Settings** → **Billing** → **Payment Methods**
2. Add a credit/debit card
3. WhatsApp charges are deducted per conversation (~₹0.40–₹1.50/conversation depending on region)

---

## Step 5: Share Credentials with Vbuild CRM

The client needs to provide:

| Credential | Where to find it |
|------------|-----------------|
| **Business Account ID** | WhatsApp Manager → Account → Account ID |
| **Phone Number ID** | WhatsApp Manager → Phone Numbers → Phone Number ID |
| **Permanent Access Token** | Facebook Business → System Users → Generate token with `whatsapp_business_messaging` and `whatsapp_business_management` permissions |
| **Meta App ID** | Meta for Developers → Apps → Your App → App ID |
| **Meta App Secret** | Meta for Developers → Apps → Your App → App Secret |

### How to generate a Permanent Access Token:

1. Go to **Facebook Business Manager** → **Users** → **System Users**
2. Click **Add** → Name it (e.g., "Vbuild CRM Integration")
3. Assign the **Admin** role
4. Click **Generate New Token**
5. Select the WhatsApp app
6. Add permissions: `whats_business_messaging`, `whatsapp_business_management`, `business_management`
7. Copy the generated token

---

## Step 6: Client Configures WhatsApp in Vbuild CRM

1. Client logs into Vbuild CRM
2. Goes to **Settings** → **WhatsApp Configuration**
3. Pastes the credentials:
   - Permanent Access Token
   - Phone Number ID
   - Business Account ID
   - Meta App ID
   - Meta App Secret
4. Clicks **Save**
5. The system verifies the credentials and the connection status shows **Connected**

---

## Step 7: Test the Connection

1. Send a test message from Vbuild CRM
2. Check the inbox for the reply
3. Verify message status shows **Sent** / **Delivered** / **Read**

---

## Pricing Summary

| Item | Cost | Paid by |
|------|------|---------|
| Vbuild CRM subscription | ₹999–₹3,999/month | Client |
| WhatsApp conversation charges | ₹0.40–₹1.50/conversation | Client (via Meta) |
| Phone number verification | Free | — |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Token expires | Use a **Permanent** (not temporary) token with no expiry |
| Number already registered | The number must NOT be on WhatsApp Messenger. Use a fresh number |
| Message not sending | Check WABA is approved (status should be **Connected**) |
| Payment needed | Add a payment method in Meta Business Manager billing settings |
