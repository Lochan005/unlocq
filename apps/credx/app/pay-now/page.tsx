"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import IFSCAutocomplete, {
  PaymentBadges,
  type BranchRecord,
} from "../components/IFSCAutocomplete";
import { useRewardsStore } from "@/app/lib/rewards/store";
import { formatCurrency } from "@/app/lib/currency";
import { ArrowLeft, Check } from "@phosphor-icons/react";

function formatINR(value: number): string {
  if (!Number.isFinite(value)) return "₹0";
  return "₹" + Math.round(value).toLocaleString("en-IN");
}

function PayNowContent() {
  const searchParams = useSearchParams();
  const emiFromQuery = searchParams.get("emi");
  const prepaymentFromQuery = searchParams.get("prepayment");
  const savingsFromQuery = searchParams.get("savings");

  const defaultPrepayment = prepaymentFromQuery ? Number(prepaymentFromQuery) : null;
  const defaultEmi = emiFromQuery ? Number(emiFromQuery) : null;
  const defaultSavings = savingsFromQuery ? Number(savingsFromQuery) : null;

  const poolBalance = useRewardsStore((state) => state.poolBalance);
  const redeemPool = useRewardsStore((state) => state.redeemPool);
  const restorePool = useRewardsStore((state) => state.restorePool);
  const refreshData = useRewardsStore((state) => state.refreshData);
  const [poolLoaded, setPoolLoaded] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [redeemedPoolAmount, setRedeemedPoolAmount] = useState(0);

  const redeemSuccessRef = useRef(false);
  useEffect(() => {
    redeemSuccessRef.current = redeemSuccess;
  }, [redeemSuccess]);

  useEffect(() => {
    refreshData().then(() => setPoolLoaded(true));
    return () => {
      if (redeemSuccessRef.current) {
        restorePool();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [loanAccountNo, setLoanAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [prepaymentAmount, setPrepaymentAmount] = useState(
    defaultPrepayment != null && Number.isFinite(defaultPrepayment) ? String(defaultPrepayment) : ""
  );
  const [selectedBranch, setSelectedBranch] = useState<BranchRecord | null>(null);
  const [displayBankName, setDisplayBankName] = useState<string | null>(null);

  const prepaymentNum = prepaymentAmount === "" ? 0 : Number(prepaymentAmount);
  const emi = defaultEmi != null && Number.isFinite(defaultEmi) ? defaultEmi : 0;
  const interestSaved = defaultSavings != null && Number.isFinite(defaultSavings) ? defaultSavings : 0;

  const displayPrepayment = prepaymentAmount === "" ? "" : Number(prepaymentAmount).toLocaleString("en-IN");

  const isFormComplete =
    loanAccountNo.trim().length > 0 &&
    ifsc.trim().length === 11 &&
    selectedBranch !== null &&
    prepaymentNum > 0;

  const handleBranchSelect = (branch: BranchRecord, bankName: string) => {
    setSelectedBranch(branch);
    setDisplayBankName(bankName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: integrate with payment gateway later
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-16">
      <div className="w-full max-w-lg mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0F0F5C] hover:text-[#1C1C78] transition-colors mb-8"
        >
          <ArrowLeft size={16} weight="bold" aria-hidden /> Back to calculator
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-[#0F0F5C] mb-2">
          Prepayment
        </h1>
        <p className="text-sm text-[#0F0F5C]/80 mb-8">
          Enter your loan and bank details to proceed with the prepayment.
        </p>

        {poolLoaded && (poolBalance.confirmed > 0 || redeemSuccess) && (
          <div className="mb-6 rounded-2xl border-2 border-[#E6E4F5] bg-gradient-to-br from-[#F1F5F9] to-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Pay from Rewards Pool
                </h3>
                <p className="text-sm text-slate-500">
                  {redeemSuccess
                    ? "Rewards applied to this prepayment"
                    : "Use your earned rewards for this prepayment"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-[#1C1C78]">
                  {formatCurrency(redeemSuccess ? redeemedPoolAmount : poolBalance.confirmed)}
                </p>
                <p className="text-xs text-slate-400">
                  {redeemSuccess ? "applied" : "available"}
                </p>
              </div>
            </div>

            {redeemSuccess ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <p className="flex items-center justify-center gap-1.5 font-semibold text-emerald-700">
                  <Check size={16} weight="bold" /> Successfully added pool balance to your prepayment!
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  setIsRedeeming(true);
                  const amountToRedeem = poolBalance.confirmed;
                  const result = await redeemPool(amountToRedeem, "prepay");
                  if (result.success) {
                    setRedeemSuccess(true);
                    setRedeemedPoolAmount(amountToRedeem);
                  }
                  setIsRedeeming(false);
                }}
                disabled={isRedeeming}
                className="w-full rounded-xl bg-gradient-to-r from-[#1C1C78] to-[#0F0F5C] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRedeeming
                  ? "Processing..."
                  : `Apply ${formatCurrency(poolBalance.confirmed)} from Rewards Pool`}
              </button>
            )}

            {!redeemSuccess && poolBalance.pending > 0 && (
              <p className="mt-3 text-center text-xs text-slate-400">
                +{formatCurrency(poolBalance.pending)} pending confirmation —
                will become available soon
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Details card */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-[#E6E4F5] space-y-4">
            <h2 className="text-sm font-semibold text-[#0F0F5C] uppercase tracking-wide">
              Loan &amp; bank details
            </h2>

            <div>
              <label htmlFor="loan-ac" className="block text-sm font-medium text-[#0F0F5C] mb-1.5">
                Loan account number
              </label>
              <input
                id="loan-ac"
                type="text"
                inputMode="numeric"
                placeholder="Enter loan account number"
                value={loanAccountNo}
                onChange={(e) => setLoanAccountNo(e.target.value.replace(/\D/g, ""))}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-[#E6E4F5] bg-white text-[#0F0F5C] placeholder-[#4A4ABF]/60 focus:outline-none focus:ring-2 focus:ring-[#4A4ABF]/30 focus:border-[#4A4ABF]"
              />
            </div>

            <IFSCAutocomplete
              id="ifsc"
              value={ifsc}
              onChange={setIfsc}
              onBranchSelect={handleBranchSelect}
              label="IFSC code"
              placeholder="e.g. SBIN0001234"
              required
              helpText="11-character code. Search by IFSC, bank name, branch or city."
            />

            {selectedBranch && (
              <div className="rounded-lg bg-[#EEEDF8] border border-[#E6E4F5] p-4 space-y-2">
                <div className="text-sm font-semibold text-[#0F0F5C]">
                  {displayBankName ?? selectedBranch.bank}
                </div>
                {selectedBranch.branch &&
                  selectedBranch.branch.trim() !== "" &&
                  selectedBranch.branch.trim() !== "—" && (
                    <div className="text-xs text-[#0F0F5C]/90">
                      {selectedBranch.branch}
                      {selectedBranch.address && selectedBranch.address.trim() !== "" && ` · ${selectedBranch.address}`}
                    </div>
                  )}
                {(selectedBranch.city?.trim() || selectedBranch.state?.trim()) &&
                  (selectedBranch.city?.trim() !== "—" || selectedBranch.state?.trim() !== "—") && (
                  <div className="text-xs text-[#4A4ABF]">
                    {[selectedBranch.city, selectedBranch.state]
                      .filter((s) => s && String(s).trim() !== "" && String(s).trim() !== "—")
                      .join(", ")}
                  </div>
                )}
                {selectedBranch.micr && (
                  <div className="text-xs text-[#4A4ABF]">MICR: {selectedBranch.micr}</div>
                )}
                <PaymentBadges branch={selectedBranch} />
              </div>
            )}

            <div>
              <label htmlFor="prepayment" className="block text-sm font-medium text-[#0F0F5C] mb-1.5">
                Prepayment amount (₹)
              </label>
              <input
                id="prepayment"
                type="text"
                inputMode="numeric"
                placeholder="Enter amount"
                value={displayPrepayment}
                onChange={(e) => setPrepaymentAmount(e.target.value.replace(/[^0-9]/g, ""))}
                required
                className="w-full px-4 py-3 rounded-lg border-2 border-[#E6E4F5] bg-white text-[#0F0F5C] placeholder-[#4A4ABF]/60 focus:outline-none focus:ring-2 focus:ring-[#4A4ABF]/30 focus:border-[#4A4ABF]"
              />
            </div>
          </div>

          {/* Summary card */}
          <div className="bg-[#EEEDF8] rounded-2xl p-6 border border-[#E6E4F5]">
            <h2 className="text-sm font-semibold text-[#0F0F5C] uppercase tracking-wide mb-4">
              Summary
            </h2>
            <dl className="space-y-3">
              <div className="flex justify-between items-baseline">
                <dt className="text-sm text-[#0F0F5C]/90">Current EMI</dt>
                <dd className="text-base font-semibold text-[#0F0F5C] tabular-nums">
                  {formatINR(emi)}
                </dd>
              </div>
              <div className="flex justify-between items-baseline">
                <dt className="text-sm text-[#0F0F5C]/90">Prepayment amount</dt>
                <dd className="text-base font-semibold text-[#0F0F5C] tabular-nums">
                  {formatINR(prepaymentNum)}
                </dd>
              </div>
              {redeemSuccess && redeemedPoolAmount > 0 && prepaymentNum > 0 && interestSaved > 0 ? (
                <>
                  <div className="flex justify-between items-baseline pt-3 border-t border-[#E6E4F5]">
                    <dt className="text-sm text-[#0F0F5C]/90">Your prepayment saves</dt>
                    <dd className="text-base font-semibold text-[#0F0F5C] tabular-nums">
                      {formatINR(interestSaved)}
                    </dd>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <dt className="text-sm text-[#1C1C78] font-medium">
                      Rewards Pool saves
                    </dt>
                    <dd className="text-base font-semibold text-[#1C1C78] tabular-nums">
                      + {formatINR(Math.round(redeemedPoolAmount * (interestSaved / prepaymentNum)))}
                    </dd>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-[#E6E4F5]">
                    <dt className="text-sm font-medium text-[#0F0F5C]">Total interest saved</dt>
                    <dd className="text-lg font-bold text-[#1C1C78] tabular-nums">
                      {formatINR(interestSaved + Math.round(redeemedPoolAmount * (interestSaved / prepaymentNum)))}
                    </dd>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-baseline pt-3 border-t border-[#E6E4F5]">
                  <dt className="text-sm font-medium text-[#0F0F5C]">Interest saved</dt>
                  <dd className="text-lg font-bold text-[#1C1C78] tabular-nums">
                    {formatINR(interestSaved)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <button
            type="submit"
            disabled={!isFormComplete}
            className={`w-full py-3.5 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#2E2E8F]/50 ${
              isFormComplete
                ? "bg-[#2E2E8F] hover:bg-[#1C1C78] text-white"
                : "bg-[#2E2E8F]/40 text-white/60 cursor-not-allowed"
            }`}
          >
            Proceed to pay
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PayNowPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#0F0F5C]">Loading...</div>
      </div>
    }>
      <PayNowContent />
    </Suspense>
  );
}
