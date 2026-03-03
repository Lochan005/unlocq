"use client";

import type { RewardStatus } from "@/app/lib/types";

const statusConfig: Record<
  RewardStatus,
  { label: string; bgColor: string; textColor: string; dotColor: string }
> = {
  tracked: {
    label: "Tracked",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    dotColor: "bg-blue-500",
  },
  pending: {
    label: "Pending",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    dotColor: "bg-amber-500",
  },
  under_confirmation: {
    label: "Confirming",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    dotColor: "bg-orange-500",
  },
  confirmed: {
    label: "Confirmed",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    dotColor: "bg-green-500",
  },
  redeemed: {
    label: "Redeemed",
    bgColor: "bg-[#F1F5F9]",
    textColor: "text-[#0F0F5C]",
    dotColor: "bg-[#3535A8]",
  },
  rejected: {
    label: "Not Earned",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    dotColor: "bg-red-500",
  },
};

interface StatusBadgeProps {
  status: RewardStatus;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold uppercase ${config.bgColor} ${config.textColor} ${
        size === "sm" ? "text-[10px]" : "text-xs"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
