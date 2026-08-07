const crypto = require('crypto');
const https = require('https');

const SUPABASE_URL = "https://wmpwxsdemzkbzylswwht.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtcHd4c2RlbXprYnp5bHN3d2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcyMTAxNSwiZXhwIjoyMDk4Mjk3MDE1fQ.dNQyj6vFvzwa_-9knw_vDTF7jeEiSks-H1xohptTyps";
const ENCRYPTION_KEY = "b63704dfd4b11e289d7e5c81e375b92e61913734eed2683034b73260d9f9188b";

const TARGET_PHONE = "916263850508";

function decrypt(encryptedText) {
  const parts = encryptedText.split(':');
  if (parts.length === 3) {
    const [ivHex, ctHex, tagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(ctHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  if (parts.length === 2) {
    const [ivHex, ctHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );
    let decrypted = decipher.update(ctHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  throw new Error('Invalid format');
}

async function fetchConfig() {
  return new Promise((resolve, reject) => {
    const req = https.get(
      `${SUPABASE_URL}/rest/v1/whatsapp_config?select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const rows = JSON.parse(body);
            resolve(rows[0] || null);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
  });
}

async function sendWhatsApp(phoneNumberId, accessToken, toPhone, textMessage) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toPhone,
      type: 'text',
      text: { body: textMessage },
    });

    const req = https.request(
      `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log(`Fetching WhatsApp credentials from Supabase for target: +${TARGET_PHONE}...`);
  const config = await fetchConfig();
  if (!config) {
    console.error('❌ No whatsapp_config found in database!');
    return;
  }

  const phoneNumberId = config.phone_number_id;
  const accessToken = decrypt(config.access_token);

  if (!accessToken) {
    console.error('❌ Failed to decrypt access token!');
    return;
  }

  console.log(`Phone Number ID: ${phoneNumberId}`);
  console.log('Sending live test message to WhatsApp via Meta API...');

  const testMessage =
    `Hi Test User! 👋\n\n` +
    `🚀 This is a live test message from your Vbuild CRM WhatsApp Engine!\n\n` +
    `Your WhatsApp API connection and automated agent are 100% active and working live!\n\n` +
    `Reply 'DEMO' to see it pop up in real-time in your CRM Inbox: https://vbuild-automation.netlify.app/inbox`;

  const result = await sendWhatsApp(phoneNumberId, accessToken, TARGET_PHONE, testMessage);
  console.log('\n==========================================');
  console.log(`Meta API HTTP Status : ${result.status}`);
  console.log(`Meta API Response   :`, JSON.stringify(result.body, null, 2));
  console.log('==========================================');
}

main().catch(console.error);
