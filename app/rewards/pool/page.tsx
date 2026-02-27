"use client";

import { useRef } from "react";
import Link from "next/link";
import { useRewardsStore } from "@/app/lib/rewards/store";
import { formatCurrency } from "@/app/lib/currency";
import { ComplianceFooter } from "@/app/components/rewards";
import { AppIcon } from "@/app/lib/iconMap";
import { Bank, Gear, TrendUp, Coins, Storefront } from "@phosphor-icons/react";
import { UNLOQ1Coin } from "@/app/components/icons";

export default function PoolPage() {
  const settingsRef = useRef<HTMLDivElement>(null);

  const {
    poolBalance,
    userProfile,
    monthlyEarnings,
    toggleAutoPrepay,
    setAutoPrepayThreshold,
  } = useRewardsStore();

  const confirmed = poolBalance.confirmed;
  const pending = poolBalance.pending;
  const threshold = userProfile?.auto_prepay_threshold ?? 5000;
  const autoPrepayEnabled = userProfile?.auto_prepay_enabled ?? false;
  const coinsConfirmed = (userProfile?.coins_confirmed ?? 0) || confirmed * 10;

  const progressPercent =
    threshold > 0 ? Math.min(100, (confirmed / threshold) * 100) : 0;

  const monthlyTotal = monthlyEarnings.reduce((sum, e) => sum + e.amount, 0);

  const scrollToSettings = () => {
    settingsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Your Prepayment Pool
        </h2>
        <p className="mt-1 text-slate-500">
          Watch your earnings grow and auto-prepay when ready
        </p>
      </div>

      {/* Pool Balance Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#1C1C78] to-[#0A0A4A] p-8 text-white shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">Pool Balance</p>
            <p className="mt-1 text-5xl font-extrabold">
              {formatCurrency(confirmed)}
            </p>
            <p className="mt-2 flex items-center gap-1 text-sm text-white/90">
              <UNLOQ1Coin size={16} color="#fbbf24" /> {coinsConfirmed.toLocaleString()} coins ≈{" "}
              {formatCurrency(coinsConfirmed / 10)}
            </p>
            {pending > 0 && (
              <p className="mt-1 text-sm text-white/70">
                +{formatCurrency(pending)} pending confirmation
              </p>
            )}
          </div>

          <div className="min-w-[200px]">
            <p className="text-sm font-medium text-white/80">
              Auto-prepay threshold
            </p>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(threshold)}
            </p>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-white/80">
              {Math.round(progressPercent)}% to auto-prepay
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {confirmed === 0 ? (
            <span className="flex flex-1 cursor-not-allowed items-center justify-center rounded-xl bg-white/30 px-4 py-3 font-semibold text-white/60">
              No confirmed balance yet
            </span>
          ) : (
            <Link
              href="/rewards/redeem"
              className="flex flex-1 items-center justify-center rounded-xl bg-white px-4 py-3 font-semibold text-[#1C1C78] transition-all hover:bg-white/95"
            >
              <Bank size={18} weight="bold" className="mr-1" /> Prepay Now
            </Link>
          )}
          <button
            type="button"
            onClick={scrollToSettings}
            className="flex-1 rounded-xl border-2 border-white/50 bg-white/10 px-4 py-3 font-semibold text-white transition-all hover:bg-white/20"
          >
            <Gear size={18} weight="bold" className="mr-1" /> Settings
          </button>
        </div>
      </div>

      {/* This Month's Earnings */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
          <TrendUp size={22} weight="duotone" className="text-green-600" /> This Month&apos;s Earnings
        </h3>

        {monthlyEarnings.length === 0 ? (
          <p className="py-6 text-center text-slate-500">
            No earnings this month yet.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {monthlyEarnings.map((earning) => (
                <div
                  key={earning.merchantId}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="text-lg">
                    {earning.merchantName === "Platform Bonuses" ? <Coins size={22} weight="duotone" className="text-amber-500" /> : <Storefront size={22} weight="duotone" className="text-slate-500" />}
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {earning.merchantName}
                  </p>
                  <p className="text-sm font-bold text-green-600">
                    +{formatCurrency(earning.amount)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {earning.count} transaction{earning.count !== 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-[#1C1C78] to-[#0F0F5C] px-4 py-3 text-white">
              <span className="font-medium">Total this month</span>
              <span className="text-xl font-bold">
                {formatCurrency(monthlyTotal)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Auto-Prepay Settings */}
      <div ref={settingsRef} className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
          <Gear size={22} weight="duotone" className="text-slate-500" /> Auto-Prepay Settings
        </h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">
                Enable Auto-Prepay
              </p>
              <p className="text-sm text-slate-500">
                Automatically prepay when pool hits threshold
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoPrepayEnabled}
              onClick={toggleAutoPrepay}
              className={`relative h-8 w-14 rounded-full transition-colors ${
                autoPrepayEnabled ? "bg-[#1C1C78]" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  autoPrepayEnabled ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block font-semibold text-slate-800">
              Threshold Amount: {formatCurrency(threshold)}
            </label>
            <input
              type="range"
              min={1000}
              max={20000}
              step={1000}
              value={threshold}
              onChange={(e) =>
                setAutoPrepayThreshold(Number(e.target.value))
              }
              className="mt-2 h-2 w-full appearance-none rounded-full bg-slate-200 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1C1C78]"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>{formatCurrency(1000)}</span>
              <span>{formatCurrency(20000)}</span>
            </div>
          </div>
        </div>
      </div>

      <ComplianceFooter variant="pool" />
    </div>
  );
}
