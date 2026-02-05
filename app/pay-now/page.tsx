"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import IFSCAutocomplete, {
  PaymentBadges,
  type BranchRecord,
} from "../components/IFSCAutocomplete";

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
          className="inline-flex items-center gap-2 text-sm font-medium text-[#5B4B8A] hover:text-[#7C5CBF] transition-colors mb-8"
        >
          <span aria-hidden>←</span> Back to calculator
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-[#5B4B8A] mb-2">
          Prepayment
        </h1>
        <p className="text-sm text-[#5B4B8A]/80 mb-8">
          Enter your loan and bank details to proceed with the prepayment.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Details card */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-[#EBE8FC] space-y-4">
            <h2 className="text-sm font-semibold text-[#5B4B8A] uppercase tracking-wide">
              Loan &amp; bank details
            </h2>

            <div>
              <label htmlFor="loan-ac" className="block text-sm font-medium text-[#5B4B8A] mb-1.5">
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
                className="w-full px-4 py-3 rounded-lg border-2 border-[#EBE8FC] bg-white text-[#5B4B8A] placeholder-[#8E7BB8]/60 focus:outline-none focus:ring-2 focus:ring-[#B19CD7]/30 focus:border-[#B19CD7]"
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
              <div className="rounded-lg bg-[#F5F3FF] border border-[#EBE8FC] p-4 space-y-2">
                <div className="text-sm font-semibold text-[#5B4B8A]">
                  {displayBankName ?? selectedBranch.bank}
                </div>
                {selectedBranch.branch &&
                  selectedBranch.branch.trim() !== "" &&
                  selectedBranch.branch.trim() !== "—" && (
                    <div className="text-xs text-[#5B4B8A]/90">
                      {selectedBranch.branch}
                      {selectedBranch.address && selectedBranch.address.trim() !== "" && ` · ${selectedBranch.address}`}
                    </div>
                  )}
                {(selectedBranch.city?.trim() || selectedBranch.state?.trim()) &&
                  (selectedBranch.city?.trim() !== "—" || selectedBranch.state?.trim() !== "—") && (
                  <div className="text-xs text-[#8E7BB8]">
                    {[selectedBranch.city, selectedBranch.state]
                      .filter((s) => s && String(s).trim() !== "" && String(s).trim() !== "—")
                      .join(", ")}
                  </div>
                )}
                {selectedBranch.micr && (
                  <div className="text-xs text-[#8E7BB8]">MICR: {selectedBranch.micr}</div>
                )}
                <PaymentBadges branch={selectedBranch} />
              </div>
            )}

            <div>
              <label htmlFor="prepayment" className="block text-sm font-medium text-[#5B4B8A] mb-1.5">
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
                className="w-full px-4 py-3 rounded-lg border-2 border-[#EBE8FC] bg-white text-[#5B4B8A] placeholder-[#8E7BB8]/60 focus:outline-none focus:ring-2 focus:ring-[#B19CD7]/30 focus:border-[#B19CD7]"
              />
            </div>
          </div>

          {/* Summary card */}
          <div className="bg-[#F5F3FF] rounded-2xl p-6 border border-[#EBE8FC]">
            <h2 className="text-sm font-semibold text-[#5B4B8A] uppercase tracking-wide mb-4">
              Summary
            </h2>
            <dl className="space-y-3">
              <div className="flex justify-between items-baseline">
                <dt className="text-sm text-[#5B4B8A]/90">Current EMI</dt>
                <dd className="text-base font-semibold text-[#5B4B8A] tabular-nums">
                  {formatINR(emi)}
                </dd>
              </div>
              <div className="flex justify-between items-baseline">
                <dt className="text-sm text-[#5B4B8A]/90">Prepayment amount</dt>
                <dd className="text-base font-semibold text-[#5B4B8A] tabular-nums">
                  {formatINR(prepaymentNum)}
                </dd>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-[#EBE8FC]">
                <dt className="text-sm font-medium text-[#5B4B8A]">Interest saved</dt>
                <dd className="text-lg font-bold text-[#7C5CBF] tabular-nums">
                  {formatINR(interestSaved)}
                </dd>
              </div>
            </dl>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-lg font-semibold text-white bg-[#9678CD] hover:bg-[#7C5CBF] focus:outline-none focus:ring-2 focus:ring-[#9678CD]/50 transition-colors"
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
        <div className="text-[#5B4B8A]">Loading...</div>
      </div>
    }>
      <PayNowContent />
    </Suspense>
  );
}
