const crypto = require('crypto');
const https = require('https');

const SUPABASE_URL = "https://wmpwxsdemzkbzylswwht.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtcHd4c2RlbXprYnp5bHN3d2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcyMTAxNSwiZXhwIjoyMDk4Mjk3MDE1fQ.dNQyj6vFvzwa_-9knw_vDTF7jeEiSks-H1xohptTyps";
const ENCRYPTION_KEY = "b63704dfd4b11e289d7e5c81e375b92e61913734eed2683034b73260d9f9188b";

function decrypt(encryptedText) {
  const parts = encryptedText.split(':');
  if (parts.length === 3) {
    const [ivHex, ctHex, tagHex] = parts;
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    let decrypted = decipher.update(ctHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  throw new Error('Invalid format');
}

async function fetchConfig() {
  return new Promise((resolve, reject) => {
    https.get(
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
        res.on('end', () => resolve(JSON.parse(body)[0] || null));
      }
    ).on('error', reject);
  });
}

async function registerNumber(phoneNumberId, accessToken) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      messaging_product: 'whatsapp',
      pin: '123456', // 6-digit PIN
    });

    const req = https.request(
      `https://graph.facebook.com/v20.0/${phoneNumberId}/register`,
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
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function updateRegisteredAt(id) {
  const now = new Date().toISOString();
  const payload = JSON.stringify({ registered_at: now });
  return new Promise((resolve, reject) => {
    const req = https.request(
      `${SUPABASE_URL}/rest/v1/whatsapp_config?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve(body));
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('Fetching config...');
  const config = await fetchConfig();
  const accessToken = decrypt(config.access_token);
  console.log(`Registering phone_number_id ${config.phone_number_id} with Meta Cloud API...`);
  
  const result = await registerNumber(config.phone_number_id, accessToken);
  console.log('Meta /register Status:', result.status);
  console.log('Meta /register Response:', result.body);

  if (result.status === 200) {
    await updateRegisteredAt(config.id);
    console.log('✅ Number successfully registered with Meta Cloud API! Inbound webhooks are now LIVE!');
  }
}

main().catch(console.error);
