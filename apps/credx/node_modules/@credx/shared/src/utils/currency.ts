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

export function formatCurrency(
  amount: number,
  options?: { showPaise?: boolean }
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const prefix = isNegative ? "-₹" : "₹";

  if (absAmount >= 100000) {
    const lakhs = absAmount / 100000;
    return `${prefix}${lakhs.toFixed(2)}L`;
  }

  const formatted = options?.showPaise
    ? absAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : absAmount.toLocaleString("en-IN");

  return `${prefix}${formatted}`;
}
