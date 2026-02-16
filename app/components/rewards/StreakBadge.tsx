"use client";

import { Fire } from "@phosphor-icons/react";

interface StreakBadgeProps {
  months: number;
}

export default function StreakBadge({ months }: StreakBadgeProps) {
  if (months <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-gradient-to-r from-amber-100 to-yellow-100 px-3 py-1 text-xs font-bold text-amber-800">
      <Fire size={14} weight="fill" className="text-amber-600" /> {months} month{months !== 1 ? "s" : ""} streak
    </span>
  );
}
