// ============================================================
// ENUMS / UNION TYPES
// ============================================================

export type RewardStatus =
  | "tracked"
  | "pending"
  | "under_confirmation"
  | "confirmed"
  | "redeemed"
  | "rejected";

export type RewardType =
  | "affiliate"
  | "platform_bonus"
  | "non_monetary";

export type RewardBasis =
  | "affiliate"
  | "platform"
  | "none";

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

// ============================================================
// DATA MODEL INTERFACES
// ============================================================

export interface MerchantRoute {
  route_id: string;
  merchant_id: string;
  merchant_display_name: string;
  merchant_logo_url: string; // For MVP, this will be an emoji string
  category: MerchantCategory;
  network: string; // e.g., "cuelinks", "admitad", "vcommission", "direct"
  priority: number; // 1 = highest
  reward_active: boolean;
  valid_from: string; // ISO date string
  valid_till: string; // ISO date string
  expected_commission_pct: number; // INTERNAL ONLY — never displayed to users
  cap_amount: number; // Maximum reward per transaction in ₹
  created_at: string;
  updated_at: string;
}

export interface ClickEvent {
  click_id: string;
  user_id: string;
  merchant_id: string;
  route_id: string | null; // null when no active route exists
  network: string | null;
  reward_expected: boolean;
  reward_basis: RewardBasis;
  redirect_url: string;
  timestamp: string; // ISO datetime
  user_agent: string;
  ip_hash: string;
}

export interface RewardEntry {
  reward_id: string;
  user_id: string;
  click_id: string | null; // null for platform-funded bonuses
  merchant_id: string | null; // null for platform-funded bonuses
  network: string | null;
  reward_type: RewardType;
  gross_commission: number; // What the network pays — 0 for platform-funded
  platform_topup: number; // Streak/tier multiplier bonus funded by UnLoQ1
  user_share: number; // gross_commission × share_pct + platform_topup
  coins_credited: number; // user_share × 10
  status: RewardStatus;
  campaign_ref: string; // Identifies the route or internal campaign
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
  streak_multiplier: number; // 1.0, 1.5, 2.0, 2.5, 3.0
  total_prepayments_count: number;
  lifetime_earned: number;
  lifetime_prepaid_from_pool: number;
  auto_prepay_enabled: boolean;
  auto_prepay_threshold: number;
  consent_affiliate_tracking: boolean;
  consent_granted_at: string | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
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
  status: "active" | "inactive";
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
// ENGAGEMENT DATA (for UnLoQ1 Score calculation)
// ============================================================

export interface EngagementData {
  hasActiveStreak: boolean;
  streakMonths: number;
  hasRecentRedemption: boolean;
  profileCompleted: boolean;
  hasReferral: boolean;
  recentCalculatorUse: boolean;
}

export interface ScoreTier {
  tier: string;
  color: string;
  icon_key: string;
}
