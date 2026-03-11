import type { RewardEntry } from "@/app/lib/types";

const today = new Date().toISOString();
const daysAgo = (d: number) =>
  new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_USER_ID = "user_001";

export const rewardEntries: RewardEntry[] = [
  // 2 delivered (recent card purchases, cashback pending confirmation)
  {
    reward_id: "rew_delivered_1",
    user_id: MOCK_USER_ID,
    order_id: "ord_swiggy_001",
    merchant_id: "swiggy",
    reward_type: "coupon_cashback",
    user_share: 10,
    coins_credited: 100,
    status: "delivered",
    campaign_ref: "order_swiggy_500",
    status_history: [
      { status: "ordered", timestamp: daysAgo(2) },
      { status: "payment_confirmed", timestamp: daysAgo(2) },
      { status: "voucher_generated", timestamp: daysAgo(1) },
      { status: "delivered", timestamp: today },
    ],
    created_at: daysAgo(2),
    confirmed_at: null,
    redeemed_at: null,
  },
  {
    reward_id: "rew_delivered_2",
    user_id: MOCK_USER_ID,
    order_id: "ord_zomato_001",
    merchant_id: "zomato",
    reward_type: "coupon_cashback",
    user_share: 10,
    coins_credited: 100,
    status: "delivered",
    campaign_ref: "order_zomato_500",
    status_history: [
      { status: "ordered", timestamp: daysAgo(1) },
      { status: "payment_confirmed", timestamp: daysAgo(1) },
      { status: "voucher_generated", timestamp: today },
      { status: "delivered", timestamp: today },
    ],
    created_at: daysAgo(1),
    confirmed_at: null,
    redeemed_at: null,
  },
  // 2 voucher_generated (cards generated, awaiting delivery)
  {
    reward_id: "rew_voucher_1",
    user_id: MOCK_USER_ID,
    order_id: "ord_blinkit_001",
    merchant_id: "blinkit",
    reward_type: "coupon_cashback",
    user_share: 20,
    coins_credited: 200,
    status: "voucher_generated",
    campaign_ref: "order_blinkit_1000",
    status_history: [
      { status: "ordered", timestamp: daysAgo(3) },
      { status: "payment_confirmed", timestamp: daysAgo(3) },
      { status: "voucher_generated", timestamp: daysAgo(2) },
    ],
    created_at: daysAgo(3),
    confirmed_at: null,
    redeemed_at: null,
  },
  {
    reward_id: "rew_voucher_2",
    user_id: MOCK_USER_ID,
    order_id: "ord_zepto_001",
    merchant_id: "zepto",
    reward_type: "coupon_cashback",
    user_share: 15,
    coins_credited: 150,
    status: "voucher_generated",
    campaign_ref: "order_zepto_750",
    status_history: [
      { status: "ordered", timestamp: daysAgo(2) },
      { status: "payment_confirmed", timestamp: daysAgo(2) },
      { status: "voucher_generated", timestamp: daysAgo(1) },
    ],
    created_at: daysAgo(2),
    confirmed_at: null,
    redeemed_at: null,
  },
  // 3 confirmed (cashback in pool) - Swiggy ₹10, Amazon ₹25, Flipkart ₹15
  {
    reward_id: "rew_redeemed_1",
    user_id: MOCK_USER_ID,
    order_id: "ord_swiggy_002",
    merchant_id: "swiggy",
    reward_type: "coupon_cashback",
    user_share: 10,
    coins_credited: 100,
    status: "confirmed",
    campaign_ref: "order_swiggy_500",
    status_history: [
      { status: "ordered", timestamp: "2026-01-15T10:00:00Z" },
      { status: "payment_confirmed", timestamp: "2026-01-15T10:00:00Z" },
      { status: "voucher_generated", timestamp: "2026-01-15T11:00:00Z" },
      { status: "delivered", timestamp: "2026-01-15T12:00:00Z" },
      { status: "confirmed", timestamp: "2026-01-16T10:00:00Z" },
    ],
    created_at: "2026-01-15T10:00:00Z",
    confirmed_at: "2026-01-16T10:00:00Z",
    redeemed_at: null,
  },
  {
    reward_id: "rew_redeemed_2",
    user_id: MOCK_USER_ID,
    order_id: "ord_amazon_001",
    merchant_id: "amazon",
    reward_type: "coupon_cashback",
    user_share: 25,
    coins_credited: 250,
    status: "confirmed",
    campaign_ref: "order_amazon_1250",
    status_history: [
      { status: "ordered", timestamp: "2026-01-20T10:00:00Z" },
      { status: "payment_confirmed", timestamp: "2026-01-20T10:00:00Z" },
      { status: "voucher_generated", timestamp: "2026-01-20T11:00:00Z" },
      { status: "delivered", timestamp: "2026-01-20T12:00:00Z" },
      { status: "confirmed", timestamp: "2026-01-21T10:00:00Z" },
    ],
    created_at: "2026-01-20T10:00:00Z",
    confirmed_at: "2026-01-21T10:00:00Z",
    redeemed_at: null,
  },
  {
    reward_id: "rew_redeemed_3",
    user_id: MOCK_USER_ID,
    order_id: "ord_flipkart_001",
    merchant_id: "flipkart",
    reward_type: "coupon_cashback",
    user_share: 15,
    coins_credited: 150,
    status: "confirmed",
    campaign_ref: "order_flipkart_750",
    status_history: [
      { status: "ordered", timestamp: "2026-01-22T10:00:00Z" },
      { status: "payment_confirmed", timestamp: "2026-01-22T10:00:00Z" },
      { status: "voucher_generated", timestamp: "2026-01-22T11:00:00Z" },
      { status: "delivered", timestamp: "2026-01-22T12:00:00Z" },
      { status: "confirmed", timestamp: "2026-01-23T10:00:00Z" },
    ],
    created_at: "2026-01-22T10:00:00Z",
    confirmed_at: "2026-01-23T10:00:00Z",
    redeemed_at: null,
  },
  // 2 confirmed - platform_bonus (streak bonus, signup bonus)
  {
    reward_id: "rew_redeemed_4",
    user_id: MOCK_USER_ID,
    order_id: null,
    merchant_id: null,
    reward_type: "platform_bonus",
    user_share: 200,
    coins_credited: 2000,
    status: "confirmed",
    campaign_ref: "streak_bonus_feb2026",
    status_history: [{ status: "confirmed", timestamp: "2026-02-01T12:00:00Z" }],
    created_at: "2026-02-01T12:00:00Z",
    confirmed_at: "2026-02-01T12:00:00Z",
    redeemed_at: null,
  },
  {
    reward_id: "rew_redeemed_5",
    user_id: MOCK_USER_ID,
    order_id: null,
    merchant_id: null,
    reward_type: "platform_bonus",
    user_share: 100,
    coins_credited: 1000,
    status: "confirmed",
    campaign_ref: "signup_bonus_jan2026",
    status_history: [{ status: "confirmed", timestamp: "2026-01-20T14:00:00Z" }],
    created_at: "2026-01-20T14:00:00Z",
    confirmed_at: "2026-01-20T14:00:00Z",
    redeemed_at: null,
  },
  // 1 refunded (order refunded, cashback reversed)
  {
    reward_id: "rew_refunded_1",
    user_id: MOCK_USER_ID,
    order_id: "ord_myntra_001",
    merchant_id: "myntra",
    reward_type: "coupon_cashback",
    user_share: 0,
    coins_credited: 0,
    status: "refunded",
    campaign_ref: "order_myntra_500",
    status_history: [
      { status: "ordered", timestamp: "2026-01-10T10:00:00Z" },
      { status: "payment_confirmed", timestamp: "2026-01-10T10:00:00Z" },
      { status: "voucher_generated", timestamp: "2026-01-10T11:00:00Z" },
      { status: "refunded", timestamp: "2026-01-12T10:00:00Z" },
    ],
    created_at: "2026-01-10T10:00:00Z",
    confirmed_at: null,
    redeemed_at: null,
  },
];

// Pre-computed from the entries above
// Confirmed = entries with status "confirmed" (cashback credited to pool)
const confirmedEntries = rewardEntries.filter((e) => e.status === "confirmed");
// Pending = delivered + voucher_generated (cashback pending confirmation)
const pendingStatuses: readonly string[] = ["delivered", "voucher_generated"];
const pendingEntries = rewardEntries.filter((e) =>
  pendingStatuses.includes(e.status)
);

export const COMPUTED_CONFIRMED_BALANCE = confirmedEntries.reduce(
  (sum, e) => sum + e.user_share,
  0
);
export const COMPUTED_PENDING_BALANCE = pendingEntries.reduce(
  (sum, e) => sum + e.user_share,
  0
);
