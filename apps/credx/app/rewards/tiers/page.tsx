"use client";

import type { UserTier } from "@credx/shared";
import { useRewardsStore } from "@/app/lib/rewards/store";
import { AppIcon } from "@/app/lib/iconMap";
import { Rocket, Confetti, Fire } from "@phosphor-icons/react";

const tiersData = [
  {
    name: "Bronze" as const,
    tier: "bronze" as UserTier,
    requirement: "Sign up",
    bonusPercent: "0%",
    color: "#cd7f32",
    iconKey: "bronze",
    benefits: ["Base reward rates", "Basic features"],
    multiplierNote: "",
    prepayThreshold: 0,
  },
  {
    name: "Silver" as const,
    tier: "silver" as UserTier,
    requirement: "3 prepayments OR ₹5K lifetime pool",
    bonusPercent: "+10%",
    color: "#c0c0c0",
    iconKey: "silver",
    benefits: ["+10% bonus on shopping rewards", "Priority support"],
    multiplierNote:
      "Silver members earn a 10% platform bonus on top of shopping rewards",
    prepayThreshold: 3,
  },
  {
    name: "Gold" as const,
    tier: "gold" as UserTier,
    requirement: "6 prepayments OR ₹15K lifetime pool",
    bonusPercent: "+25%",
    color: "#ffd700",
    iconKey: "gold",
    benefits: [
      "+25% bonus on shopping rewards",
      "Exclusive deals",
      "Early feature access",
    ],
    multiplierNote:
      "Gold members earn a 25% platform bonus on top of shopping rewards",
    prepayThreshold: 6,
  },
  {
    name: "Platinum" as const,
    tier: "platinum" as UserTier,
    requirement: "12 prepayments OR ₹30K lifetime pool",
    bonusPercent: "+50%",
    color: "#e5e4e2",
    iconKey: "platinum",
    benefits: [
      "+50% bonus on shopping rewards",
      "VIP support",
      "Partner exclusives",
      "Concierge service",
    ],
    multiplierNote:
      "Platinum members earn a 50% platform bonus on top of shopping rewards",
    prepayThreshold: 12,
  },
];

const streakMultipliers = [
  { months: 3, multiplier: "1.5x" },
  { months: 6, multiplier: "2x" },
  { months: 9, multiplier: "2.5x" },
  { months: 12, multiplier: "3x" },
];

export default function TiersPage() {
  const userProfile = useRewardsStore((state) => state.userProfile);
  const currentTier = userProfile?.current_tier ?? "bronze";
  const currentPrepayments = userProfile?.total_prepayments_count ?? 0;
  const currentStreak = userProfile?.current_streak_months ?? 0;

  const currentIndex = tiersData.findIndex((t) => t.tier === currentTier);
  const nextTier = tiersData[currentIndex + 1];
  const isPlatinum = currentTier === "platinum";

  const progressToNext = nextTier
    ? (currentPrepayments / nextTier.prepayThreshold) * 100
    : 100;
  const remainingPrepayments = nextTier
    ? Math.max(0, nextTier.prepayThreshold - currentPrepayments)
    : 0;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">
          Membership Tiers
        </h2>
        <p className="mt-1 text-slate-500">
          Higher tiers unlock better rewards and exclusive benefits
        </p>
      </div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiersData.map((tier) => {
          const isCurrent = tier.tier === currentTier;
          return (
            <div
              key={tier.tier}
              className={`relative rounded-2xl p-6 ${
                isCurrent
                  ? "border-2 border-[#3535A8] bg-gradient-to-br from-[#F1F5F9]/50 to-white shadow-lg"
                  : "border border-slate-200 bg-slate-50"
              }`}
            >
              {isCurrent && (
                <span className="absolute right-3 top-3 rounded-full bg-[#1C1C78] px-2 py-0.5 text-[10px] font-bold text-white">
                  CURRENT
                </span>
              )}
              <div
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${tier.color}40, ${tier.color}20)`,
                }}
              >
                <AppIcon name={tier.iconKey} size={28} weight="fill" colored />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{tier.name}</h3>
              <p className="mt-1 text-xs text-slate-500">{tier.requirement}</p>
              {tier.bonusPercent !== "0%" && (
                <span className="mt-2 inline-block rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                  {tier.bonusPercent} Bonus
                </span>
              )}
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {tier.benefits.map((b) => (
                  <li key={b}>• {b}</li>
                ))}
              </ul>
              {tier.multiplierNote && (
                <p className="mt-3 text-xs italic text-slate-500">
                  {tier.multiplierNote}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress to Next Tier */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
          <Rocket size={22} weight="duotone" className="text-[#1C1C78]" /> Progress to {nextTier?.name ?? "Platinum"}
        </h3>

        {isPlatinum ? (
          <p className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 p-4 text-center text-amber-800">
            <Confetti size={20} weight="duotone" /> You&apos;ve reached the highest tier! Keep your streak going for
            maximum rewards.
          </p>
        ) : nextTier ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-600">
                {currentPrepayments} / {nextTier.prepayThreshold} prepayments
              </p>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1C1C78] to-[#0F0F5C] transition-all"
                  style={{ width: `${Math.min(100, progressToNext)}%` }}
                />
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="flex items-center gap-1 text-sm font-semibold text-[#1C1C78]">
                {remainingPrepayments} more prepayments to {nextTier.name}{" "}
                <AppIcon name={nextTier.iconKey} size={16} weight="duotone" />
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Streak Multipliers */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
          <Fire size={22} weight="duotone" className="text-amber-500" /> Streak Multipliers
        </h3>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {streakMultipliers.map(({ months, multiplier }) => {
            const isActive = currentStreak >= months;
            return (
              <div
                key={months}
                className={`rounded-xl p-4 ${
                  isActive
                    ? "border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50"
                    : "border border-slate-200 bg-slate-50"
                }`}
              >
                <p className="text-sm text-slate-600">{months} months</p>
                <p className="mt-1 text-2xl font-bold text-slate-800">
                  {multiplier}
                </p>
                {isActive && (
                  <span className="mt-2 inline-block rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    ACTIVE
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
