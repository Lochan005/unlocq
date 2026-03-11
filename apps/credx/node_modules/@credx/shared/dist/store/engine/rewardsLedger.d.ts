import type { RewardEntry, PoolBalance, LifetimeStats, MonthlyEarning } from "../../types";
export declare function getPoolBalance(userId: string): PoolBalance;
export declare function getRecentActivity(userId: string, limit?: number): RewardEntry[];
export declare function getMonthlyEarnings(userId: string): MonthlyEarning[];
export declare function getLifetimeStats(userId: string): LifetimeStats;
export declare function redeemFromPool(userId: string, amount: number, redemptionType: "prepay" | "voucher"): {
    success: boolean;
    message: string;
    redeemedAmount?: number;
};
export declare function addPlatformBonus(userId: string, action: string, coins: number): RewardEntry;
export declare function creditCashback(userId: string, orderId: string, merchantId: string, cashbackAmount: number): {
    entry: RewardEntry;
};
/**
 * Reverses the most recent redemption for a user by flipping "redeemed"
 * entries back to "confirmed". Used when the user navigates away from
 * the pay-now page without completing the (mock) payment.
 */
export declare function restoreRecentRedemption(userId: string): {
    success: boolean;
    restoredAmount: number;
};
export declare function resetLedger(): void;
//# sourceMappingURL=rewardsLedger.d.ts.map