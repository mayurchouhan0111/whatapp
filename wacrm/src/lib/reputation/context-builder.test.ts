import { describe, expect, it } from "vitest";
import { buildCustomerContext } from "./context-builder";

describe("buildCustomerContext", () => {
  it("returns empty context when there are no prior reviews", () => {
    const ctx = buildCustomerContext("Rahul", []);

    expect(ctx.contactName).toBe("Rahul");
    expect(ctx.pastReviewCount).toBe(0);
    expect(ctx.pastAverageRating).toBeNull();
    expect(ctx.lastInteractionAt).toBeNull();
    expect(ctx.isRepeatCustomer).toBe(false);
    expect(ctx.pastPositiveReviews).toEqual([]);
    expect(ctx.pastNegativeReviews).toEqual([]);
  });

  it("flags returning customers as repeat customers", () => {
    const ctx = buildCustomerContext("Ali", [
      { rating: 5, feedback: "Great food", created_at: "2026-01-10T10:00:00Z" },
      { rating: 4, feedback: "Nice ambience", created_at: "2026-03-12T10:00:00Z" },
    ]);

    expect(ctx.pastReviewCount).toBe(2);
    expect(ctx.isRepeatCustomer).toBe(true);
  });

  it("computes the average of all past ratings", () => {
    const ctx = buildCustomerContext("Riya", [
      { rating: 5, feedback: null, created_at: "2026-01-10T10:00:00Z" },
      { rating: 3, feedback: null, created_at: "2026-02-10T10:00:00Z" },
    ]);

    expect(ctx.pastAverageRating).toBe(4);
  });

  it("computes the most recent interaction timestamp", () => {
    const ctx = buildCustomerContext("Sam", [
      { rating: 4, feedback: null, created_at: "2026-01-10T10:00:00Z" },
      { rating: 5, feedback: null, created_at: "2026-04-02T09:30:00Z" },
    ]);

    expect(ctx.lastInteractionAt).toBe("2026-04-02T09:30:00Z");
  });

  it("separates positive and negative feedback by rating threshold of 4", () => {
    const ctx = buildCustomerContext("Neha", [
      { rating: 5, feedback: "Amazing service", created_at: "2026-01-10T10:00:00Z" },
      { rating: 2, feedback: "Slow service", created_at: "2026-02-10T10:00:00Z" },
      { rating: 4, feedback: "Good food", created_at: "2026-03-10T10:00:00Z" },
    ]);

    expect(ctx.pastPositiveReviews).toEqual(["Amazing service", "Good food"]);
    expect(ctx.pastNegativeReviews).toEqual(["Slow service"]);
  });

  it("filters out reviews without written feedback", () => {
    const ctx = buildCustomerContext("Dev", [
      { rating: 5, feedback: null, created_at: "2026-01-10T10:00:00Z" },
      { rating: 3, feedback: "Meh", created_at: "2026-02-10T10:00:00Z" },
    ]);

    expect(ctx.pastPositiveReviews).toEqual([]);
    expect(ctx.pastNegativeReviews).toEqual(["Meh"]);
  });

  it("defaults to a friendly contact name when none is provided", () => {
    const ctx = buildCustomerContext("", []);

    expect(ctx.contactName).toBe("there");
    expect(ctx.pastReviewCount).toBe(0);
  });
});