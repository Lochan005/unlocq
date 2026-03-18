"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolBalance = getPoolBalance;
exports.getRecentActivity = getRecentActivity;
exports.getMonthlyEarnings = getMonthlyEarnings;
exports.getLifetimeStats = getLifetimeStats;
exports.redeemFromPool = redeemFromPool;
exports.addPlatformBonus = addPlatformBonus;
exports.creditCashback = creditCashback;
exports.restoreRecentRedemption = restoreRecentRedemption;
exports.resetLedger = resetLedger;
const rewardsMock_1 = require("../data/rewardsMock");
const currency_1 = require("../../utils/currency");
const merchants_json_1 = __importDefault(require("../data/merchants.json"));
let ledger = [...rewardsMock_1.rewardEntries];
const merchants = merchants_json_1.default;
function getMerchantName(merchantId) {
    var _a;
    if (!merchantId)
        return "Platform Bonuses";
    const m = merchants.find((x) => x.merchant_id === merchantId);
    return (_a = m === null || m === void 0 ? void 0 : m.display_name) !== null && _a !== void 0 ? _a : merchantId;
}
function getPoolBalance(userId) {
    // Confirmed = cashback credits in pool (status "confirmed")
    const confirmed = ledger
        .filter((e) => e.user_id === userId && e.status === "confirmed")
        .reduce((sum, e) => sum + e.user_share, 0);
    // Pending = delivered or voucher_generated (cashback pending confirmation)
    const pending = ledger
        .filter((e) => e.user_id === userId &&
        (e.status === "delivered" || e.status === "voucher_generated"))
        .reduce((sum, e) => sum + e.user_share, 0);
    return { confirmed, pending };
}
function getRecentActivity(userId, limit = 10) {
    return ledger
        .filter((e) => e.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
}
function getMonthlyEarnings(userId) {
    var _a;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const entries = ledger.filter((e) => e.user_id === userId && e.status === "confirmed" && e.confirmed_at);
    const byMonth = entries.filter((e) => {
        const d = new Date(e.confirmed_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const grouped = new Map();
    for (const e of byMonth) {
        const mid = (_a = e.merchant_id) !== null && _a !== void 0 ? _a : "platform";
        const existing = grouped.get(mid);
        if (existing) {
            existing.amount += e.user_share;
            existing.count += 1;
        }
        else {
            grouped.set(mid, {
                merchantId: mid,
                merchantName: getMerchantName(e.merchant_id),
                amount: e.user_share,
                count: 1,
            });
        }
    }
    return Array.from(grouped.values());
}
function getLifetimeStats(userId) {
    const allExceptRefunded = ledger.filter((e) => e.user_id === userId && e.status !== "refunded");
    const totalEarned = allExceptRefunded.reduce((sum, e) => sum + e.user_share, 0);
    const redeemedEntries = ledger.filter((e) => e.user_id === userId && e.status === "redeemed");
    const totalPrepaid = redeemedEntries.reduce((sum, e) => sum + e.user_share, 0);
    return {
        totalEarned,
        totalPrepaid,
        totalRedeemed: totalPrepaid,
    };
}
function redeemFromPool(userId, amount, redemptionType) {
    const { confirmed } = getPoolBalance(userId);
    if (amount <= 0) {
        return { success: false, message: "Amount must be greater than zero" };
    }
    if (amount > confirmed) {
        return {
            success: false,
            message: `Insufficient confirmed balance. Available: ${(0, currency_1.formatCurrency)(confirmed)}`,
        };
    }
    const confirmedEntries = ledger
        .filter((e) => e.user_id === userId && e.status === "confirmed")
        .sort((a, b) => new Date(a.confirmed_at).getTime() -
        new Date(b.confirmed_at).getTime());
    let redeemedSum = 0;
    const now = new Date().toISOString();
    for (const entry of confirmedEntries) {
        if (redeemedSum >= amount)
            break;
        const idx = ledger.findIndex((e) => e.reward_id === entry.reward_id);
        if (idx >= 0) {
            ledger[idx] = Object.assign(Object.assign({}, ledger[idx]), { status: "redeemed", redeemed_at: now, status_history: [
                    ...ledger[idx].status_history,
                    { status: "redeemed", timestamp: now },
                ] });
        }
        redeemedSum += entry.user_share;
    }
    return {
        success: true,
        message: `Successfully redeemed ${(0, currency_1.formatCurrency)(amount)} via ${redemptionType}`,
        redeemedAmount: amount,
    };
}
function addPlatformBonus(userId, action, coins) {
    const now = new Date().toISOString();
    const userShare = coins / 10;
    const entry = {
        reward_id: crypto.randomUUID(),
        user_id: userId,
        order_id: null,
        merchant_id: null,
        reward_type: "platform_bonus",
        user_share: userShare,
        coins_credited: coins,
        status: "confirmed",
        campaign_ref: `platform_${action}`,
        status_history: [{ status: "confirmed", timestamp: now }],
        created_at: now,
        confirmed_at: now,
        redeemed_at: null,
    };
    ledger.push(entry);
    return entry;
}
function creditCashback(userId, orderId, merchantId, cashbackAmount) {
    const now = new Date().toISOString();
    const coinsCredited = Math.round(cashbackAmount * 10);
    const entry = {
        reward_id: crypto.randomUUID(),
        user_id: userId,
        order_id: orderId,
        merchant_id: merchantId,
        reward_type: "coupon_cashback",
        user_share: cashbackAmount,
        coins_credited: coinsCredited,
        status: "confirmed",
        campaign_ref: `order_${orderId}`,
        status_history: [{ status: "confirmed", timestamp: now }],
        created_at: now,
        confirmed_at: now,
        redeemed_at: null,
    };
    ledger.push(entry);
    return { entry };
}
/**
 * Reverses the most recent redemption for a user by flipping "redeemed"
 * entries back to "confirmed". Used when the user navigates away from
 * the pay-now page without completing the (mock) payment.
 */
function restoreRecentRedemption(userId) {
    const redeemed = ledger.filter((e) => e.user_id === userId && e.status === "redeemed" && e.redeemed_at);
    if (redeemed.length === 0) {
        return { success: false, restoredAmount: 0 };
    }
    const latestRedeemedAt = redeemed.reduce((latest, e) => e.redeemed_at > latest ? e.redeemed_at : latest, redeemed[0].redeemed_at);
    let restoredAmount = 0;
    for (const entry of redeemed) {
        if (entry.redeemed_at !== latestRedeemedAt)
            continue;
        const idx = ledger.findIndex((e) => e.reward_id === entry.reward_id);
        if (idx >= 0) {
            ledger[idx] = Object.assign(Object.assign({}, ledger[idx]), { status: "confirmed", redeemed_at: null, status_history: ledger[idx].status_history.filter((h) => h.status !== "redeemed" || h.timestamp !== latestRedeemedAt) });
            restoredAmount += entry.user_share;
        }
    }
    return { success: true, restoredAmount };
}
function resetLedger() {
    ledger = [...rewardsMock_1.rewardEntries];
}
