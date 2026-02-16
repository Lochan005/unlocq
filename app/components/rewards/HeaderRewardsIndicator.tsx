"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRewardsStore } from "@/app/lib/rewards/store";
import { formatCurrency } from "@/app/lib/currency";
import TierBadge from "./TierBadge";
import StreakBadge from "./StreakBadge";

export default function HeaderRewardsIndicator() {
  const userProfile = useRewardsStore((state) => state.userProfile);
  const poolBalance = useRewardsStore((state) => state.poolBalance);
  const refreshData = useRewardsStore((state) => state.refreshData);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setLoaded(true);
    } else {
      refreshData().then(() => setLoaded(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loaded || !userProfile) return null;

  return (
    <Link
      href="/rewards"
      className="flex items-center gap-3 rounded-xl bg-purple-50 px-3 py-2 transition-colors hover:bg-purple-100"
    >
      <TierBadge tier={userProfile.current_tier} size="sm" />
      <div className="text-right">
        <p className="text-xs text-slate-500">Pool</p>
        <p className="text-sm font-bold text-purple-600">
          {formatCurrency(poolBalance.confirmed)}
        </p>
      </div>
      {userProfile.current_streak_months > 0 && (
        <StreakBadge months={userProfile.current_streak_months} />
      )}
    </Link>
  );
}
