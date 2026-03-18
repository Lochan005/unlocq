"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockLoanData = exports.mockUserProfile = void 0;
const rewardsMock_1 = require("./rewardsMock");
exports.mockUserProfile = {
    user_id: rewardsMock_1.MOCK_USER_ID,
    pool_balance_confirmed: rewardsMock_1.COMPUTED_CONFIRMED_BALANCE,
    pool_balance_pending: rewardsMock_1.COMPUTED_PENDING_BALANCE,
    coins_confirmed: rewardsMock_1.COMPUTED_CONFIRMED_BALANCE * 10,
    coins_pending: rewardsMock_1.COMPUTED_PENDING_BALANCE * 10,
    current_tier: "gold",
    current_streak_months: 4,
    streak_multiplier: 1.5,
    total_prepayments_count: 6,
    lifetime_earned: 12450,
    lifetime_prepaid_from_pool: 5000,
    auto_prepay_enabled: true,
    auto_prepay_threshold: 5000,
    total_cards_purchased: 12,
    profile_completed: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-02-12T00:00:00Z",
};
exports.mockLoanData = {
    outstandingBalance: 4000000,
    originalAmount: 5000000,
    interestRate: 9.0,
    remainingTenure: 15,
    currentEMI: 40571,
    extraPayment: 10000,
    livingExpenses: 15000,
};
