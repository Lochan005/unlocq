// Data
export { couponCatalogue } from "./data/couponCatalogue";
export { rewardEntries, MOCK_USER_ID, COMPUTED_CONFIRMED_BALANCE, COMPUTED_PENDING_BALANCE } from "./data/rewardsMock";
export { mockUserProfile, mockLoanData } from "./data/userMock";

// Engine
export { getCatalogue, getCatalogueItem, getMerchantDenominations, getMerchantStock, getAllMerchantsWithStatus } from "./engine/catalogueEngine";
export { initiatePurchase, confirmPayment, generateVoucher, deliverVoucher, getOrderById, getUserOrders, getOrderStore } from "./engine/purchaseEngine";
export { getPoolBalance, getRecentActivity, getMonthlyEarnings, getLifetimeStats, redeemFromPool, restoreRecentRedemption, addPlatformBonus, creditCashback, resetLedger } from "./engine/rewardsLedger";

// Store
export { useRewardsStore } from "./store";
