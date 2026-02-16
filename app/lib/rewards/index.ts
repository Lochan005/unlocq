// Data
export { merchantRoutes } from "./data/merchantRoutes";
export {
  rewardEntries,
  MOCK_USER_ID,
  COMPUTED_CONFIRMED_BALANCE,
  COMPUTED_PENDING_BALANCE,
} from "./data/rewardsMock";
export { mockUserProfile, mockLoanData } from "./data/userMock";

// Engine
export {
  getActiveRoutes,
  resolveRoute,
  getMerchantStatus,
  getAllMerchantsWithStatus,
} from "./engine/routingEngine";
export {
  handleMerchantClick,
  generateTrackedLink,
  getClickHistory,
  getClickStore,
} from "./engine/clickHandler";
export {
  getPoolBalance,
  getRecentActivity,
  getMonthlyEarnings,
  getLifetimeStats,
  redeemFromPool,
  addPlatformBonus,
  resetLedger,
} from "./engine/rewardsLedger";
