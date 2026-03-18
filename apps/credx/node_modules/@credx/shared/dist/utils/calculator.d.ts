import Decimal from 'decimal.js';
/**
 * Calculate monthly interest rate from annual rate
 * @param annualRate - Annual interest rate as a percentage (e.g., 10 for 10%)
 * @returns Monthly interest rate as a decimal
 */
export declare function calculateMonthlyRate(annualRate: number): Decimal;
/**
 * Calculate EMI (Equated Monthly Installment)
 * Formula: P × i × (1+i)^N / [(1+i)^N - 1]
 * @param principal - Loan principal amount
 * @param annualRate - Annual interest rate as a percentage
 * @param tenureMonths - Loan tenure in months
 * @returns EMI amount
 */
export declare function calculateEMI(principal: number, annualRate: number, tenureMonths: number): Decimal;
/**
 * Calculate outstanding principal after some months have been paid
 * Formula: P × [(1+i)^N - (1+i)^k] / [(1+i)^N - 1]
 * @param originalPrincipal - Original loan principal
 * @param annualRate - Annual interest rate as a percentage
 * @param originalTenure - Original loan tenure in months
 * @param monthsPaid - Number of months already paid
 * @returns Outstanding principal amount
 */
export declare function calculateOutstandingPrincipal(originalPrincipal: number, annualRate: number, originalTenure: number, monthsPaid: number): Decimal;
/**
 * Calculate new tenure after lump-sum prepayment, keeping EMI same
 * Formula: N' = ln(E / (E - P_after × i)) / ln(1+i)
 * where P_after = outstanding - prepayment
 * @param outstandingPrincipal - Outstanding principal before prepayment
 * @param annualRate - Annual interest rate as a percentage
 * @param emi - Current EMI amount
 * @param prepaymentAmount - Lump-sum prepayment amount
 * @returns New tenure in months
 */
export declare function calculateNewTenure(outstandingPrincipal: number, annualRate: number, emi: number, prepaymentAmount: number): Decimal;
/**
 * Calculate interest saved due to prepayment
 * @param emi - EMI amount
 * @param originalRemainingTenure - Remaining tenure before prepayment in months
 * @param newTenure - New tenure after prepayment in months
 * @param prepaymentAmount - Lump-sum prepayment amount
 * @returns Interest saved amount
 */
export declare function calculateInterestSaved(emi: number, originalRemainingTenure: number, newTenure: number, prepaymentAmount: number): Decimal;
/**
 * Main function to calculate complete prepayment scenario
 * @param originalPrincipal - Original loan principal
 * @param annualRate - Annual interest rate as a percentage
 * @param originalTenure - Original loan tenure in months
 * @param monthsPaid - Number of months already paid
 * @param prepaymentAmount - Lump-sum prepayment amount
 * @returns Object containing all calculated values
 */
export declare function calculatePrepaymentScenario(originalPrincipal: number, annualRate: number, originalTenure: number, monthsPaid: number, prepaymentAmount: number): {
    emi: number;
    outstandingPrincipal: number;
    remainingTenure: number;
    newTenureAfterPrepay: number;
    interestSaved: number;
    tenureReduced: number;
    totalCostWithoutPrepay: number;
    totalCostWithPrepay: number;
};
/**
 * Calculate prepayment scenario with "Reduce EMI" option
 * Instead of reducing tenure, keeps the same remaining tenure but reduces EMI
 * Formula for new EMI: E' = P_after × i × (1+i)^N_remaining / [(1+i)^N_remaining - 1]
 * @param originalPrincipal - Original loan principal
 * @param annualRate - Annual interest rate as a percentage
 * @param originalTenure - Original loan tenure in months
 * @param monthsPaid - Number of months already paid
 * @param prepaymentAmount - Lump-sum prepayment amount
 * @returns Object containing all calculated values
 */
export declare function calculatePrepaymentScenario1B(originalPrincipal: number, annualRate: number, originalTenure: number, monthsPaid: number, prepaymentAmount: number): {
    emi: number;
    newEmi: number;
    emiReduction: number;
    outstandingPrincipal: number;
    remainingTenure: number;
    interestSaved: number;
    totalCostWithoutPrepay: number;
    totalCostWithPrepay: number;
    monthlyBenefit: number;
};
/**
 * Calculate scenario for monthly extra payments on top of EMI
 * User pays extra amount every month, reducing tenure
 * Formula for new tenure: N' = ln((E + extra) / ((E + extra) - P_outstanding × i)) / ln(1+i)
 * @param originalPrincipal - Original loan principal
 * @param annualRate - Annual interest rate as a percentage
 * @param originalTenure - Original loan tenure in months
 * @param monthsPaid - Number of months already paid
 * @param monthlyExtraPayment - Extra amount paid each month on top of EMI
 * @returns Object containing all calculated values
 */
export declare function calculateScenario2(originalPrincipal: number, annualRate: number, originalTenure: number, monthsPaid: number, monthlyExtraPayment: number): {
    emi: number;
    effectiveMonthlyPayment: number;
    outstandingPrincipal: number;
    remainingTenure: number;
    newTenure: number;
    tenureReduced: number;
    interestSaved: number;
    totalExtraPaid: number;
    totalCostWithoutExtra: number;
    totalCostWithExtra: number;
};
/**
 * Calculate Scenario 3: Prepay + Refinance comparison
 * Compares 4 options: Stay, Prepay Only, Refinance Only, Prepay + Refinance
 * @param originalPrincipal - Original loan principal
 * @param currentRate - Current annual interest rate as a percentage
 * @param originalTenure - Original loan tenure in months
 * @param monthsPaid - Number of months already paid
 * @param prepaymentAmount - Lump-sum prepayment amount (for options A and C)
 * @param newRate - New refinance annual interest rate as a percentage
 * @param refinanceCost - Processing fees, legal costs etc. (rolled into loan for options B and C)
 * @param newTenure - Tenure for refinanced loan in months (usually same as remaining)
 * @returns Object containing comparison data for all 4 options
 */
export declare function calculateScenario3(originalPrincipal: number, currentRate: number, originalTenure: number, monthsPaid: number, prepaymentAmount: number, newRate: number, refinanceCost: number, newTenure: number): {
    emi: number;
    outstandingPrincipal: number;
    remainingTenure: number;
    stay: {
        totalCost: number;
        totalInterest: number;
        monthlyPayment: number;
        tenure: number;
        hasBenefit: boolean;
        status?: string;
    };
    optionA: {
        totalCost: number;
        totalInterest: number;
        monthlyPayment: number;
        tenure: number;
        hasBenefit: boolean;
        status?: string;
    };
    optionB: {
        totalCost: number;
        totalInterest: number;
        monthlyPayment: number;
        tenure: number;
        hasBenefit: boolean;
        status?: string;
    };
    optionC: {
        totalCost: number;
        totalInterest: number;
        monthlyPayment: number;
        tenure: number;
        hasBenefit: boolean;
        status?: string;
    };
    bestOption: 'stay' | 'A' | 'B' | 'C';
    maxSavings: number;
};
//# sourceMappingURL=calculator.d.ts.map