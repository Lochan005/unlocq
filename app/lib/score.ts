import type { LoanData, EngagementData, ScoreTier } from "@/app/lib/types";
import { calculateEMI } from "@/app/lib/calculator";

/**
 * Adapter: calculator.ts uses tenure in months, here we use years.
 */
function emiFromYears(
  principal: number,
  annualRate: number,
  years: number
): number {
  const tenureMonths = years * 12;
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  return emi.toNumber();
}

/**
 * Calculates the UNLOQ1 Score (0–1000) from loan data and engagement activity.
 *
 * Components:
 *   - DTI Health:           max 250 points
 *   - Prepayment Behavior:  max 250 points
 *   - Loan Progress:        max 200 points
 *   - Financial Buffer:     max 200 points
 *   - Engagement:           max 100 points (driven by rewards activity)
 */
export function calculateUNLOQ1Score(
  loanData: LoanData,
  engagement: EngagementData
): number {
  const emi = emiFromYears(
    loanData.outstandingBalance,
    loanData.interestRate,
    loanData.remainingTenure
  );

  // 1. DTI Health (max 250)
  const dtiRatio =
    (emi + loanData.livingExpenses) /
    (emi + loanData.extraPayment + loanData.livingExpenses + 20000);
  const dtiScore = Math.max(0, 250 * (1 - dtiRatio));

  // 2. Prepayment Behavior (max 250)
  const prepayRatio = loanData.extraPayment / emi;
  const prepayScore = Math.min(250, prepayRatio * 500);

  // 3. Loan Progress (max 200)
  const progressRatio =
    1 - loanData.outstandingBalance / loanData.originalAmount;
  const progressScore = progressRatio * 200;

  // 4. Financial Buffer (max 200)
  const bufferRatio =
    (loanData.extraPayment + 20000 - loanData.livingExpenses) /
    loanData.livingExpenses;
  const bufferScore = Math.min(200, Math.max(0, bufferRatio * 100));

  // 5. Engagement (max 100) — driven by rewards activity
  let engagementScore = 0;
  if (engagement.hasActiveStreak) engagementScore += 15;
  engagementScore += Math.min(25, engagement.streakMonths * 5);
  if (engagement.hasRecentRedemption) engagementScore += 15;
  if (engagement.profileCompleted) engagementScore += 10;
  if (engagement.hasReferral) engagementScore += 10;
  if (engagement.recentCalculatorUse) engagementScore += 10;
  if (engagement.hasRecentCouponPurchase ?? false) engagementScore += 15;

  return Math.round(
    dtiScore + prepayScore + progressScore + bufferScore + engagementScore
  );
}

/**
 * Maps a score to its display tier.
 */
export function getScoreTier(score: number): ScoreTier {
  if (score >= 800)
    return { tier: "Excellent", color: "#10b981", icon_key: "excellent" };
  if (score >= 600) return { tier: "Good", color: "#3b82f6", icon_key: "good" };
  if (score >= 400) return { tier: "Fair", color: "#f59e0b", icon_key: "fair" };
  return { tier: "Needs Work", color: "#ef4444", icon_key: "needs_work" };
}
