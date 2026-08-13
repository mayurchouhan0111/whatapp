export interface RoboticPattern {
  regex: RegExp;
  replacement: string;
}

export const ROBOTIC_PATTERNS: RoboticPattern[] = [
  {
    regex: /Dear Valued Customer[,!]?\s*/gi,
    replacement: "Hi ",
  },
  {
    regex: /Dear Customer[,!]?\s*/gi,
    replacement: "Hi ",
  },
  {
    regex: /we apologize for the inconvenience/gi,
    replacement: "we're sorry about that",
  },
  {
    regex: /thank you for your feedback/gi,
    replacement: "thanks for sharing this",
  },
  {
    regex: /we appreciate your business/gi,
    replacement: "we appreciate having you",
  },
  {
    regex: /please do not hesitate to contact us/gi,
    replacement: "just reach out anytime",
  },
  {
    regex: /please do not hesitate/gi,
    replacement: "feel free",
  },
  {
    regex: /we are dedicated to serving you/gi,
    replacement: "we love serving you",
  },
  {
    regex: /we value your continued loyalty/gi,
    replacement: "your loyalty means a lot to us",
  },
  {
    regex: /rest assured/gi,
    replacement: "you can count on that",
  },
  {
    regex: /i hope this message finds you well/gi,
    replacement: "hey there",
  },
  {
    regex: /it is our pleasure/gi,
    replacement: "our pleasure",
  },
  {
    regex: /!{2,}/g,
    replacement: "!",
  },
];

function applyPatterns(text: string): string {
  let changed = false;
  let result = text;

  for (const pattern of ROBOTIC_PATTERNS) {
    const next = result.replace(pattern.regex, pattern.replacement);
    if (next !== result) {
      changed = true;
      result = next;
    }
  }

  return changed ? result.trim() : result;
}

export function countRoboticHits(text: string): number {
  let result = text;
  let hits = 0;

  for (const pattern of ROBOTIC_PATTERNS) {
    const next = result.replace(pattern.regex, pattern.replacement);
    if (next !== result) {
      hits += 1;
      result = next;
    }
  }

  return hits;
}

export function computeHumanLikeness(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;

  const hits = countRoboticHits(trimmed);
  if (hits === 0) return 1;

  const score = Math.max(0, 1 - hits * 0.2);
  return Math.round(score * 100) / 100;
}

export function humanizeReply(
  rawReply: string,
): { text: string; humanized: boolean } {
  const text = applyPatterns(rawReply);
  return { text, humanized: text !== rawReply };
}