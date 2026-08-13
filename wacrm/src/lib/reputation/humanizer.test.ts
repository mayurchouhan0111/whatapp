import { describe, expect, it } from "vitest";
import {
  computeHumanLikeness,
  countRoboticHits,
  humanizeReply,
  ROBOTIC_PATTERNS,
} from "./humanizer";

describe("humanizeReply", () => {
  it("returns text unchanged when no robotic patterns are present", () => {
    const raw = "Glad you enjoyed the biryani, Priya! See you next weekend.";
    const { text, humanized } = humanizeReply(raw);

    expect(text).toBe(raw);
    expect(humanized).toBe(false);
  });

  it("collapses excessive exclamation marks to a single one", () => {
    const { text } = humanizeReply("Amazing!!! So glad you loved it!!");

    expect(text).not.toContain("!!!");
    expect(text).not.toContain("!!");
    expect(text).toContain("!");
  });

  it("replaces the formal salutation 'Dear Valued Customer'", () => {
    const { text } = humanizeReply(
      "Dear Valued Customer, thank you for your review.",
    );

    expect(text.toLowerCase()).not.toContain("dear valued customer");
    expect(text.toLowerCase()).toContain("hi");
  });

  it("softens 'We apologize for the inconvenience'", () => {
    const { text } = humanizeReply(
      "We apologize for the inconvenience you experienced.",
    );

    expect(text.toLowerCase()).not.toContain("we apologize for the inconvenience");
  });

  it("replaces 'Thank you for your feedback' with a natural variant", () => {
    const { text } = humanizeReply("Thank you for your feedback, we appreciate it.");

    expect(text.toLowerCase()).not.toContain("thank you for your feedback");
  });

  it("marks the response as humanized when any pattern changed", () => {
    const { humanized } = humanizeReply("Thank you for your feedback!!!");

    expect(humanized).toBe(true);
  });

  it("does not corrupt placeholder tokens or punctuation", () => {
    const { text } = humanizeReply(
      "Thanks for rating us 5/5. We hope to see you again soon!",
    );

    expect(text).toContain("5/5");
    expect(text).toContain("Thanks");
  });
});

describe("computeHumanLikeness", () => {
  it("returns a low score for text full of robotic patterns", () => {
    const score = computeHumanLikeness(
      "Dear Valued Customer, we apologize for the inconvenience. Thank you for your feedback. Please do not hesitate to contact us. We are dedicated to serving you!!!",
    );

    expect(score).toBeLessThan(0.5);
  });

  it("returns a high score for natural, human-sounding text", () => {
    const score = computeHumanLikeness(
      "So glad you enjoyed the pasta, Marco! The kitchen team will love hearing this. Come back for dessert soon.",
    );

    expect(score).toBeGreaterThan(0.8);
  });

  it("scores 1 for text with no detected robotic patterns", () => {
    const score = computeHumanLikeness("This place is fantastic!");

    expect(score).toBe(1);
  });

  it("counts overlapping phrases as a single hit, not multiple", () => {
    // "please do not hesitate to contact us" matches two patterns;
    // the counter consumes it once after the longer phrase is replaced.
    const hits = countRoboticHits("Please do not hesitate to contact us.");
    expect(hits).toBe(1);
  });

  it("scores whitespace-only text as 0, not 1", () => {
    expect(computeHumanLikeness("   ")).toBe(0);
    expect(computeHumanLikeness("")).toBe(0);
  });
});

describe("ROBOTIC_PATTERNS", () => {
  it("covers all the common AI form-letter phrases", () => {
    const patterns = ROBOTIC_PATTERNS.map((p) => p.regex.source);

    expect(patterns.some((p) => /dear valued customer/i.test(p))).toBe(true);
    expect(patterns.some((p) => /apologize for the inconvenience/i.test(p))).toBe(true);
    expect(patterns.some((p) => /thank you for your feedback/i.test(p))).toBe(true);
  });
});