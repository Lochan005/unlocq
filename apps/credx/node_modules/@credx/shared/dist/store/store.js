"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRewardsStore = void 0;
const zustand_1 = require("zustand");
const userMock_1 = require("./data/userMock");
const rewardsMock_1 = require("./data/rewardsMock");
// Earn actions: base set + first_card_purchase and purchase_streak from earn-actions.json
const EARN_ACTIONS = [
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
exports.useRewardsStore = (0, zustand_1.create)((set, get) => ({
    userProfile: null,
    loanData: userMock_1.mockLoanData,
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        set({ isLoading: true, error: null });
        try {
            const [merchantsRes, ledgerRes, profileRes, catalogueRes, ordersRes] = await Promise.all([
                fetch("/api/rewards/merchants"),
                fetch(`/api/rewards/ledger?userId=${rewardsMock_1.MOCK_USER_ID}`),
                fetch(`/api/rewards/profile?userId=${rewardsMock_1.MOCK_USER_ID}`),
                fetch("/api/rewards/catalogue"),
                fetch(`/api/rewards/my-cards?userId=${rewardsMock_1.MOCK_USER_ID}`),
            ]);
            const merchantsData = merchantsRes.ok ? await merchantsRes.json() : null;
            const ledgerData = ledgerRes.ok ? await ledgerRes.json() : null;
            const profileData = profileRes.ok ? await profileRes.json() : null;
            const catalogueData = catalogueRes.ok ? await catalogueRes.json() : null;
            const ordersData = ordersRes.ok ? await ordersRes.json() : null;
            if (!merchantsRes.ok)
                throw new Error("Failed to fetch merchants");
            if (!ledgerRes.ok)
                throw new Error("Failed to fetch ledger");
            if (!profileRes.ok)
                throw new Error("Failed to fetch profile");
            set({
                merchantGrid: (_a = merchantsData === null || merchantsData === void 0 ? void 0 : merchantsData.data) !== null && _a !== void 0 ? _a : [],
                poolBalance: (_c = (_b = ledgerData === null || ledgerData === void 0 ? void 0 : ledgerData.data) === null || _b === void 0 ? void 0 : _b.poolBalance) !== null && _c !== void 0 ? _c : { confirmed: 0, pending: 0 },
                recentActivity: (_e = (_d = ledgerData === null || ledgerData === void 0 ? void 0 : ledgerData.data) === null || _d === void 0 ? void 0 : _d.recentActivity) !== null && _e !== void 0 ? _e : [],
                monthlyEarnings: (_g = (_f = ledgerData === null || ledgerData === void 0 ? void 0 : ledgerData.data) === null || _f === void 0 ? void 0 : _f.monthlyEarnings) !== null && _g !== void 0 ? _g : [],
                lifetimeStats: (_j = (_h = ledgerData === null || ledgerData === void 0 ? void 0 : ledgerData.data) === null || _h === void 0 ? void 0 : _h.lifetimeStats) !== null && _j !== void 0 ? _j : { totalEarned: 0, totalPrepaid: 0, totalRedeemed: 0 },
                userProfile: (_k = profileData === null || profileData === void 0 ? void 0 : profileData.data) !== null && _k !== void 0 ? _k : null,
                catalogue: (_l = catalogueData === null || catalogueData === void 0 ? void 0 : catalogueData.data) !== null && _l !== void 0 ? _l : [],
                userOrders: (_m = ordersData === null || ordersData === void 0 ? void 0 : ordersData.data) !== null && _m !== void 0 ? _m : [],
            });
        }
        catch (err) {
            set({ error: err instanceof Error ? err.message : "Failed to load data" });
        }
        finally {
            set({ isLoading: false });
        }
    },
    purchaseCoupon: async (itemId, paymentMethod) => {
        var _a, _b, _c;
        try {
            const res = await fetch("/api/rewards/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: rewardsMock_1.MOCK_USER_ID,
                    itemId,
                    paymentMethod,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                return {
                    success: false,
                    message: (_a = data === null || data === void 0 ? void 0 : data.error) !== null && _a !== void 0 ? _a : "Purchase failed",
                };
            }
            await get().refreshData();
            return {
                success: true,
                order: (_c = (_b = data === null || data === void 0 ? void 0 : data.data) === null || _b === void 0 ? void 0 : _b.order) !== null && _c !== void 0 ? _c : null,
                message: "Purchase successful",
            };
        }
        catch (err) {
            return {
                success: false,
                message: err instanceof Error ? err.message : "Purchase failed",
            };
        }
    },
    fetchCatalogue: async (category) => {
        var _a;
        try {
            const url = category
                ? `/api/rewards/catalogue?category=${encodeURIComponent(category)}`
                : "/api/rewards/catalogue";
            const res = await fetch(url);
            const data = await res.json();
            if (res.ok) {
                set({ catalogue: (_a = data === null || data === void 0 ? void 0 : data.data) !== null && _a !== void 0 ? _a : [] });
            }
        }
        catch (_b) {
            set({ catalogue: [] });
        }
    },
    fetchUserOrders: async () => {
        var _a;
        try {
            const res = await fetch(`/api/rewards/my-cards?userId=${rewardsMock_1.MOCK_USER_ID}`);
            const data = await res.json();
            if (res.ok) {
                set({ userOrders: (_a = data === null || data === void 0 ? void 0 : data.data) !== null && _a !== void 0 ? _a : [] });
            }
        }
        catch (_b) {
            set({ userOrders: [] });
        }
    },
    setSelectedMerchant: (merchantId) => {
        set({ selectedMerchant: merchantId });
    },
    redeemPool: async (amount, type) => {
        var _a, _b, _c, _d;
        try {
            const res = await fetch("/api/rewards/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: rewardsMock_1.MOCK_USER_ID, amount, type }),
            });
            const data = await res.json();
            const result = (_a = data.data) !== null && _a !== void 0 ? _a : data;
            if (result === null || result === void 0 ? void 0 : result.success) {
                await get().refreshData();
            }
            return {
                success: (_b = result === null || result === void 0 ? void 0 : result.success) !== null && _b !== void 0 ? _b : false,
                message: (_c = result === null || result === void 0 ? void 0 : result.message) !== null && _c !== void 0 ? _c : ((_d = data === null || data === void 0 ? void 0 : data.error) !== null && _d !== void 0 ? _d : "Redemption failed"),
            };
        }
        catch (err) {
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
                body: JSON.stringify({ userId: rewardsMock_1.MOCK_USER_ID, type: "restore" }),
            });
            if (res.ok) {
                await get().refreshData();
            }
        }
        catch (_a) {
            // Silent — best-effort restore on unmount
        }
    },
    addBonus: async (action, coins) => {
        try {
            set((state) => ({
                poolBalance: Object.assign(Object.assign({}, state.poolBalance), { confirmed: state.poolBalance.confirmed + coins / 10 }),
            }));
            const res = await fetch("/api/rewards/bonus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: rewardsMock_1.MOCK_USER_ID, action, coins }),
            });
            if (!res.ok)
                throw new Error("Failed to add bonus");
            await get().refreshData();
        }
        catch (err) {
            set((state) => ({
                poolBalance: Object.assign(Object.assign({}, state.poolBalance), { confirmed: Math.max(0, state.poolBalance.confirmed - coins / 10) }),
            }));
            throw err;
        }
    },
    updateLoanData: (partial) => {
        set((state) => ({
            loanData: Object.assign(Object.assign({}, state.loanData), partial),
        }));
    },
    setAutoPrepayThreshold: (amount) => {
        set((state) => ({
            userProfile: state.userProfile
                ? Object.assign(Object.assign({}, state.userProfile), { auto_prepay_threshold: amount }) : null,
        }));
    },
    toggleAutoPrepay: () => {
        set((state) => ({
            userProfile: state.userProfile
                ? Object.assign(Object.assign({}, state.userProfile), { auto_prepay_enabled: !state.userProfile.auto_prepay_enabled }) : null,
        }));
    },
}));
