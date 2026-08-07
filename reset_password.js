const https = require('https');

// Supabase Credentials
const SUPABASE_URL = "https://wmpwxsdemzkbzylswwht.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtcHd4c2RlbXprYnp5bHN3d2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcyMTAxNSwiZXhwIjoyMDk4Mjk3MDE1fQ.dNQyj6vFvzwa_-9knw_vDTF7jeEiSks-H1xohptTyps";

// Usage: node reset_password.js <email> <new_password>
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log("Usage: node reset_password.js <user_email> <new_password>");
  console.log("Example: node reset_password.js admin@vbuild.com MyNewPassword123!");
  process.exit(1);
}

async function getUsers() {
  return new Promise((resolve, reject) => {
    https.get(
      `${SUPABASE_URL}/auth/v1/admin/users`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            resolve(data.users || []);
          } catch (e) {
            reject(e);
          }
        });
      }
    ).on('error', reject);
  });
}

async function resetUserPassword(userId, password) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ password });
    const req = https.request(
      `${SUPABASE_URL}/auth/v1/admin/users/${userId}`,
      {
        method: 'PUT',
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
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
  console.log(`Searching for user with email: ${email}...`);
  const users = await getUsers();
  const targetUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!targetUser) {
    console.error(`❌ No user found with email: ${email}`);
    console.log("Available user emails in your database:");
    users.forEach((u) => console.log(` - ${u.email} (ID: ${u.id})`));
    return;
  }

  console.log(`Found User ID: ${targetUser.id}. Resetting password...`);
  const res = await resetUserPassword(targetUser.id, newPassword);

  if (res.status === 200) {
    console.log(`\n✅ Password successfully updated for ${email}!`);
    console.log(`New Password: ${newPassword}`);
    console.log(`You can now log in at https://vbuild-automation.netlify.app/login`);
  } else {
    console.error("❌ Failed to update password:", res.body);
  }
}

main().catch(console.error);
