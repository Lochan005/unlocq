"use client";

import type { UserTier } from "@/app/lib/types";
import { AppIcon } from "@/app/lib/iconMap";

const tierConfig: Record<
  UserTier,
  {
    label: string;
    iconKey: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  bronze: {
    label: "BRONZE",
    iconKey: "bronze",
    bgColor: "bg-orange-50",
    textColor: "text-orange-800",
    borderColor: "border-orange-300",
  },
  silver: {
    label: "SILVER",
    iconKey: "silver",
    bgColor: "bg-slate-100",
    textColor: "text-slate-700",
    borderColor: "border-slate-300",
  },
  gold: {
    label: "GOLD",
    iconKey: "gold",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-400",
  },
  platinum: {
    label: "PLATINUM",
    iconKey: "platinum",
    bgColor: "bg-purple-50",
    textColor: "text-purple-800",
    borderColor: "border-purple-300",
  },
};

interface TierBadgeProps {
  tier: UserTier;
  size?: "sm" | "md";
}

export default function TierBadge({ tier, size = "sm" }: TierBadgeProps) {
  const config = tierConfig[tier];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border font-bold ${config.bgColor} ${config.textColor} ${config.borderColor} ${
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      }`}
    >
      <AppIcon name={config.iconKey} size={size === "sm" ? 12 : 14} weight="fill" colored /> {config.label}
    </span>
  );
}
