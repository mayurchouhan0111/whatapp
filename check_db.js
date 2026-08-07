const https = require('https');

const SUPABASE_URL = "https://wmpwxsdemzkbzylswwht.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtcHd4c2RlbXprYnp5bHN3d2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcyMTAxNSwiZXhwIjoyMDk4Mjk3MDE1fQ.dNQyj6vFvzwa_-9knw_vDTF7jeEiSks-H1xohptTyps";

async function checkDb() {
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
        const rows = JSON.parse(body);
        console.log('Whatsapp Config Rows:', JSON.stringify(rows, null, 2));
      });
    }
  );
}

checkDb();
