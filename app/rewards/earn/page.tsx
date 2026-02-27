"use client";

import { useState } from "react";
import { useRewardsStore } from "@/app/lib/rewards/store";
import {
  TierBadge,
  MerchantStatusPill,
  ComplianceFooter,
  ConsentModal,
} from "@/app/components/rewards";
import { AppIcon } from "@/app/lib/iconMap";
import { ShoppingCart, Lightbulb, Coins, Check } from "@phosphor-icons/react";
import { UNLOQ1Coin } from "@/app/components/icons";

export default function EarnPage() {
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [inactiveToast, setInactiveToast] = useState(false);
  const [showShopModal, setShowShopModal] = useState<{
    merchantId: string;
    displayName: string;
    iconKey: string;
    status: "active" | "inactive";
  } | null>(null);
  const [shopSuccess, setShopSuccess] = useState(false);

  const {
    consentGranted,
    merchantGrid,
    earnActions,
    userProfile,
    handleShopClick,
  } = useRewardsStore();

  const handleMerchantClick = (merchant: {
    merchant_id: string;
    display_name: string;
    icon_key: string;
    status: "active" | "inactive";
  }) => {
    if (merchant.status === "inactive") {
      setInactiveToast(true);
      setTimeout(() => setInactiveToast(false), 3000);
      return;
    }
    setShowShopModal({
      merchantId: merchant.merchant_id,
      displayName: merchant.display_name,
      iconKey: merchant.icon_key,
      status: merchant.status,
    });
    setShopSuccess(false);
  };

  const handleShopNow = async () => {
    if (!showShopModal || showShopModal.status !== "active") return;
    try {
      const result = await handleShopClick(showShopModal.merchantId);
      setShopSuccess(true);
      if (result.redirectUrl) {
        window.open(result.redirectUrl, "_blank");
      }
    } catch {
      // Handle error
    }
  };

  const getTierBonusText = () => {
    const tier = userProfile?.current_tier ?? "bronze";
    const bonuses: Record<string, string> = {
      bronze: "Base reward rates",
      silver: "+10% bonus on all cashback",
      gold: "+25% bonus on all cashback",
      platinum: "+50% bonus on all cashback",
    };
    return `${tier.charAt(0).toUpperCase() + tier.slice(1)}: ${bonuses[tier]}`;
  };

  const getTypeBadgeClass = (type: string) => {
    if (type === "one-time") return "bg-slate-100 text-slate-600";
    if (type === "recurring") return "bg-green-100 text-green-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Ways to Earn</h2>
        <p className="mt-1 text-slate-500">
          Every action brings you closer to financial freedom
        </p>
      </div>

      {/* Section A — Shop & Earn (conditional on consent) */}
      {!consentGranted ? (
        <div className="rounded-2xl border-2 border-[#E6E4F5] bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEEDF8]">
              <ShoppingCart size={32} weight="duotone" className="text-[#1C1C78]" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Enable shopping rewards to grow your pool faster
            </h3>
            <p className="mt-2 max-w-md text-sm text-slate-500">
              Shop through our partner links and earn cashback that goes directly
              to your prepayment pool.
            </p>
            <button
              type="button"
              onClick={() => setShowConsentModal(true)}
              className="mt-6 rounded-xl bg-gradient-to-r from-[#1C1C78] to-[#0F0F5C] px-6 py-3 font-semibold text-white shadow-lg shadow-[#E6E4F5] transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Enable Rewards
            </button>
          </div>
        </div>
      ) : merchantGrid.filter((m) => m.status === "active").length === 0 ? (
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
          <p className="text-center font-medium text-amber-800">
            No shopping rewards available right now — check back soon! You can
            still earn coins through actions below.
          </p>
        </div>
      ) : (
        <>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                <ShoppingCart size={22} weight="duotone" className="text-[#1C1C78]" /> Shop & Earn
              </h3>
              <TierBadge tier={userProfile?.current_tier ?? "bronze"} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Your daily purchases contribute to your prepayment pool
            </p>
            <p className="mt-1 text-xs text-slate-400">{getTierBonusText()}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {merchantGrid.map((merchant) => (
              <button
                key={merchant.merchant_id}
                type="button"
                onClick={() => handleMerchantClick(merchant)}
                className={`flex flex-col items-center rounded-xl border p-4 text-center transition-all hover:shadow-md ${
                  merchant.status === "active"
                    ? "cursor-pointer border-slate-200 bg-white hover:border-[#E6E4F5]"
                    : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-75"
                }`}
              >
                <div
                  className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${merchant.brand_color}20`,
                  }}
                >
                  <AppIcon name={merchant.icon_key} size={24} weight="fill" colored />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  {merchant.display_name}
                </p>
                <p className="text-[10px] text-slate-400">{merchant.category}</p>
                <div className="mt-2">
                  <MerchantStatusPill status={merchant.status} />
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
            <p className="flex items-center gap-2 text-sm text-green-800">
              <Lightbulb size={18} weight="duotone" className="shrink-0 text-green-600" />
              Your everyday purchases can grow your prepayment pool. The more
              you shop through UNLOQ1, the faster your loan shrinks.
            </p>
          </div>
        </>
      )}

      {/* Section B — Actions & Bonuses (always visible) */}
      <div className="border-t border-slate-200 pt-10">
        <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <Coins size={22} weight="duotone" className="text-amber-500" /> Earn Bonus Coins
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Complete actions to earn coins for your prepayment pool
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {earnActions.map((action) => (
            <div
              key={action.action_id}
              className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <AppIcon name={action.icon_key} size={24} weight="fill" colored />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-800">
                    {action.action_name}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getTypeBadgeClass(
                      action.type
                    )}`}
                  >
                    {action.type}
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    +{action.coins} <UNLOQ1Coin size={14} color="#92400e" />
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {action.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ComplianceFooter variant="earn" />

      {/* Shop Modal - only for active merchants */}
      {showShopModal && showShopModal.status === "active" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#EEEDF8]">
                <AppIcon name={showShopModal.iconKey} size={28} weight="fill" colored />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {showShopModal.displayName}
                </h3>
                <p className="text-xs text-slate-500">
                  Purchases through this link may earn rewards for your
                  prepayment pool
                </p>
              </div>
            </div>

            {shopSuccess ? (
              <p className="mb-4 flex items-center gap-1.5 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
                <Check size={16} weight="bold" /> Click tracked! Complete your purchase to earn rewards.
              </p>
            ) : (
              <p className="mb-4 text-[11px] leading-relaxed text-slate-500">
                Reward amounts vary by product category and are confirmed after
                the merchant validates your purchase. Typical confirmation takes
                30-60 days.
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowShopModal(null)}
                className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              {showShopModal.status === "active" && (
                <button
                  type="button"
                  onClick={handleShopNow}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#1C1C78] to-[#0F0F5C] px-4 py-3 text-sm font-semibold text-white shadow-lg"
                >
                  Shop Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inactive merchant toast */}
      {inactiveToast && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white shadow-lg">
          Rewards not available for this merchant right now. Check back soon!
        </div>
      )}

      <ConsentModal
        isOpen={showConsentModal}
        onClose={() => setShowConsentModal(false)}
      />
    </div>
  );
}
