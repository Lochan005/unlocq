import type { UserRewardsProfile, LoanData, RewardEntry, MerchantWithStatus, EarnAction, PoolBalance, LifetimeStats, MonthlyEarning, CatalogueItem, CouponOrder, MerchantCategory } from "../types";
interface RewardsState {
    userProfile: UserRewardsProfile | null;
    loanData: LoanData;
    poolBalance: PoolBalance;
    recentActivity: RewardEntry[];
    merchantGrid: MerchantWithStatus[];
    catalogue: CatalogueItem[];
    userOrders: CouponOrder[];
    selectedMerchant: string | null;
    earnActions: EarnAction[];
    monthlyEarnings: MonthlyEarning[];
    lifetimeStats: LifetimeStats;
    isLoading: boolean;
    error: string | null;
    refreshData: () => Promise<void>;
    purchaseCoupon: (itemId: string, paymentMethod: "upi" | "card" | "net_banking") => Promise<{
        success: boolean;
        order?: CouponOrder;
        message: string;
    }>;
    fetchCatalogue: (category?: MerchantCategory) => Promise<void>;
    fetchUserOrders: () => Promise<void>;
    setSelectedMerchant: (merchantId: string | null) => void;
    redeemPool: (amount: number, type: "prepay" | "voucher") => Promise<{
        success: boolean;
        message: string;
    }>;
    restorePool: () => Promise<void>;
    addBonus: (action: string, coins: number) => Promise<void>;
    updateLoanData: (partial: Partial<LoanData>) => void;
    setAutoPrepayThreshold: (amount: number) => void;
    toggleAutoPrepay: () => void;
}
export declare const useRewardsStore: import("zustand").UseBoundStore<import("zustand").StoreApi<RewardsState>>;
export {};
//# sourceMappingURL=store.d.ts.map