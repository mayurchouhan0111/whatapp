import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/flows/admin-client", () => ({
  supabaseAdmin: vi.fn(),
}));

vi.mock("@/lib/whatsapp/meta-api", () => ({
  sendTextMessage: vi.fn(),
}));

vi.mock("@/lib/whatsapp/encryption", () => ({
  decrypt: (v: string) => `decrypted:${v}`,
}));

import { supabaseAdmin } from "@/lib/flows/admin-client";
import { sendTextMessage } from "@/lib/whatsapp/meta-api";
import { handlePostReviewAutomation } from "./automation-handler";

const adminClient = supabaseAdmin as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("handlePostReviewAutomation", () => {
  it("sends a thank-you with reward + interactive menu for a 5-star rating", async () => {
    const settings = {
      manager_phone: null,
      rewards_config: [],
      google_review_url: "x",
      sms_template: null,
    };
    const whatsappConfig = {
      phone_number_id: "12345",
      access_token: "tok",
    };
    const account = { name: "Spice Garden" };

    adminClient.mockReturnValue({
      from: vi.fn((table: string) => {
        if (table === "messages") {
          return { insert: vi.fn(() => ({ select: async () => ({ data: null, error: null }) })) };
        }
        if (table === "reputation_settings")
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: settings, error: null }) }) }),
          };
        if (table === "whatsapp_config")
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: whatsappConfig, error: null }) }) }),
          };
        if (table === "accounts")
          return {
            select: () => ({ eq: () => ({ single: async () => ({ data: account, error: null }) }) }),
          };
        throw new Error(`unexpected table ${table}`);
      }),
    });

    await handlePostReviewAutomation({
      accountId: "acc-1",
      contactId: "contact-1",
      contactPhone: "+919876543210",
      rating: 5,
      spinReward: "Free Coffee",
      discountCode: "REWARDABC123",
    });

    expect(sendTextMessage).toHaveBeenCalled();
    const messages = (sendTextMessage as unknown as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    expect(messages.length).toBeGreaterThanOrEqual(2);
    expect(messages.some((m) => /thank you/i.test(m.text))).toBe(true);
    expect(messages.some((m) => m.text.includes("REWARDABC123"))).toBe(true);
    expect(messages.some((m) => m.text.includes("1️⃣ Book a Table"))).toBe(true);
  });

  it("skips WhatsApp entirely when the contact phone is invalid", async () => {
    adminClient.mockReturnValue({
      from: vi.fn(() => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      })),
    });

    await handlePostReviewAutomation({
      accountId: "acc-1",
      contactId: "contact-1",
      contactPhone: "not-a-phone",
      rating: 5,
    });

    expect(sendTextMessage).not.toHaveBeenCalled();
  });

  it("does not throw when no whatsapp config exists", async () => {
    adminClient.mockReturnValue({
      from: vi.fn(() => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      })),
    });

    await expect(
      handlePostReviewAutomation({
        accountId: "acc-1",
        contactId: "contact-1",
        contactPhone: "+919876543210",
        rating: 2,
      }),
    ).resolves.toBeUndefined();
  });
});