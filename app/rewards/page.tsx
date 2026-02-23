"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRewardsStore } from "@/app/lib/rewards/store";
import {
  StatusBadge,
} from "@/app/components/rewards";
import { formatCurrency } from "@/app/lib/currency";
import { fadeIn } from "../lib/animation";
import AnimatedNumber from "@/app/components/AnimatedNumber";
import { calculateUnLoQ1Score, getScoreTier } from "@/app/lib/score";
import { AppIcon } from "@/app/lib/iconMap";
import { Fire, ArrowRight } from "@phosphor-icons/react";
import { UnLoQ1Coin } from "@/app/components/icons";

function getRewardSourceName(entry: {
  merchant_id: string | null;
  campaign_ref: string;
}): string {
  if (!entry.merchant_id) {
    if (entry.campaign_ref.includes("streak")) return "Monthly Streak";
    if (entry.campaign_ref.includes("prepay")) return "Prepayment Bonus";
    return "Platform Bonus";
  }
  return entry.merchant_id;
}

function getRewardIconKey(entry: {
  merchant_id: string | null;
  campaign_ref: string;
}): string {
  if (!entry.merchant_id) {
    if (entry.campaign_ref.includes("streak")) return "fire";
    return "money";
  }
  return "money";
}

export default function RewardsOverviewPage() {
  const {
    poolBalance,
    userProfile,
    loanData,
    lifetimeStats,
    recentActivity,
    merchantGrid,
  } = useRewardsStore();

  const engagementData = {
    hasActiveStreak: (userProfile?.current_streak_months ?? 0) > 0,
    streakMonths: userProfile?.current_streak_months ?? 0,
    hasRecentRedemption: (userProfile?.lifetime_prepaid_from_pool ?? 0) > 0,
    profileCompleted: userProfile?.profile_completed ?? false,
    hasReferral: false,
    recentCalculatorUse: true,
  };
  const score = calculateUnLoQ1Score(loanData, engagementData);
  const tier = getScoreTier(score);

  const monthlyTotal = useRewardsStore((s) =>
    s.monthlyEarnings.reduce((sum, e) => sum + e.amount, 0)
  );
  const activityDisplay = recentActivity.slice(0, 5);

  const getMerchantIconKey = (merchantId: string | null): string => {
    if (!merchantId) return "money";
    const m = merchantGrid.find((x) => x.merchant_id === merchantId);
    return m?.icon_key ?? "money";
  };

  const getActivityIcon = (entry: { merchant_id: string | null; campaign_ref: string }): ReactNode => {
    const key = entry.merchant_id ? getMerchantIconKey(entry.merchant_id) : getRewardIconKey(entry);
    return <AppIcon name={key} size={22} weight="fill" colored />;
  };

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        {...fadeIn}
        transition={{ delay: 0.1 }}
      >
        <div className="rounded-2xl bg-white p-6 text-center shadow-lg transition-shadow hover:shadow-xl">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
            POOL BALANCE
          </p>
          <div>
            <AnimatedNumber
              value={poolBalance.confirmed}
              duration={1}
              prefix="₹"
              className="text-2xl font-extrabold text-purple-600"
            />
            {poolBalance.pending > 0 && (
              <p className="mt-1 text-xs text-slate-400">
                +{formatCurrency(poolBalance.pending)} pending confirmation
              </p>
            )}
          </div>
          {poolBalance.confirmed === 0 && poolBalance.pending === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              Start earning by shopping through UnLoQ1
            </p>
          ) : (
            <p className="mt-2 text-sm font-medium text-green-600">
              +{formatCurrency(monthlyTotal)} this month
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 text-center shadow-lg transition-shadow hover:shadow-xl">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
            COINS BALANCE
          </p>
          <p className="flex items-center justify-center gap-1.5 text-2xl font-extrabold text-purple-600">
            <UnLoQ1Coin size={24} color="#f59e0b" /> {userProfile?.coins_confirmed?.toLocaleString() ?? 0}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            ≈ {formatCurrency((userProfile?.coins_confirmed ?? 0) / 10)}{" "}
            available
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 text-center shadow-lg transition-shadow hover:shadow-xl">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
            LIFETIME PREPAID
          </p>
          <p className="text-2xl font-extrabold text-purple-600">
            {formatCurrency(lifetimeStats.totalPrepaid)}
          </p>
          <p className="mt-2 text-sm text-slate-500">From rewards pool</p>
        </div>

        <div className="rounded-2xl bg-white p-6 text-center shadow-lg transition-shadow hover:shadow-xl">
          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
            CURRENT STREAK
          </p>
          <p className="flex items-center justify-center gap-1.5 text-2xl font-extrabold text-purple-600">
            <Fire size={24} weight="duotone" className="text-amber-500" /> {userProfile?.current_streak_months ?? 0}
          </p>
          <p className="mt-2 text-sm font-medium text-amber-600">
            {(userProfile?.current_streak_months ?? 0) > 0
              ? `${userProfile?.streak_multiplier ?? 1}x multiplier active!`
              : "Start a streak by prepaying this month!"}
          </p>
        </div>
      </motion.div>

      {/* UnLoQ1 Score */}
      <motion.div
        className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm"
        {...fadeIn}
        transition={{ delay: 0.15 }}
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-slate-500">
              UnLoQ1 Score
            </p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold text-slate-800">
                {score}
              </span>
              <span
                className="flex items-center gap-1 text-sm font-semibold"
                style={{ color: tier.color }}
              >
                <AppIcon name={tier.icon_key} size={18} weight="duotone" /> {tier.tier}
              </span>
            </div>
          </div>
          <div className="w-full text-left sm:w-auto sm:text-right">
            <p className="text-xs text-slate-400">out of 1000</p>
            <div className="mt-2 h-2 w-32 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${(score / 1000) * 100}%`,
                  backgroundColor: tier.color,
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        className="rounded-2xl bg-white p-6 shadow-lg"
        {...fadeIn}
        transition={{ delay: 0.2 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
          <button
            type="button"
            className="text-sm font-semibold text-purple-600 hover:underline"
          >
            View All
          </button>
        </div>

        {activityDisplay.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-500">
              No activity yet. Visit the Earn tab to get started!
            </p>
            <Link
              href="/rewards/earn"
              className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:underline"
            >
              Go to Earn <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        ) : (
          <div className="space-y-0">
            {activityDisplay.map((entry) => {
              const displayName =
                entry.merchant_id
                  ? merchantGrid.find((m) => m.merchant_id === entry.merchant_id)
                      ?.display_name ?? entry.merchant_id
                  : getRewardSourceName(entry);
              const isRedeemed = entry.status === "redeemed";
              const bgColor = isRedeemed ? "bg-amber-100" : "bg-green-100";

              return (
                <div
                  key={entry.reward_id}
                  className="flex items-center justify-between border-b border-slate-100 py-4 transition-colors last:border-b-0 hover:bg-purple-50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgColor}`}
                    >
                      {getActivityIcon(entry)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{displayName}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        isRedeemed ? "text-amber-600" : "text-green-600"
                      }`}
                    >
                      {isRedeemed ? "-" : "+"}
                      {formatCurrency(entry.user_share)}
                    </p>
                    <StatusBadge status={entry.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
