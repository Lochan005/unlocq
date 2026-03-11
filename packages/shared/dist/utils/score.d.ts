import type { LoanData, EngagementData, ScoreTier } from "../types";
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
export declare function calculateUNLOQ1Score(loanData: LoanData, engagement: EngagementData): number;
/**
 * Maps a score to its display tier.
 */
export declare function getScoreTier(score: number): ScoreTier;
//# sourceMappingURL=score.d.ts.map