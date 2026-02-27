"use client";

import { formatCurrency } from "@/app/lib/currency";

interface PoolBalanceDisplayProps {
  confirmed: number;
  pending: number;
  size?: "sm" | "lg";
}

export default function PoolBalanceDisplay({
  confirmed,
  pending,
  size = "sm",
}: PoolBalanceDisplayProps) {
  return (
    <div>
      <p
        className={`font-extrabold text-[#1C1C78] ${
          size === "lg" ? "text-4xl" : "text-2xl"
        }`}
      >
        {formatCurrency(confirmed)}
      </p>
      {pending > 0 && (
        <p className="mt-1 text-xs text-slate-400">
          +{formatCurrency(pending)} pending confirmation
        </p>
      )}
    </div>
  );
}
