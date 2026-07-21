export interface ReputationSettingsV2 {
  id: string;
  account_id: string;
  google_review_url: string;
  gate_reviews: boolean;
  review_threshold: number;
  sms_template: string;
  owner_photo_url: string | null;
  owner_name: string | null;
  welcome_message: string | null;
  branding_color: string;
  logo_url: string | null;
  enable_spin_wheel: boolean;
  enable_voice_review: boolean;
  enable_ai_chips: boolean;
  rewards_config: RewardSlice[];
  created_at: string;
  updated_at: string;
}

export interface RewardSlice {
  label: string;
  emoji: string;
  probability: number;
  discount_code?: string;
  discount_percent?: number;
  color: string;
}

export interface ReviewRequestV2 {
  id: string;
  account_id: string;
  contact_id: string;
  status: 'sent' | 'opened' | 'rated' | 'clicked' | 'failed';
  rating: number | null;
  feedback: string | null;
  staff_id: string | null;
  table_number: string | null;
  source_type: 'qr_web' | 'qr_whatsapp' | 'direct_link';
  ai_generated_text: string | null;
  voice_transcript: string | null;
  sentiment_score: number | null;
  tags_selected: string[];
  recovery_action_requested: 'refund' | 'replace' | 'manager_call' | 'coupon' | null;
  recovery_status: 'pending' | 'manager_contacted' | 'resolved' | null;
  recovery_resolved_at: string | null;
  spin_reward_claimed: string | null;
  sent_at: string;
  opened_at: string | null;
  clicked_at: string | null;
  created_at: string;
  updated_at: string;
  contact?: {
    id: string;
    name: string;
    phone: string;
  };
  staff_member?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface StaffMember {
  id: string;
  account_id: string;
  name: string;
  role: string;
  qr_slug: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffMemberWithStats extends StaffMember {
  total_scans: number;
  average_rating: number | null;
  conversion_rate: number;
}

export interface CustomerLoyaltyPass {
  id: string;
  account_id: string;
  contact_id: string;
  total_visits: number;
  stamps_count: number;
  rewards_unlocked: RewardUnlocked[];
  created_at: string;
  updated_at: string;
}

export interface RewardUnlocked {
  milestone: number;
  reward_label: string;
  unlocked_at: string;
  claimed: boolean;
}

export interface ReviewHeatmap {
  id: string;
  account_id: string;
  day_of_week: number;
  hour_of_day: number;
  total_ratings: number;
  avg_rating: number;
  low_rating_count: number;
}

export interface AIInsights {
  most_praised: { aspect: string; count: number }[];
  most_complained: { aspect: string; count: number }[];
  peak_unhappy_hours: { hour: number; count: number }[];
  branch_table_heatmap: { table: string; avg_rating: number; count: number }[];
  sentiment_trend: { date: string; avg_sentiment: number }[];
  summary: string;
}

export interface SpinWheelConfig {
  slices: RewardSlice[];
  max_spins_per_customer: number;
}

export interface LoyaltyMilestone {
  visits: number;
  reward: string;
  discount_percent?: number;
  discount_code?: string;
}

export interface PosterDesign {
  business_name: string;
  logo_url: string | null;
  owner_photo_url: string | null;
  owner_name: string | null;
  qr_data: string;
  branding_color: string;
  size: 'A6' | 'A5' | 'sticker';
  promo_hook: string;
  show_stars: boolean;
  show_owner: boolean;
}

export type ReviewTag =
  | 'Fast Service'
  | 'Friendly Staff'
  | 'Great Ambience'
  | 'Delicious Food'
  | 'Clean Place'
  | 'Good Value'
  | 'Professional'
  | 'Recommend';

export const REVIEW_TAGS: { key: ReviewTag; emoji: string }[] = [
  { key: 'Fast Service', emoji: '⚡' },
  { key: 'Friendly Staff', emoji: '😊' },
  { key: 'Great Ambience', emoji: '🌿' },
  { key: 'Delicious Food', emoji: '🍕' },
  { key: 'Clean Place', emoji: '✨' },
  { key: 'Good Value', emoji: '💰' },
  { key: 'Professional', emoji: '👔' },
  { key: 'Recommend', emoji: '👍' },
];

export const RATING_EMOJIS: Record<number, { emoji: string; label: string }> = {
  1: { emoji: '😡', label: 'Very Bad' },
  2: { emoji: '😕', label: 'Average' },
  3: { emoji: '😊', label: 'Good' },
  4: { emoji: '😍', label: 'Great' },
  5: { emoji: '🤩', label: 'Amazing' },
};

export const DEFAULT_REWARDS: RewardSlice[] = [
  { label: 'Free Coffee', emoji: '☕', probability: 0.25, discount_percent: 0, color: '#8B4513' },
  { label: '10% Off', emoji: '🎉', probability: 0.2, discount_percent: 10, color: '#2563eb' },
  { label: 'Free Dessert', emoji: '🍰', probability: 0.15, discount_percent: 0, color: '#db2777' },
  { label: '20% Off', emoji: '🔥', probability: 0.1, discount_percent: 20, color: '#ea580c' },
  { label: 'Buy 1 Get 1', emoji: '🎁', probability: 0.1, discount_percent: 50, color: '#16a34a' },
  { label: 'Free Appetizer', emoji: '🥗', probability: 0.1, discount_percent: 0, color: '#ca8a04' },
  { label: 'Loyalty Bonus', emoji: '⭐', probability: 0.07, discount_percent: 15, color: '#6b21a8' },
  { label: 'VIP Treatment', emoji: '👑', probability: 0.03, discount_percent: 30, color: '#be185d' },
];
