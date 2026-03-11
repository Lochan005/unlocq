/**
 * Unified currency formatter for the entire application.
 * Indian comma formatting below ₹1,00,000.
 * Lakhs notation at and above ₹1,00,000.
 *
 * Usage:
 *   formatCurrency(285000)        → "₹2.85L"
 *   formatCurrency(2847)          → "₹2,847"
 *   formatCurrency(2847.5, { showPaise: true }) → "₹2,847.50"
 *   formatCurrency(-5000)         → "-₹5,000"
 */
export declare function formatCurrency(amount: number, options?: {
    showPaise?: boolean;
}): string;
//# sourceMappingURL=currency.d.ts.map