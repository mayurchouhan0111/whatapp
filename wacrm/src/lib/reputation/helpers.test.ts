import { describe, expect, it } from "vitest";
import {
  isValidRating,
  computeSentiment,
  sanitizeRewardsConfig,
  pickReward,
  generateDiscountCode,
  calculateRewardExpiry,
} from "./helpers";
import { DEFAULT_REWARDS } from "@/types/reputation";

describe("isValidRating", () => {
  it("accepts integers 1 through 5", () => {
    for (let i = 1; i <= 5; i++) {
      expect(isValidRating(i)).toBe(true);
    }
  });

  it("rejects 0, 6, negatives, and fractions", () => {
    expect(isValidRating(0)).toBe(false);
    expect(isValidRating(6)).toBe(false);
    expect(isValidRating(-1)).toBe(false);
    expect(isValidRating(4.5)).toBe(false);
    expect(isValidRating(NaN)).toBe(false);
    expect(isValidRating("5" as unknown)).toBe(false);
    expect(isValidRating(null)).toBe(false);
    expect(isValidRating(undefined)).toBe(false);
  });
});

describe("computeSentiment", () => {
  it("maps 5-star to 1, 3-star to 0, 1-star to -1", () => {
    expect(computeSentiment(5)).toBe(1);
    expect(computeSentiment(3)).toBe(0);
    expect(computeSentiment(1)).toBe(-1);
  });
});

describe("sanitizeRewardsConfig", () => {
  it("returns DEFAULT_REWARDS for non-array input", () => {
    expect(sanitizeRewardsConfig(undefined)).toEqual(DEFAULT_REWARDS);
    expect(sanitizeRewardsConfig(null)).toEqual(DEFAULT_REWARDS);
    expect(sanitizeRewardsConfig({})).toEqual(DEFAULT_REWARDS);
    expect(sanitizeRewardsConfig("nope")).toEqual(DEFAULT_REWARDS);
  });

  it("drops malformed slices and keeps valid ones", () => {
    const config = [
      { label: "Free Coffee", emoji: "☕", probability: 0.5, color: "#000" },
      { label: "Broken" }, // missing probability + color
      { probability: 0.9, color: "#fff" }, // missing label
      { label: "Neg Prob", emoji: "🚫", probability: -0.2, color: "#000" }, // negative probability
    ];
    const cleaned = sanitizeRewardsConfig(config);
    expect(cleaned).toHaveLength(1);
    expect(cleaned[0].label).toBe("Free Coffee");
  });

  it("falls back to DEFAULT_REWARDS when nothing survives", () => {
    expect(sanitizeRewardsConfig([{ nonsense: true }])).toEqual(DEFAULT_REWARDS);
  });
});

describe("pickReward", () => {
  it("returns the first slice when Math.random() is 0", () => {
    const original = Math.random;
    Math.random = () => 0;
    try {
      const picked = pickReward(DEFAULT_REWARDS);
      expect(picked.label).toBe(DEFAULT_REWARDS[0].label);
    } finally {
      Math.random = original;
    }
  });

  it("returns the last slice when Math.random() is 1", () => {
    const original = Math.random;
    Math.random = () => 1;
    try {
      const picked = pickReward(DEFAULT_REWARDS);
      expect(picked.label).toBe(DEFAULT_REWARDS[DEFAULT_REWARDS.length - 1].label);
    } finally {
      Math.random = original;
    }
  });

  it("returns a default slice for an empty config instead of crashing", () => {
    expect(pickReward([]).label).toBe(DEFAULT_REWARDS[0].label);
  });
});

describe("generateDiscountCode", () => {
  it("always produces a code with the prefix plus 6 alphanumerics", () => {
    const code = generateDiscountCode();
    expect(code).toMatch(/^REWARD[A-Z0-9]{6}$/);
  });

  it("produces different codes on consecutive calls", () => {
    const seen = new Set(Array.from({ length: 50 }, () => generateDiscountCode()));
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe("calculateRewardExpiry", () => {
  it("adds validDays to a fixed now date", () => {
    const now = new Date("2026-08-01T00:00:00Z");
    const { expiresAtIso, formattedDate } = calculateRewardExpiry(15, now);
    const expected = new Date("2026-08-16T00:00:00Z");
    expect(new Date(expiresAtIso).toISOString()).toBe(expected.toISOString());
    expect(formattedDate.length).toBeGreaterThan(0);
  });

  it("defaults to 15 days when validDays is falsy", () => {
    const now = new Date("2026-08-01T00:00:00Z");
    const { expiresAtIso } = calculateRewardExpiry(0, now);
    expect(new Date(expiresAtIso).getTime() - now.getTime()).toBe(15 * 24 * 60 * 60 * 1000);
  });
});
