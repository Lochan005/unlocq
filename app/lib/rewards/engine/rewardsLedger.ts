import type {
  RewardEntry,
  PoolBalance,
  LifetimeStats,
  MonthlyEarning,
  PostbackLogEntry,
  PostbackStatus,
} from "@/app/lib/types";
import Decimal from "decimal.js";
import { rewardEntries } from "../data/rewardsMock";
import { formatCurrency } from "@/app/lib/currency";
import merchantsData from "@/data/rewards/merchants.json";

let ledger: RewardEntry[] = [...rewardEntries];

const merchants = merchantsData as Array<{
  merchant_id: string;
  display_name: string;
}>;

function getMerchantName(merchantId: string | null): string {
  if (!merchantId) return "Platform Bonuses";
  const m = merchants.find((x) => x.merchant_id === merchantId);
  return m?.display_name ?? merchantId;
}

export function getPoolBalance(userId: string): PoolBalance {
  const confirmed = ledger
    .filter((e) => e.user_id === userId && e.status === "confirmed")
    .reduce((sum, e) => sum + e.user_share, 0);

  const pending = ledger
    .filter(
      (e) =>
        e.user_id === userId &&
        (e.status === "tracked" ||
          e.status === "pending" ||
          e.status === "under_confirmation")
    )
    .reduce((sum, e) => sum + e.user_share, 0);

  return { confirmed, pending };
}

export function getRecentActivity(
  userId: string,
  limit: number = 10
): RewardEntry[] {
  return ledger
    .filter((e) => e.user_id === userId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, limit);
}

export function getMonthlyEarnings(userId: string): MonthlyEarning[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const entries = ledger.filter(
    (e) => e.user_id === userId && e.status === "confirmed" && e.confirmed_at
  );

  const byMonth = entries.filter((e) => {
    const d = new Date(e.confirmed_at!);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const grouped = new Map<
    string,
    { merchantId: string; merchantName: string; amount: number; count: number }
  >();

  for (const e of byMonth) {
    const mid = e.merchant_id ?? "platform";
    const existing = grouped.get(mid);
    if (existing) {
      existing.amount += e.user_share;
      existing.count += 1;
    } else {
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

export function getLifetimeStats(userId: string): LifetimeStats {
  const allExceptRejected = ledger.filter(
    (e) => e.user_id === userId && e.status !== "rejected"
  );
  const totalEarned = allExceptRejected.reduce((sum, e) => sum + e.user_share, 0);

  const redeemedEntries = ledger.filter(
    (e) => e.user_id === userId && e.status === "redeemed"
  );
  const totalPrepaid = redeemedEntries.reduce(
    (sum, e) => sum + e.user_share,
    0
  );

  return {
    totalEarned,
    totalPrepaid,
    totalRedeemed: totalPrepaid,
  };
}

export function redeemFromPool(
  userId: string,
  amount: number,
  redemptionType: "prepay" | "voucher" | "donate"
): { success: boolean; message: string; redeemedAmount?: number } {
  const { confirmed } = getPoolBalance(userId);

  if (amount <= 0) {
    return { success: false, message: "Amount must be greater than zero" };
  }

  if (amount > confirmed) {
    return {
      success: false,
      message: `Insufficient confirmed balance. Available: ${formatCurrency(confirmed)}`,
    };
  }

  const confirmedEntries = ledger
    .filter((e) => e.user_id === userId && e.status === "confirmed")
    .sort(
      (a, b) =>
        new Date(a.confirmed_at!).getTime() -
        new Date(b.confirmed_at!).getTime()
    );

  let redeemedSum = 0;
  const now = new Date().toISOString();

  for (const entry of confirmedEntries) {
    if (redeemedSum >= amount) break;

    const idx = ledger.findIndex((e) => e.reward_id === entry.reward_id);
    if (idx >= 0) {
      ledger[idx] = {
        ...ledger[idx],
        status: "redeemed",
        redeemed_at: now,
        status_history: [
          ...ledger[idx].status_history,
          { status: "redeemed", timestamp: now },
        ],
      };
    }
    redeemedSum += entry.user_share;
  }

  return {
    success: true,
    message: `Successfully redeemed ${formatCurrency(amount)} via ${redemptionType}`,
    redeemedAmount: amount,
  };
}

export function addPlatformBonus(
  userId: string,
  action: string,
  coins: number
): RewardEntry {
  const now = new Date().toISOString();
  const userShare = coins / 10;

  const entry: RewardEntry = {
    reward_id: crypto.randomUUID(),
    user_id: userId,
    click_id: null,
    merchant_id: null,
    network: null,
    reward_type: "platform_bonus",
    gross_commission: 0,
    platform_topup: 0,
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

/**
 * Reverses the most recent redemption for a user by flipping "redeemed"
 * entries back to "confirmed". Used when the user navigates away from
 * the pay-now page without completing the (mock) payment.
 */
export function restoreRecentRedemption(
  userId: string
): { success: boolean; restoredAmount: number } {
  const redeemed = ledger.filter(
    (e) => e.user_id === userId && e.status === "redeemed" && e.redeemed_at
  );

  if (redeemed.length === 0) {
    return { success: false, restoredAmount: 0 };
  }

  const latestRedeemedAt = redeemed.reduce((latest, e) =>
    e.redeemed_at! > latest ? e.redeemed_at! : latest,
    redeemed[0].redeemed_at!
  );

  let restoredAmount = 0;

  for (const entry of redeemed) {
    if (entry.redeemed_at !== latestRedeemedAt) continue;

    const idx = ledger.findIndex((e) => e.reward_id === entry.reward_id);
    if (idx >= 0) {
      ledger[idx] = {
        ...ledger[idx],
        status: "confirmed",
        redeemed_at: null,
        status_history: ledger[idx].status_history.filter(
          (h) => h.status !== "redeemed" || h.timestamp !== latestRedeemedAt
        ),
      };
      restoredAmount += entry.user_share;
    }
  }

  return { success: true, restoredAmount };
}

// ============================================================
// POSTBACK RECONCILIATION — creditToPool + audit log
// ============================================================

const postbackLog: PostbackLogEntry[] = [];

const USER_SHARE_PCT = new Decimal("0.85");

/**
 * Credits a user's rewards pool with a commission received via postback.
 *
 * All monetary arithmetic uses Decimal.js to avoid floating-point drift.
 *
 * @param userId        The internal user ID (resolved from sub_id)
 * @param grossAmount   Gross commission reported by the affiliate network
 * @param postbackId    The PostbackEvent that triggered this credit
 * @param clickId       The original outbound click_id (nullable)
 * @param merchantId    Merchant that generated the commission (nullable)
 * @param network       The affiliate network name (nullable)
 * @param postbackStatus The status reported by the network
 */
export function creditToPool(
  userId: string,
  grossAmount: number,
  postbackId: string,
  clickId: string | null,
  merchantId: string | null,
  network: string | null,
  postbackStatus: PostbackStatus
): { entry: RewardEntry; logEntry: PostbackLogEntry } {
  const now = new Date().toISOString();

  const gross = new Decimal(grossAmount);
  const userShare = gross.mul(USER_SHARE_PCT).toDecimalPlaces(2).toNumber();
  const coinsEarned = new Decimal(userShare).mul(10).round().toNumber();

  const rewardStatus = postbackStatus === "approved" ? "confirmed" : "pending";

  const entry: RewardEntry = {
    reward_id: crypto.randomUUID(),
    user_id: userId,
    click_id: clickId,
    merchant_id: merchantId,
    network,
    reward_type: "affiliate",
    gross_commission: gross.toDecimalPlaces(2).toNumber(),
    platform_topup: 0,
    user_share: userShare,
    coins_credited: coinsEarned,
    status: rewardStatus,
    campaign_ref: clickId ? `postback_${clickId}` : `postback_${postbackId}`,
    status_history: [{ status: rewardStatus, timestamp: now }],
    created_at: now,
    confirmed_at: rewardStatus === "confirmed" ? now : null,
    redeemed_at: null,
  };

  ledger.push(entry);

  const logEntry: PostbackLogEntry = {
    log_id: crypto.randomUUID(),
    postback_id: postbackId,
    click_id: clickId,
    user_id: userId,
    amount_credited: userShare,
    reward_id: entry.reward_id,
    network,
    timestamp: now,
  };

  postbackLog.push(logEntry);

  return { entry, logEntry };
}

/**
 * Returns the full postback reconciliation log, newest first.
 * In production this would be a database query; here it's in-memory.
 */
export function getPostbackLog(userId?: string): PostbackLogEntry[] {
  const entries = userId
    ? postbackLog.filter((e) => e.user_id === userId)
    : postbackLog;
  return [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Checks whether the user received any postback-credited commission
 * within the last N days. Used by the engagement score calculation.
 */
export function hasRecentPostbackActivity(
  userId: string,
  withinDays: number = 30
): boolean {
  const cutoff = Date.now() - withinDays * 24 * 60 * 60 * 1000;
  return postbackLog.some(
    (e) => e.user_id === userId && new Date(e.timestamp).getTime() >= cutoff
  );
}

export function resetLedger(): void {
  ledger = [...rewardEntries];
  postbackLog.length = 0;
}
