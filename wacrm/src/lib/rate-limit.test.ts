import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetRateLimitForTests,
  checkRateLimit,
  rateLimitResponse,
} from "./rate-limit";

const OPTS = { limit: 3, windowMs: 60_000 };

describe("checkRateLimit", () => {
  beforeEach(() => {
    __resetRateLimitForTests();
  });

  it("permits the first request and decrements remaining", () => {
    const result = checkRateLimit("user:1", OPTS);
    expect(result).toMatchObject({
      success: true,
      remaining: 2,
      limit: 3,
    });
    expect(result.reset).toBeGreaterThan(Date.now());
  });

  it("permits exactly `limit` requests then rejects the next", () => {
    expect(checkRateLimit("user:1", OPTS).success).toBe(true);
    expect(checkRateLimit("user:1", OPTS).success).toBe(true);
    expect(checkRateLimit("user:1", OPTS).success).toBe(true);
    const over = checkRateLimit("user:1", OPTS);
    expect(over.success).toBe(false);
    expect(over.remaining).toBe(0);
  });

  it("keeps separate counters per key", () => {
    checkRateLimit("user:1", OPTS);
    checkRateLimit("user:1", OPTS);
    checkRateLimit("user:1", OPTS);
    // user:1 is at the cap, user:2 should still be unaffected.
    const other = checkRateLimit("user:2", OPTS);
    expect(other.success).toBe(true);
    expect(other.remaining).toBe(2);
  });

  it("opens a fresh window after `windowMs` elapses", () => {
    vi.useFakeTimers();
    try {
      const t0 = new Date("2026-05-01T00:00:00Z").getTime();
      vi.setSystemTime(t0);
      __resetRateLimitForTests();

      checkRateLimit("user:1", OPTS);
      checkRateLimit("user:1", OPTS);
      checkRateLimit("user:1", OPTS);
      expect(checkRateLimit("user:1", OPTS).success).toBe(false);

      // Jump just past the window.
      vi.setSystemTime(t0 + OPTS.windowMs + 1);
      const refreshed = checkRateLimit("user:1", OPTS);
      expect(refreshed.success).toBe(true);
      expect(refreshed.remaining).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("rateLimitResponse", () => {
  it("returns a 429 with retry / X-RateLimit headers", async () => {
    const reset = Date.now() + 30_000;
    const res = rateLimitResponse({
      success: false,
      remaining: 0,
      reset,
      limit: 60,
    });
    expect(res.status).toBe(429);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("60");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThan(0);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/rate limit/i);
  });

  it("clamps Retry-After to a minimum of 1 second", () => {
    // Reset already in the past — the ceiling math would otherwise give 0.
    const res = rateLimitResponse({
      success: false,
      remaining: 0,
      reset: Date.now() - 5_000,
      limit: 10,
    });
    expect(Number(res.headers.get("Retry-After"))).toBeGreaterThanOrEqual(1);
  });
});

describe("RATE_LIMITS presets", () => {
  it("send and broadcast budgets are independent", async () => {
    __resetRateLimitForTests();
    // Importing here so the presets stay close to their assertions.
    const { RATE_LIMITS } = await import("./rate-limit");
    expect(RATE_LIMITS.send.limit).toBeGreaterThan(RATE_LIMITS.broadcast.limit);
    expect(RATE_LIMITS.send.windowMs).toBe(60_000);
    expect(RATE_LIMITS.broadcast.windowMs).toBe(60_000);
  });

  it("public reputation budgets exist and bound write/read traffic", async () => {
    __resetRateLimitForTests();
    const { RATE_LIMITS } = await import("./rate-limit");
    // Reading a review is cheap; claiming a reward / sending a review
    // invite costs money or WhatsApp volume, so its budget must be tighter.
    expect(RATE_LIMITS.reputationRead.limit).toBeGreaterThan(RATE_LIMITS.reputationWrite.limit);
    expect(RATE_LIMITS.reputationWrite.windowMs).toBe(60_000);
    // AI endpoints burn provider credits — must be capped.
    expect(RATE_LIMITS.reputationVoice.limit).toBeLessThanOrEqual(10);
    expect(RATE_LIMITS.reputationAiPolish.limit).toBeLessThanOrEqual(20);
    // Collect creates contacts + fires WhatsApp invites, so it is tight.
    expect(RATE_LIMITS.reputationCollect.limit).toBeLessThanOrEqual(20);
  });

  it("reputation write budget actually blocks a burst from one IP", async () => {
    __resetRateLimitForTests();
    const { checkRateLimit, RATE_LIMITS } = await import("./rate-limit");

    const limit = RATE_LIMITS.reputationWrite.limit;
    const results: boolean[] = [];
    for (let i = 0; i < limit + 1; i++) {
      results.push(checkRateLimit("reputation-write:1.2.3.4", RATE_LIMITS.reputationWrite).success);
    }
    expect(results.slice(0, limit).every(Boolean)).toBe(true);
    expect(results[limit]).toBe(false);
  });
});

afterEach(() => {
  __resetRateLimitForTests();
});
