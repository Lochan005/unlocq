// ============================================================
// ENUMS / UNION TYPES
// ============================================================

export type RewardStatus =
  | "ordered"
  | "payment_pending"
  | "payment_confirmed"
  | "voucher_generated"
  | "delivered"
  | "confirmed" // cashback credited to pool (available for prepay/voucher)
  | "redeemed"  // redeemed FROM pool (prepay/voucher)
  | "expired"
  | "refunded";

export type RewardType =
  | "coupon_cashback"
  | "platform_bonus"
  | "non_monetary";

export type MerchantCategory =
  | "food"
  | "grocery"
  | "shopping"
  | "fashion"
  | "beauty"
  | "electronics"
  | "entertainment"
  | "travel";

export type UserTier = "bronze" | "silver" | "gold" | "platinum";

export type OrderStatus =
  | "initiated"
  | "payment_pending"
  | "payment_confirmed"
  | "payment_failed"
  | "voucher_generating"
  | "voucher_generated"
  | "delivered"
  | "delivery_failed"
  | "redeemed"
  | "expired"
  | "refund_initiated"
  | "refund_completed";

// ============================================================
// DATA MODEL INTERFACES
// ============================================================

export interface RewardEntry {
  reward_id: string;
  user_id: string;
  order_id: string | null;
  merchant_id: string | null;
  reward_type: RewardType;
  user_share: number;
  coins_credited: number;
  status: RewardStatus;
  campaign_ref: string;
  status_history: Array<{ status: RewardStatus; timestamp: string }>;
  created_at: string;
  confirmed_at: string | null;
  redeemed_at: string | null;
}

export interface UserRewardsProfile {
  user_id: string;
  pool_balance_confirmed: number;
  pool_balance_pending: number;
  coins_confirmed: number;
  coins_pending: number;
  current_tier: UserTier;
  current_streak_months: number;
  streak_multiplier: number;
  total_prepayments_count: number;
  total_cards_purchased: number;
  lifetime_earned: number;
  lifetime_prepaid_from_pool: number;
  auto_prepay_enabled: boolean;
  auto_prepay_threshold: number;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// COUPON MARKETPLACE TYPES
// ============================================================

export interface CatalogueItem {
  item_id: string;
  merchant_id: string;
  merchant_display_name: string;
  icon_key: string;
  category: MerchantCategory;
  face_value: number;
  discount_pct: number;
  discounted_price: number;
  cashback_pct: number;
  cashback_amount: number;
  in_stock: boolean;
  source: "aggregator" | "direct";
  valid_till: string;
}

export interface CouponOrder {
  order_id: string;
  user_id: string;
  item_id: string;
  merchant_id: string;
  merchant_display_name: string;
  face_value: number;
  discounted_price: number;
  cashback_amount: number;
  payment_method: "upi" | "card" | "net_banking";
  payment_status: "pending" | "confirmed" | "failed" | "refunded";
  voucher_code: string | null;
  voucher_status:
    | "pending_generation"
    | "generated"
    | "delivered"
    | "delivery_failed"
    | "redeemed"
    | "expired";
  delivery_channel: "on_screen" | "sms" | "email" | null;
  deep_link: string | null;
  expiry_date: string | null;
  idempotency_key: string;
  created_at: string;
  payment_confirmed_at: string | null;
  voucher_generated_at: string | null;
  delivered_at: string | null;
  redeemed_at: string | null;
}

export interface RefundEvent {
  refund_id: string;
  order_id: string;
  user_id: string;
  amount: number;
  reason:
    | "generation_failed"
    | "invalid_code"
    | "user_request"
    | "expired_unredeemed";
  refund_method: "upi" | "card" | "net_banking";
  refund_status: "initiated" | "processing" | "completed" | "failed";
  cashback_reversed: boolean;
  created_at: string;
  completed_at: string | null;
}

// ============================================================
// DISPLAY / UI HELPER TYPES
// ============================================================

export interface MerchantDisplayInfo {
  merchant_id: string;
  display_name: string;
  icon_key: string;
  category: MerchantCategory;
  brand_color: string;
}

export interface MerchantWithStatus extends MerchantDisplayInfo {
  status: "in_stock" | "out_of_stock";
}

export interface EarnAction {
  action_id: string;
  action_name: string;
  coins: number;
  type: "one-time" | "recurring" | "bonus";
  icon_key: string;
  description: string;
}

export interface PoolBalance {
  confirmed: number;
  pending: number;
}

export interface LifetimeStats {
  totalEarned: number;
  totalPrepaid: number;
  totalRedeemed: number;
}

export interface MonthlyEarning {
  merchantId: string;
  merchantName: string;
  amount: number;
  count: number;
}

// ============================================================
// LOAN DATA TYPE (matches existing calculator shape)
// ============================================================

export interface LoanData {
  outstandingBalance: number;
  originalAmount: number;
  interestRate: number;
  remainingTenure: number;
  currentEMI: number;
  extraPayment: number;
  livingExpenses: number;
}

// ============================================================
// ENGAGEMENT DATA (for UNLOQ1 Score calculation)
// ============================================================

export interface EngagementData {
  hasActiveStreak: boolean;
  streakMonths: number;
  hasRecentRedemption: boolean;
  profileCompleted: boolean;
  hasReferral: boolean;
  recentCalculatorUse: boolean;
  hasRecentCouponPurchase?: boolean; // Optional for backward compat during migration
}

export interface ScoreTier {
  tier: string;
  color: string;
  icon_key: string;
}
