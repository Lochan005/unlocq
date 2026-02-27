"use client";

import { useState } from "react";
import { useRewardsStore } from "@/app/lib/rewards/store";
import { formatCurrency } from "@/app/lib/currency";
import { ComplianceFooter } from "@/app/components/rewards";
import {
  calculateNewTenure,
  calculateInterestSaved,
} from "@/app/lib/calculator";
import { Bank, Gift, Heart, ChartBar, Lightbulb } from "@phosphor-icons/react";

export default function RedeemPage() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const {
    poolBalance,
    loanData,
    redeemPool,
  } = useRewardsStore();

  const confirmed = poolBalance.confirmed;
  const pending = poolBalance.pending;

  // Real interest calculation using calculator.ts
  const getImpactMetrics = () => {
    if (confirmed <= 0) {
      return {
        interestSaved: 0,
        tenureReducedMonths: 0,
        roiPercent: 0,
      };
    }

    const originalRemainingMonths = loanData.remainingTenure * 12;
    const newTenureDecimal = calculateNewTenure(
      loanData.outstandingBalance,
      loanData.interestRate,
      loanData.currentEMI,
      confirmed
    );
    const newTenureMonths = Math.max(0, Math.ceil(newTenureDecimal.toNumber()));

    const interestSavedDecimal = calculateInterestSaved(
      loanData.currentEMI,
      originalRemainingMonths,
      newTenureMonths,
      confirmed
    );
    const interestSaved = interestSavedDecimal.toNumber();
    const tenureReducedMonths = originalRemainingMonths - newTenureMonths;
    const roiPercent =
      confirmed > 0 ? (interestSaved / confirmed) * 100 : 0;

    return {
      interestSaved,
      tenureReducedMonths,
      roiPercent,
    };
  };

  const metrics = getImpactMetrics();

  const handleConfirmPrepay = async () => {
    setIsRedeeming(true);
    setRedeemResult(null);
    try {
      const result = await redeemPool(confirmed, "prepay");
      setRedeemResult(result);
      if (result.success) {
        setTimeout(() => {
          setShowConfirmModal(false);
          setRedeemResult(null);
        }, 2000);
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Redeem Your Rewards
        </h2>
        <p className="mt-1 text-slate-500">
          Choose how to use your pool balance
        </p>
      </div>

      {/* Three-card layout */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Card 1 — Auto-Prepay (RECOMMENDED) */}
        <div className="rounded-2xl border-2 border-emerald-500 bg-white p-6 shadow-lg">
          <div className="relative">
            <span className="absolute -top-2 right-0 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
              RECOMMENDED
            </span>
          </div>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200">
            <Bank size={32} weight="duotone" className="text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Auto-Prepay Loan</h3>
          <p className="mt-2 text-sm text-slate-500">
            Directly reduce your loan principal. Every rupee saves you ~3x in
            interest over the loan life.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-slate-600">
            <li>• Zero processing fee</li>
            <li>• Instant transfer</li>
            <li>• Maximum impact on loan</li>
          </ul>
          <button
            type="button"
            disabled={confirmed === 0}
            onClick={() => confirmed > 0 && setShowConfirmModal(true)}
            className={`mt-4 w-full rounded-xl px-4 py-3 font-semibold transition-all ${
              confirmed === 0
                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                : "bg-gradient-to-r from-[#1C1C78] to-[#0F0F5C] text-white shadow-lg hover:-translate-y-0.5"
            }`}
          >
            {confirmed === 0
              ? "No confirmed balance yet"
              : `Prepay ${formatCurrency(confirmed)}`}
          </button>
        </div>

        {/* Card 2 — Vouchers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200">
            <Gift size={32} weight="duotone" className="text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Redeem Vouchers
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Convert to gift vouchers from your favorite brands.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Amazon", "Flipkart", "Swiggy", "BookMyShow"].map((brand) => (
              <span
                key={brand}
                className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800"
              >
                {brand}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-xl border-2 border-[#E6E4F5] bg-white px-4 py-3 font-semibold text-[#1C1C78] hover:bg-[#F5F4FA]"
          >
            Browse Vouchers
          </button>
        </div>

        {/* Card 3 — Donate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-pink-200">
            <Heart size={32} weight="duotone" className="text-pink-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Donate to Cause
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Help others achieve financial literacy and freedom.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Education", "Healthcare", "Environment"].map((cause) => (
              <span
                key={cause}
                className="rounded-full bg-pink-50 px-2 py-0.5 text-xs font-medium text-pink-800"
              >
                {cause}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-xl border-2 border-[#E6E4F5] bg-white px-4 py-3 font-semibold text-[#1C1C78] hover:bg-[#F5F4FA]"
          >
            Donate Now
          </button>
        </div>
      </div>

      {/* Impact Calculator */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
          <ChartBar size={22} weight="duotone" className="text-[#1C1C78]" /> Impact of Auto-Prepay
        </h3>

        {confirmed === 0 ? (
          <p className="py-6 text-center text-slate-500">
            Start earning to see your impact.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                INTEREST SAVED
              </p>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {formatCurrency(metrics.interestSaved)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                TENURE REDUCED
              </p>
              <p className="mt-1 text-2xl font-bold text-[#1C1C78]">
                {metrics.tenureReducedMonths} months
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                ROI
              </p>
              <p className="mt-1 text-2xl font-bold text-[#1C1C78]">
                {metrics.roiPercent.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </div>

      <ComplianceFooter variant="pool" />

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Bank size={24} weight="duotone" className="text-[#1C1C78]" /> Confirm Auto-Prepay
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Transfer your pool balance directly to your loan account
            </p>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Pool Balance</span>
                <span className="font-semibold">
                  {formatCurrency(confirmed)}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-slate-600">Processing Fee</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="my-3 border-t border-dashed border-slate-200" />
              <div className="flex justify-between">
                <span className="text-slate-600">Amount to Prepay</span>
                <span className="text-lg font-bold text-[#1C1C78]">
                  {formatCurrency(confirmed)}
                </span>
              </div>
              {pending > 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  Pending rewards not included: {formatCurrency(pending)} (will
                  become available after confirmation)
                </p>
              )}
            </div>

            <div className="mt-4 rounded-xl bg-green-50 p-4">
              <p className="flex items-center gap-1.5 text-sm text-green-800">
                <Lightbulb size={18} weight="duotone" className="shrink-0 text-green-600" /> This prepayment will save you approximately{" "}
                <strong>{formatCurrency(metrics.interestSaved)}</strong> in
                interest!
              </p>
            </div>

            {redeemResult && (
              <div
                className={`mt-4 rounded-lg p-3 text-sm ${
                  redeemResult.success
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {redeemResult.message}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setRedeemResult(null);
                }}
                disabled={isRedeeming}
                className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPrepay}
                disabled={isRedeeming}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#1C1C78] to-[#0F0F5C] px-4 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
              >
                {isRedeeming ? "Processing..." : "Confirm Prepay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
