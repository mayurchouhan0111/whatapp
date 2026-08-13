import type { CustomerContext, ReviewRequestV2 } from "@/types/reputation";

type ReviewSlice = Pick<ReviewRequestV2, "rating" | "feedback" | "created_at">;

export function buildCustomerContext(
  contactName: string,
  reviews: ReviewSlice[],
): CustomerContext {
  const rated = reviews.filter((r) => r.rating !== null);
  const avg =
    rated.length > 0
      ? rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length
      : null;

  const stamped = reviews
    .filter((r) => r.created_at) as (ReviewSlice & { created_at: string })[];

  const lastInteractionAt = stamped.length
    ? stamped
        .map((r) => r.created_at)
        .sort((a, b) => (a < b ? 1 : -1))[0]
    : null;

  const positive = reviews
    .filter((r) => r.rating !== null && r.rating >= 4 && r.feedback)
    .map((r) => r.feedback as string);

  const negative = reviews
    .filter((r) => r.rating !== null && r.rating < 4 && r.feedback)
    .map((r) => r.feedback as string);

  return {
    contactName: contactName || "there",
    pastReviewCount: reviews.length,
    pastAverageRating: avg,
    lastInteractionAt,
    isRepeatCustomer: reviews.length > 0,
    pastPositiveReviews: positive,
    pastNegativeReviews: negative,
  };
}