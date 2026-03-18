"use client";

import Link from "next/link";
import { useRewardsStore } from "@/app/lib/rewards/store";
import { formatCurrency } from "@credx/shared";
import { ComplianceFooter } from "@/app/components/rewards";
import { Bank } from "@phosphor-icons/react";

export default function RedeemPage() {
  const { poolBalance } = useRewardsStore();
  const confirmed = poolBalance.confirmed;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Redeem Your Rewards
        </h2>
        <p className="mt-1 text-slate-500">
          Use your pool balance for loan prepayment
        </p>
      </div>

      {/* Use Pool Balance for Prepayment */}
      <div className="rounded-2xl border-2 border-[#E6E4F5] bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="mb-6 md:mb-0">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#EEEDF8] to-[#E6E4F5]">
              <Bank size={32} weight="duotone" className="text-[#1C1C78]" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Use Pool Balance for Prepayment
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Transfer your confirmed pool balance directly to your loan account and reduce your interest.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end">
            <p className="text-3xl font-extrabold text-[#1C1C78]">
              {formatCurrency(confirmed)}
            </p>
            <p className="mt-1 text-sm text-slate-500">Available balance</p>
            <Link
              href="/pay-now"
              className={`mt-4 w-full rounded-xl px-6 py-3 font-semibold shadow-lg transition-all md:w-auto ${
                confirmed > 0
                  ? "bg-gradient-to-r from-[#1C1C78] to-[#0F0F5C] text-white hover:opacity-95"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              Prepay Now
            </Link>
          </div>
        </div>
      </div>

      <ComplianceFooter variant="pool" />
    </div>
  );
}
