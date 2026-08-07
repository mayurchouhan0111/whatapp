import json
import urllib.request
import urllib.error
from crypto import AESGCM

# Supabase REST API credentials to fetch whatsapp_config
SUPABASE_URL = "https://wmpwxsdemzkbzylswwht.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtcHd4c2RlbXprYnp5bHN3d2h0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcyMTAxNSwiZXhwIjoyMDk4Mjk3MDE1fQ.dNQyj6vFvzwa_-9knw_vDTF7jeEiSks-H1xohptTyps"
ENCRYPTION_KEY_HEX = "b63704dfd4b11e289d7e5c81e375b92e61913734eed2683034b73260d9f9188b"

TARGET_PHONE = "916263850508"

def decrypt_token(encrypted_str):
    try:
        parts = encrypted_str.split(":")
        if len(parts) != 3 or parts[0] != "gcm":
            return None
        iv = bytes.fromhex(parts[1])
        data = bytes.fromhex(parts[2])
        key = bytes.fromhex(ENCRYPTION_KEY_HEX)
        aesgcm = AESGCM(key)
        decrypted = aesgcm.decrypt(iv, data, None)
        return decrypted.decode("utf-8")
    except Exception as ex:
        print(f"Decryption error: {ex}")
        return None

def fetch_config():
    url = f"{SUPABASE_URL}/rest/v1/whatsapp_config?select=*"
    req = urllib.request.Request(
        url,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
        }
    )
    with urllib.request.urlopen(req) as resp:
        rows = json.loads(resp.read().decode("utf-8"))
        return rows[0] if rows else None

def send_whatsapp_direct(phone_number_id, access_token, to_phone, text_message):
    url = f"https://graph.facebook.com/v20.0/{phone_number_id}/messages"
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_phone,
        "type": "text",
        "text": {"body": text_message}
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")

def main():
    print(f"Fetching WhatsApp config from Supabase for target {TARGET_PHONE}...")
    config = fetch_config()
    if not config:
        print("❌ No whatsapp_config row found!")
        return

    phone_number_id = config.get("phone_number_id")
    encrypted_token = config.get("access_token")
    access_token = decrypt_token(encrypted_token)

    if not access_token:
        print("❌ Failed to decrypt access token!")
        return

    print(f"Found Phone Number ID: {phone_number_id}")
    print("Dispatching test message via Meta Cloud API...")

    test_message = (
        "Hi Test User! 👋\n\n"
        "🚀 This is a live test message from your Vbuild CRM WhatsApp Engine!\n\n"
        "Your WhatsApp API connection and automated agent are 100% active and working live!\n\n"
        "Reply 'DEMO' to see it pop up in real-time in your CRM Inbox: https://vbuild-automation.netlify.app/inbox"
    )

    status, resp = send_whatsapp_direct(phone_number_id, access_token, TARGET_PHONE, test_message)
    print(f"\n==========================================")
    print(f"Meta API Status : {status}")
    print(f"Meta Response   : {resp}")
    print(f"==========================================")

if __name__ == "__main__":
    main()
