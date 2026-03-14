import { create } from "zustand";
import type {
  UserRewardsProfile,
  LoanData,
  RewardEntry,
  MerchantWithStatus,
  EarnAction,
  PoolBalance,
  LifetimeStats,
  MonthlyEarning,
  CatalogueItem,
  CouponOrder,
  MerchantCategory,
} from "../types";
import { mockLoanData } from "./data/userMock";
import { MOCK_USER_ID } from "./data/rewardsMock";

// Earn actions: base set + first_card_purchase and purchase_streak from earn-actions.json
const EARN_ACTIONS: EarnAction[] = [
  { action_id: "signup", action_name: "Sign up", coins: 100, type: "one-time", icon_key: "signup", description: "Create your UNLOQ1 account" },
  { action_id: "complete_profile", action_name: "Complete profile", coins: 50, type: "one-time", icon_key: "complete_profile", description: "Fill in your loan and personal details" },
  { action_id: "first_prepayment", action_name: "First prepayment", coins: 500, type: "one-time", icon_key: "first_prepayment", description: "Make your first loan prepayment" },
  { action_id: "per_1k_prepaid", action_name: "Every ₹1,000 prepaid", coins: 10, type: "recurring", icon_key: "per_1k_prepaid", description: "Earn coins for every ₹1,000 you prepay" },
  { action_id: "set_reminder", action_name: "Set a reminder", coins: 25, type: "one-time", icon_key: "set_reminder", description: "Set your first prepayment reminder" },
  { action_id: "monthly_streak", action_name: "Monthly prepay streak", coins: 200, type: "bonus", icon_key: "monthly_streak", description: "Prepay every month to maintain your streak" },
  { action_id: "referral", action_name: "Refer a friend", coins: 250, type: "recurring", icon_key: "referral", description: "Invite someone to join UNLOQ1" },
  { action_id: "friend_first_prepay", action_name: "Friend's first prepay", coins: 500, type: "bonus", icon_key: "friend_first_prepay", description: "Earn when your referred friend makes their first prepayment" },
  { action_id: "first_card_purchase", action_name: "First card purchase", coins: 200, type: "one-time", icon_key: "first_card_purchase", description: "Buy your first coupon card on UNLOQ1" },
  { action_id: "purchase_streak", action_name: "Weekly purchase streak", coins: 100, type: "bonus", icon_key: "purchase_streak", description: "Buy at least one card every week for 4 weeks" },
];

interface RewardsState {
  // --- Data ---
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

  // --- Actions ---
  refreshData: () => Promise<void>;
  purchaseCoupon: (itemId: string, paymentMethod: "upi" | "card" | "net_banking") => Promise<{ success: boolean; order?: CouponOrder; message: string }>;
  fetchCatalogue: (category?: MerchantCategory) => Promise<void>;
  fetchUserOrders: () => Promise<void>;
  setSelectedMerchant: (merchantId: string | null) => void;
  redeemPool: (amount: number, type: "prepay" | "voucher") => Promise<{ success: boolean; message: string }>;
  restorePool: () => Promise<void>;
  addBonus: (action: string, coins: number) => Promise<void>;
  updateLoanData: (partial: Partial<LoanData>) => void;
  setAutoPrepayThreshold: (amount: number) => void;
  toggleAutoPrepay: () => void;
}

export const useRewardsStore = create<RewardsState>((set, get) => ({
  userProfile: null,
  loanData: mockLoanData,
  poolBalance: { confirmed: 0, pending: 0 },
  recentActivity: [],
  merchantGrid: [],
  catalogue: [],
  userOrders: [],
  selectedMerchant: null,
  earnActions: EARN_ACTIONS,
  monthlyEarnings: [],
  lifetimeStats: { totalEarned: 0, totalPrepaid: 0, totalRedeemed: 0 },
  isLoading: false,
  error: null,

  refreshData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [merchantsRes, ledgerRes, profileRes, catalogueRes, ordersRes] = await Promise.all([
        fetch("/api/rewards/merchants"),
        fetch(`/api/rewards/ledger?userId=${MOCK_USER_ID}`),
        fetch(`/api/rewards/profile?userId=${MOCK_USER_ID}`),
        fetch("/api/rewards/catalogue"),
        fetch(`/api/rewards/my-cards?userId=${MOCK_USER_ID}`),
      ]);

      const merchantsData = merchantsRes.ok ? (await merchantsRes.json()) as { data?: unknown } : null;
      const ledgerData = ledgerRes.ok ? (await ledgerRes.json()) as { data?: { poolBalance?: unknown; recentActivity?: unknown; monthlyEarnings?: unknown; lifetimeStats?: unknown } } : null;
      const profileData = profileRes.ok ? (await profileRes.json()) as { data?: unknown } : null;
      const catalogueData = catalogueRes.ok ? (await catalogueRes.json()) as { data?: unknown } : null;
      const ordersData = ordersRes.ok ? (await ordersRes.json()) as { data?: unknown } : null;

      if (!merchantsRes.ok) throw new Error("Failed to fetch merchants");
      if (!ledgerRes.ok) throw new Error("Failed to fetch ledger");
      if (!profileRes.ok) throw new Error("Failed to fetch profile");

      set({
        merchantGrid: (merchantsData?.data ?? []) as MerchantWithStatus[],
        poolBalance: (ledgerData?.data?.poolBalance ?? { confirmed: 0, pending: 0 }) as PoolBalance,
        recentActivity: (ledgerData?.data?.recentActivity ?? []) as RewardEntry[],
        monthlyEarnings: (ledgerData?.data?.monthlyEarnings ?? []) as MonthlyEarning[],
        lifetimeStats: (ledgerData?.data?.lifetimeStats ?? { totalEarned: 0, totalPrepaid: 0, totalRedeemed: 0 }) as LifetimeStats,
        userProfile: (profileData?.data ?? null) as UserRewardsProfile | null,
        catalogue: (catalogueData?.data ?? []) as CatalogueItem[],
        userOrders: (ordersData?.data ?? []) as CouponOrder[],
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load data" });
    } finally {
      set({ isLoading: false });
    }
  },

  purchaseCoupon: async (itemId: string, paymentMethod: "upi" | "card" | "net_banking") => {
    try {
      const res = await fetch("/api/rewards/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: MOCK_USER_ID,
          itemId,
          paymentMethod,
        }),
      });
      const data = (await res.json()) as { data?: { order?: unknown }; error?: string };

      if (!res.ok) {
        return {
          success: false,
          message: data?.error ?? "Purchase failed",
        };
      }

      await get().refreshData();

      return {
        success: true,
        order: (data?.data?.order ?? null) as CouponOrder | undefined,
        message: "Purchase successful",
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Purchase failed",
      };
    }
  },

  fetchCatalogue: async (category) => {
    try {
      const url = category
        ? `/api/rewards/catalogue?category=${encodeURIComponent(category)}`
        : "/api/rewards/catalogue";
      const res = await fetch(url);
      const data = (await res.json()) as { data?: unknown };
      if (res.ok) {
        set({ catalogue: (data?.data ?? []) as CatalogueItem[] });
      }
    } catch {
      set({ catalogue: [] });
    }
  },

  fetchUserOrders: async () => {
    try {
      const res = await fetch(`/api/rewards/my-cards?userId=${MOCK_USER_ID}`);
      const data = (await res.json()) as { data?: unknown };
      if (res.ok) {
        set({ userOrders: (data?.data ?? []) as CouponOrder[] });
      }
    } catch {
      set({ userOrders: [] });
    }
  },

  setSelectedMerchant: (merchantId: string | null) => {
    set({ selectedMerchant: merchantId });
  },

  redeemPool: async (amount: number, type: "prepay" | "voucher") => {
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: MOCK_USER_ID, amount, type }),
      });
      const data = (await res.json()) as { data?: { success?: boolean; message?: string }; success?: boolean; message?: string; error?: string };
      const result = data.data ?? data;
      const success = result?.success ?? data?.success ?? false;
      const message = result?.message ?? data?.message ?? data?.error ?? "Redemption failed";

      if (success) {
        await get().refreshData();
      }

      return {
        success,
        message,
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Redemption failed",
      };
    }
  },

  restorePool: async () => {
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: MOCK_USER_ID, type: "restore" }),
      });
      if (res.ok) {
        await get().refreshData();
      }
    } catch {
      // Silent — best-effort restore on unmount
    }
  },

  addBonus: async (action: string, coins: number) => {
    try {
      set((state) => ({
        poolBalance: {
          ...state.poolBalance,
          confirmed: state.poolBalance.confirmed + coins / 10,
        },
      }));

      const res = await fetch("/api/rewards/bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: MOCK_USER_ID, action, coins }),
      });

      if (!res.ok) throw new Error("Failed to add bonus");

      await get().refreshData();
    } catch (err) {
      set((state) => ({
        poolBalance: {
          ...state.poolBalance,
          confirmed: Math.max(0, state.poolBalance.confirmed - coins / 10),
        },
      }));
      throw err;
    }
  },

  updateLoanData: (partial) => {
    set((state) => ({
      loanData: { ...state.loanData, ...partial },
    }));
  },

  setAutoPrepayThreshold: (amount: number) => {
    set((state) => ({
      userProfile: state.userProfile
        ? { ...state.userProfile, auto_prepay_threshold: amount }
        : null,
    }));
  },

  toggleAutoPrepay: () => {
    set((state) => ({
      userProfile: state.userProfile
        ? { ...state.userProfile, auto_prepay_enabled: !state.userProfile.auto_prepay_enabled }
        : null,
    }));
  },
}));
