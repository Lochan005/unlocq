"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRewardsStore } from "@/app/lib/rewards/store";
import { ChartBar, Coins, Bank, Gift, Crown } from "@phosphor-icons/react";

const rewardsTabs = [
  { id: "overview", label: "Overview", href: "/rewards", Icon: ChartBar },
  { id: "earn", label: "Earn", href: "/rewards/earn", Icon: Coins },
  { id: "pool", label: "Pool", href: "/rewards/pool", Icon: Bank },
  { id: "redeem", label: "Redeem", href: "/rewards/redeem", Icon: Gift },
  { id: "tiers", label: "Tiers", href: "/rewards/tiers", Icon: Crown },
];

export default function RewardsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const refreshData = useRewardsStore((state) => state.refreshData);
  const isLoading = useRewardsStore((state) => state.isLoading);

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getActiveTab = () => {
    if (pathname === "/rewards") return "overview";
    const segment = pathname.split("/").pop();
    return segment || "overview";
  };

  const activeTab = getActiveTab();

  return (
    <div className="mx-auto max-w-7xl overflow-x-hidden px-4 py-8 sm:px-6">
      {/* Tab Navigation */}
      <nav className="mb-8 flex flex-nowrap gap-2 overflow-x-auto rounded-xl bg-[#F1F5F9] p-1.5">
        {rewardsTabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg px-5 py-3 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-[#1C1C78] shadow-md"
                : "text-slate-500 hover:bg-[#EEEDF8]/50 hover:text-[#1C1C78]"
            }`}
          >
            <tab.Icon size={18} weight={activeTab === tab.id ? "duotone" : "regular"} />
            {tab.label}
          </Link>
        ))}
      </nav>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#3535A8] border-t-transparent" />
            <p className="text-sm text-slate-500">Loading your rewards...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
