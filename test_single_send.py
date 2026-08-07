import json
import urllib.request
import urllib.error

# Configuration & Credentials
BASE_URL = "https://vbuild-automation.netlify.app/api/v1"
API_TOKEN = "vbuild_live_WaUSi0NUnQPu4hujuVrMyFjsvuVDProl_TZHal_eZqA"

HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json",
}

TEST_LEAD = {
    "business_name": "Testing Demo Account",
    "contact_name": "Test User",
    "phone": "+916263850508",
    "city": "India",
}

def post_request(endpoint, data):
    url = f"{BASE_URL}/{endpoint}"
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers=HEADERS,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")
    except Exception as ex:
        return 500, str(ex)

def run_test_send():
    print("--- STARTING SINGLE WHATSAPP TEST MESSAGE ---")
    print(f"Target Phone: {TEST_LEAD['phone']}")
    
    # 1. Ingest Contact into CRM
    contact_payload = {
        "name": f"{TEST_LEAD['contact_name']} ({TEST_LEAD['business_name']})",
        "phone": TEST_LEAD["phone"],
        "tags": ["Test-Single-Send", "Hermes-Agent-Test"],
    }
    
    status, resp = post_request("contacts", contact_payload)
    print(f"Contact Sync Status: {status} -> {resp}")
    
    # 2. Dispatch WhatsApp Message
    message_body = (
        f"Hi {TEST_LEAD['contact_name']}! 👋 This is a test message from your Vbuild CRM Autonomous Hermes Growth Agent.\n\n"
        f"🚀 Your WhatsApp CRM API & Automated Outreach system is 100% active and working live!\n\n"
        f"Reply 'DEMO' or send any message to test the real-time CRM Inbox response!"
    )
    
    message_payload = {
        "to": TEST_LEAD["phone"],
        "message_type": "text",
        "content_text": message_body,
    }
    
    msg_status, msg_resp = post_request("messages", message_payload)
    print(f"Message Send Status: {msg_status} -> {msg_resp}")
    print("---------------------------------------------")

if __name__ == "__main__":
    run_test_send()
