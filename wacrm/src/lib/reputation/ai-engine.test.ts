import { describe, expect, it, vi } from "vitest";
import { generateHumanizedReply } from "./ai-engine";
import type { AIResponse } from "@/types/reputation";

describe("generateHumanizedReply", () => {
  it("humanizes the raw AI reply and reports the model used", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content:
                  "Thank you for your feedback!!! We apologize for the inconvenience. We really appreciate it!",
              },
            },
          ],
        }),
      }),
    );

    vi.stubEnv("OPENAI_API_KEY", "sk-test");

    const result = await generateHumanizedReply({
      reviewText: "Was okay, had a long wait.",
      rating: 3,
      businessName: "Cafe Nova",
    });

    expect(result.reply).not.toContain("!!!");
    expect(result.reply.toLowerCase()).not.toContain(
      "we apologize for the inconvenience",
    );
    expect(result.humanized).toBe(true);
    expect(result.modelUsed).toBeTruthy();
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(result.confidenceScore).toBeLessThanOrEqual(1);

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("falls back to a static reply when the AI provider errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    const result = await generateHumanizedReply({
      reviewText: "Great food",
      rating: 4,
      businessName: "Cafe Nova",
    });

    expect(result.reply).toBeTruthy();
    expect(result.reply.length).toBeGreaterThan(0);
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0);

    vi.unstubAllGlobals();
  });

  it("produces a valid AIResponse contract regardless of provider state", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    const result = await generateHumanizedReply({
      reviewText: "Amazing",
      rating: 5,
      businessName: "Cafe Nova",
    });

    expect(result).toMatchObject<AIResponse>({
      reply: expect.any(String) as string,
      confidenceScore: expect.any(Number) as number,
      modelUsed: expect.any(String) as string,
      responseTimeMs: expect.any(Number) as number,
      humanized: expect.any(Boolean) as boolean,
    });

    vi.unstubAllEnvs();
  });

  it("accepts an optional customer name and passes it into the prompt", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Thanks for coming in, Rahul!" } }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("OPENAI_API_KEY", "sk-test");

    await generateHumanizedReply({
      reviewText: "Nice place",
      rating: 4,
      businessName: "Cafe Nova",
      customerName: "Rahul",
    });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init.body));

    expect(JSON.stringify(body.messages)).toContain("Rahul");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("uses repeat-customer context in the prompt when provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Great to see you again!" } }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("OPENAI_API_KEY", "sk-test");

    await generateHumanizedReply({
      reviewText: "Great food",
      rating: 5,
      businessName: "Cafe Nova",
      customerName: "Priya",
      context: {
        contactName: "Priya",
        pastReviewCount: 3,
        pastAverageRating: 4.7,
        lastInteractionAt: "2026-07-01T10:00:00Z",
        isRepeatCustomer: true,
        pastPositiveReviews: ["Loved the paneer"],
        pastNegativeReviews: [],
      },
    });

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(init.body));

    expect(JSON.stringify(body.messages)).toContain("returning guest");
    expect(JSON.stringify(body.messages)).toContain("3");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("passes an abort signal to the provider so stalled calls fail fast", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError"));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("OPENAI_API_KEY", "sk-test");

    const result = await generateHumanizedReply({
      reviewText: "Great food",
      rating: 4,
      businessName: "Cafe Nova",
    });

    const [, init] = fetchMock.mock.calls[0];
    expect((init as RequestInit).signal).toBeInstanceOf(AbortSignal);
    expect(result.reply.length).toBeGreaterThan(0);

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
});