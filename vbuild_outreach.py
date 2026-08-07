import json
import time
import urllib.error
import urllib.request

# Configuration & Credentials
BASE_URL = "https://vbuild-automation.netlify.app/api/v1"
API_TOKEN = "vbuild_live_WaUSi0NUnQPu4hujuVrMyFjsvuVDProl_TZHal_eZqA"
HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json",
}

# Step 1: 10 Scraped Coaching Institutes in Delhi
LEADS = [
    {
        "business_name": "Vajiram & Ravi",
        "contact_name": "Admissions Desk",
        "phone": "+919811564444",
        "city": "Delhi",
    },
    {
        "business_name": "Vision IAS",
        "contact_name": "Counseling Team",
        "phone": "+918468022022",
        "city": "Delhi",
    },
    {
        "business_name": "Drishti IAS",
        "contact_name": "Course Coordinator",
        "phone": "+918010440440",
        "city": "Delhi",
    },
    {
        "business_name": "FIITJEE South Delhi",
        "contact_name": "Branch Manager",
        "phone": "+911149283471",
        "city": "Delhi",
    },
    {
        "business_name": "Allen Career Institute Janakpuri",
        "contact_name": "Student Helpdesk",
        "phone": "+911141862200",
        "city": "Delhi",
    },
    {
        "business_name": "Aakash Institute Connaught Place",
        "contact_name": "Admissions Counselor",
        "phone": "+918800012991",
        "city": "Delhi",
    },
    {
        "business_name": "Narayana Coaching Center",
        "contact_name": "Academic Head",
        "phone": "+911141828282",
        "city": "Delhi",
    },
    {
        "business_name": "Next IAS Karol Bagh",
        "contact_name": "Inquiry Desk",
        "phone": "+918081300200",
        "city": "Delhi",
    },
    {
        "business_name": "Plutus IAS",
        "contact_name": "Admissions Team",
        "phone": "+918448440231",
        "city": "Delhi",
    },
    {
        "business_name": "Sriram's IAS",
        "contact_name": "Senior Counselor",
        "phone": "+919811489560",
        "city": "Delhi",
    },
]


def post_request(endpoint, data):
    url = f"{BASE_URL}/{endpoint}"
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers=HEADERS,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(
                response.read().decode("utf-8")
            )
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")


def run_workflow():
    contacts_created = 0
    messages_sent = 0

    print("--- STARTING VBUILD CRM OUTREACH WORKFLOW ---")

    for idx, lead in enumerate(LEADS, 1):
        print(f"\nProcessing [{idx}/10]: {lead['business_name']}")

        # STEP 2: Ingest Contact into CRM
        contact_payload = {
            "name": f"{lead['contact_name']} ({lead['business_name']})",
            "phone": lead["phone"],
            "tags": [
                "Auto-Scraped",
                "Coaching & Education",
                "Outreach-Pending",
            ],
        }

        status, resp = post_request("contacts", contact_payload)
        if status in (200, 201):
            contacts_created += 1
            print(f"  ✓ Contact Ingested: {contact_payload['name']}")
        else:
            print(f"  ✗ Contact Creation Failed: {resp}")

        # STEP 3: Execute Personalized WhatsApp Outreach
        message_body = (
            f"Hi {lead['contact_name']}, I saw {lead['business_name']} offers top courses in {lead['city']}. "
            f"Are your admissions counselors spending hours manually calling cold leads?\n\n"
            f"Vbuild CRM automates student qualification via WhatsApp chatbot flows so counselors "
            f"only talk to hot, enrolled prospects. Reply 'INFO' to test our interactive bot live!"
        )

        message_payload = {
            "to": lead["phone"],
            "message_type": "text",
            "content_text": message_body,
        }

        status, resp = post_request("messages", message_payload)
        if status in (200, 201):
            messages_sent += 1
            print(f"  ✓ WhatsApp Message Sent to {lead['phone']}")
        else:
            print(f"  ✗ Message Sending Failed: {resp}")

        # STEP 4: Anti-Spam Safety Delay (45 seconds between sends)
        if idx < len(LEADS):
            print("  ⏳ Safety Delay: Waiting 45 seconds to satisfy Meta anti-spam policy...")
            time.sleep(45)

    # STEP 5: Output Summary Report
    print("\n" + "=" * 40)
    print("      WORKFLOW SUMMARY REPORT      ")
    print("=" * 40)
    print(f"Target Category: Coaching & Education")
    print(f"Leads Processed: {len(LEADS)}")
    print(f"Contacts Created in CRM: {contacts_created}")
    print(f"WhatsApp Messages Sent: {messages_sent}")
    print("=" * 40)


if __name__ == "__main__":
    run_workflow()
