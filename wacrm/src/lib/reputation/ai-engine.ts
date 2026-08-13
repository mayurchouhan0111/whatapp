import type { AIResponse, BrandVoice, CustomerContext } from "@/types/reputation";
import { buildReviewReplyPrompt } from "./prompt-templates";
import { computeHumanLikeness, humanizeReply } from "./humanizer";

export interface GenerateHumanizedReplyOptions {
  reviewText: string;
  rating: number;
  businessName: string;
  customerName?: string;
  brandVoice?: Partial<BrandVoice>;
  context?: CustomerContext;
}

const DEFAULT_BRAND_VOICE: BrandVoice = {
  tone: "warm",
  style: "",
  customInstructions: "",
};

const PROVIDER_TIMEOUT_MS = 8000;

function blankContext(customerName?: string): CustomerContext {
  return {
    contactName: customerName ?? "",
    pastReviewCount: 0,
    pastAverageRating: null,
    lastInteractionAt: null,
    isRepeatCustomer: false,
    pastPositiveReviews: [],
    pastNegativeReviews: [],
  };
}

function staticFallback(reviewText: string, rating: number): string {
  if (rating >= 4) {
    return `Thank you so much for your wonderful ${rating}-star review! We're thrilled you had a great experience with us. Your feedback means the world to our team, and we look forward to serving you again soon!`;
  }
  return `Thank you for your feedback. We're sorry your experience didn't meet expectations. We take all reviews seriously and will use your input to improve. Please reach out to us directly so we can make things right.`;
}

function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}

async function callProvider(
  prompt: string,
): Promise<{ reply: string; modelUsed: string } | null> {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    try {
      const res = await fetchWithTimeout(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a professional customer experience manager.",
              },
              { role: "user", content: prompt },
            ],
            max_tokens: 300,
          }),
        },
        PROVIDER_TIMEOUT_MS,
      );

      if (res.ok) {
        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) return { reply: content, modelUsed: "openai-gpt-4o-mini" };
      }
    } catch {
      // fall through to next provider
    }
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const res = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        },
        PROVIDER_TIMEOUT_MS,
      );

      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (content) return { reply: content, modelUsed: "gemini-2.0-flash" };
      }
    } catch {
      // fall through to static fallback
    }
  }

  return null;
}

export async function generateHumanizedReply(
  options: GenerateHumanizedReplyOptions,
): Promise<AIResponse> {
  const start = performance.now();
  const brandVoice: BrandVoice = {
    ...DEFAULT_BRAND_VOICE,
    ...options.brandVoice,
  };

  const context = options.context ?? blankContext(options.customerName);

  const prompt = buildReviewReplyPrompt({
    businessName: options.businessName,
    customerName: options.customerName,
    rating: options.rating,
    reviewText: options.reviewText,
    brandVoice,
    context,
  });

  let rawReply: string;
  let modelUsed = "fallback";

  try {
    const providerResult = await callProvider(prompt);
    if (providerResult) {
      rawReply = providerResult.reply;
      modelUsed = providerResult.modelUsed;
    } else {
      rawReply = staticFallback(options.reviewText, options.rating);
    }
  } catch {
    rawReply = staticFallback(options.reviewText, options.rating);
  }

  // Score the RAW model output for how natural it already is; a canned
  // template full of form-letter phrases should score low.
  const responseConfidence = computeHumanLikeness(rawReply);
  const { text, humanized } = humanizeReply(rawReply);
  const responseTimeMs = Math.round(performance.now() - start);

  return {
    reply: text,
    confidenceScore: responseConfidence,
    modelUsed,
    responseTimeMs,
    humanized,
  };
}