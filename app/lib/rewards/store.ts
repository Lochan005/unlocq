"use client";

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
} from "@/app/lib/types";
import { mockLoanData } from "@/app/lib/rewards/data/userMock";

const MOCK_USER_ID = "user_001";

// Static earn actions (inline for client component compatibility)
const EARN_ACTIONS: EarnAction[] = [
  { action_id: "signup", action_name: "Sign up", coins: 100, type: "one-time", icon_key: "signup", description: "Create your UnLoQ1 account" },
  { action_id: "complete_profile", action_name: "Complete profile", coins: 50, type: "one-time", icon_key: "complete_profile", description: "Fill in your loan and personal details" },
  { action_id: "first_prepayment", action_name: "First prepayment", coins: 500, type: "one-time", icon_key: "first_prepayment", description: "Make your first loan prepayment" },
  { action_id: "per_1k_prepaid", action_name: "Every ₹1,000 prepaid", coins: 10, type: "recurring", icon_key: "per_1k_prepaid", description: "Earn coins for every ₹1,000 you prepay" },
  { action_id: "set_reminder", action_name: "Set a reminder", coins: 25, type: "one-time", icon_key: "set_reminder", description: "Set your first prepayment reminder" },
  { action_id: "monthly_streak", action_name: "Monthly prepay streak", coins: 200, type: "bonus", icon_key: "monthly_streak", description: "Prepay every month to maintain your streak" },
  { action_id: "referral", action_name: "Refer a friend", coins: 250, type: "recurring", icon_key: "referral", description: "Invite someone to join UnLoQ1" },
  { action_id: "friend_first_prepay", action_name: "Friend's first prepay", coins: 500, type: "bonus", icon_key: "friend_first_prepay", description: "Earn when your referred friend makes their first prepayment" },
];

interface RewardsState {
  // --- Data ---
  userProfile: UserRewardsProfile | null;
  loanData: LoanData;
  poolBalance: PoolBalance;
  recentActivity: RewardEntry[];
  merchantGrid: MerchantWithStatus[];
  earnActions: EarnAction[];
  monthlyEarnings: MonthlyEarning[];
  lifetimeStats: LifetimeStats;
  consentGranted: boolean;

  // --- Loading / Error ---
  isLoading: boolean;
  error: string | null;

  // --- Actions ---
  refreshData: () => Promise<void>;
  handleShopClick: (merchantId: string) => Promise<{ rewardExpected: boolean; redirectUrl: string }>;
  redeemPool: (amount: number, type: "prepay" | "voucher" | "donate") => Promise<{ success: boolean; message: string }>;
  restorePool: () => Promise<void>;
  addBonus: (action: string, coins: number) => Promise<void>;
  updateLoanData: (partial: Partial<LoanData>) => void;
  setAutoPrepayThreshold: (amount: number) => void;
  toggleAutoPrepay: () => void;
  grantConsent: () => void;
}

export const useRewardsStore = create<RewardsState>((set, get) => ({
  userProfile: null,
  loanData: mockLoanData,
  poolBalance: { confirmed: 0, pending: 0 },
  recentActivity: [],
  merchantGrid: [],
  earnActions: EARN_ACTIONS,
  monthlyEarnings: [],
  lifetimeStats: { totalEarned: 0, totalPrepaid: 0, totalRedeemed: 0 },
  consentGranted: false,
  isLoading: false,
  error: null,

  refreshData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [merchantsRes, ledgerRes, profileRes] = await Promise.all([
        fetch("/api/rewards/merchants"),
        fetch(`/api/rewards/ledger?userId=${MOCK_USER_ID}`),
        fetch(`/api/rewards/profile?userId=${MOCK_USER_ID}`),
      ]);

      const merchantsData = merchantsRes.ok ? await merchantsRes.json() : null;
      const ledgerData = ledgerRes.ok ? await ledgerRes.json() : null;
      const profileData = profileRes.ok ? await profileRes.json() : null;

      if (!merchantsRes.ok) throw new Error("Failed to fetch merchants");
      if (!ledgerRes.ok) throw new Error("Failed to fetch ledger");
      if (!profileRes.ok) throw new Error("Failed to fetch profile");

      set({
        merchantGrid: merchantsData?.data ?? [],
        poolBalance: ledgerData?.data?.poolBalance ?? { confirmed: 0, pending: 0 },
        recentActivity: ledgerData?.data?.recentActivity ?? [],
        monthlyEarnings: ledgerData?.data?.monthlyEarnings ?? [],
        lifetimeStats: ledgerData?.data?.lifetimeStats ?? { totalEarned: 0, totalPrepaid: 0, totalRedeemed: 0 },
        userProfile: profileData?.data ?? null,
        consentGranted: profileData?.data?.consent_affiliate_tracking ?? false,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load data" });
    } finally {
      set({ isLoading: false });
    }
  },

  handleShopClick: async (merchantId: string) => {
    try {
      const res = await fetch("/api/rewards/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: MOCK_USER_ID, merchantId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to process click");

      await get().refreshData();

      return {
        rewardExpected: data.rewardExpected ?? false,
        redirectUrl: data.data?.redirect_url ?? `https://www.${merchantId}.com`,
      };
    } catch (err) {
      throw err;
    }
  },

  redeemPool: async (amount: number, type: "prepay" | "voucher" | "donate") => {
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: MOCK_USER_ID, amount, type }),
      });
      const data = await res.json();
      const result = data.data ?? data;

      if (result?.success) {
        await get().refreshData();
      }

      return {
        success: result?.success ?? false,
        message: result?.message ?? (data?.error ?? "Redemption failed"),
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

  // TODO: Consent resets on full page reload since there's no real backend — persist to localStorage or API when available
  grantConsent: () => {
    const now = new Date().toISOString();
    set((state) => ({
      consentGranted: true,
      userProfile: state.userProfile
        ? { ...state.userProfile, consent_affiliate_tracking: true, consent_granted_at: now }
        : null,
    }));
  },
}));
