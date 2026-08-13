import type { BrandVoice, CustomerContext } from "@/types/reputation";

export interface ReviewReplyPromptParams {
  businessName: string;
  customerName?: string;
  rating: number;
  reviewText: string;
  brandVoice: BrandVoice;
  context: CustomerContext;
}

const TONE_GUIDANCE: Record<BrandVoice["tone"], string> = {
  warm: "Sound warm and genuinely grateful, like a close friend or a trusted local business owner would.",
  professional: "Stay polished and professional, but avoid corporate jargon. Be warm yet concise.",
  casual: "Keep it relaxed and conversational. Use everyday language a friendly neighbor would.",
  empathetic: "Lead with empathy and understanding. Make the customer feel heard before anything else.",
};

function toneInstruction(voice: BrandVoice): string {
  const base = TONE_GUIDANCE[voice.tone] ?? TONE_GUIDANCE.warm;
  const style = voice.style?.trim()
    ? ` Follow this style: ${voice.style.trim()}`
    : "";
  return base + style;
}

export function buildReviewReplyPrompt(params: ReviewReplyPromptParams): string {
  const {
    businessName,
    customerName,
    rating,
    reviewText,
    brandVoice,
    context,
  } = params;

  const name = customerName?.trim().slice(0, 100) || "the customer";
  const escapedReview = reviewText.slice(0, 1500).replace(/[\r\n]+/g, " ").replace(/"/g, "'");
  const repeatNote = context.isRepeatCustomer
    ? `This customer has left ${context.pastReviewCount} review(s) before with an average of ${context.pastAverageRating?.toFixed(1) ?? "n/a"} stars. They are a returning guest.`
    : "This is this customer's first known review.";

  const positiveContext =
    context.pastPositiveReviews.length > 0
      ? ` They previously praised: ${context.pastPositiveReviews.slice(0, 2).join("; ")}.`
      : "";

  const negativeContext =
    context.pastNegativeReviews.length > 0
      ? ` They previously complained about: ${context.pastNegativeReviews.slice(0, 2).join("; ")}.`
      : "";

  const custom = brandVoice.customInstructions?.trim()
    ? `\n\nBrand instructions: ${brandVoice.customInstructions.trim()}`
    : "";

  const reviewGuidance =
    rating >= 4
      ? `The review is positive (${rating} star). Match the customer's excitement, thank them warmly, and mention specific praise they gave. Keep it under 90 words.`
      : `The review is negative (${rating} star). Do NOT be defensive. Acknowledge the specific issue they raised, apologize sincerely, and invite them to reach out privately so you can make it right. Keep it under 110 words.`;

  return [
    `You are the owner of ${businessName}, responding to a customer's review.`,
    `Respond to ${name}, who wrote: "${escapedReview}".`,
    `Context: ${repeatNote}${positiveContext}${negativeContext}`,
    `Tone: ${toneInstruction(brandVoice)}`,
    `Guidance: ${reviewGuidance}`,
    `Rules:`,
    `- Never use phrases like "Dear valued customer", "we apologize for the inconvenience", or "thank you for your feedback".`,
    `- Do not use excessive exclamation marks.`,
    `- Write like a real human business owner, not a support bot.`,
    `- Sign off naturally (e.g. "Thanks, [first name]" or "See you soon!").`,
    `- Keep it under 120 words.`,
    `- Output only the reply text, nothing else.`,
    custom,
  ]
    .filter(Boolean)
    .join("\n");
}