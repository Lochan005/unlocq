"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRewardsStore } from "@/app/lib/rewards/store";
import {
  TierBadge,
  MerchantStatusPill,
  ComplianceFooter,
} from "@/app/components/rewards";
import { AppIcon } from "@/app/lib/iconMap";
import { formatCurrency } from "@credx/shared";
import { ShoppingBag, Lightbulb, Coins, Check, Copy, ArrowSquareOut } from "@phosphor-icons/react";
import { UnloqsCoin } from "@/app/components/icons";
import type { CatalogueItem, MerchantCategory } from "@credx/shared";
import { staggerContainer, staggerItem } from "@/app/lib/animation";

const CATEGORIES: { value: MerchantCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "food", label: "Food" },
  { value: "grocery", label: "Grocery" },
  { value: "shopping", label: "Shopping" },
  { value: "fashion", label: "Fashion" },
  { value: "beauty", label: "Beauty" },
  { value: "electronics", label: "Electronics" },
  { value: "entertainment", label: "Entertainment" },
  { value: "travel", label: "Travel" },
];

const PAYMENT_METHODS = [
  { id: "upi" as const, label: "UPI" },
  { id: "card" as const, label: "Card" },
  { id: "net_banking" as const, label: "Net Banking" },
];

const merchantsData: Record<string, { brand_color: string }> = {
  swiggy: { brand_color: "#fc8019" },
  zomato: { brand_color: "#e23744" },
  blinkit: { brand_color: "#f8c93e" },
  zepto: { brand_color: "#4A4ABF" },
  bigbasket: { brand_color: "#84c225" },
  amazon: { brand_color: "#ff9900" },
  flipkart: { brand_color: "#2874f0" },
  myntra: { brand_color: "#ff3e6c" },
  nykaa: { brand_color: "#fc2779" },
  croma: { brand_color: "#00a651" },
  bookmyshow: { brand_color: "#c4242b" },
  makemytrip: { brand_color: "#eb2026" },
};

function getBrandColor(merchantId: string): string {
  return merchantsData[merchantId]?.brand_color ?? "#1C1C78";
}

function groupByMerchant(items: CatalogueItem[]): Map<string, CatalogueItem[]> {
  const map = new Map<string, CatalogueItem[]>();
  for (const item of items) {
    const existing = map.get(item.merchant_id) ?? [];
    existing.push(item);
    map.set(item.merchant_id, existing);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) => a.face_value - b.face_value);
  }
  return map;
}

export default function EarnPage() {
  const [selectedCategory, setSelectedCategory] = useState<MerchantCategory | "all">("all");
  const [purchaseModal, setPurchaseModal] = useState<{
    items: CatalogueItem[];
    selectedItem: CatalogueItem;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "net_banking">("upi");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<{
    order: { voucher_code: string | null; deep_link: string | null; merchant_display_name: string; cashback_amount: number };
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    catalogue,
    fetchCatalogue,
    purchaseCoupon,
    earnActions,
    userProfile,
  } = useRewardsStore();

  useEffect(() => {
    fetchCatalogue(selectedCategory === "all" ? undefined : selectedCategory);
  }, [selectedCategory, fetchCatalogue]);

  const merchantGroups = groupByMerchant(catalogue);
  const hasInStock = (items: CatalogueItem[]) => items.some((i) => i.in_stock);

  const handleBuyNow = async () => {
    if (!purchaseModal) return;
    setIsPurchasing(true);
    setPurchaseSuccess(null);
    try {
      const result = await purchaseCoupon(purchaseModal.selectedItem.item_id, paymentMethod);
      if (result.success && result.order) {
        setPurchaseSuccess({
          order: {
            voucher_code: result.order.voucher_code,
            deep_link: result.order.deep_link,
            merchant_display_name: result.order.merchant_display_name,
            cashback_amount: result.order.cashback_amount,
          },
        });
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCopyCode = () => {
    if (purchaseSuccess?.order.voucher_code) {
      navigator.clipboard.writeText(purchaseSuccess.order.voucher_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setPurchaseModal(null);
    setPurchaseSuccess(null);
    setPaymentMethod("upi");
  };

  const getTypeBadgeClass = (type: string) => {
    if (type === "one-time") return "bg-slate-100 text-slate-600";
    if (type === "recurring") return "bg-green-100 text-green-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Shop Coupon Cards</h2>
        <p className="mt-1 text-slate-500">
          Buy discounted cards, earn cashback toward your home loan
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setSelectedCategory(cat.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              selectedCategory === cat.value
                ? "bg-[#1C1C78] text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-[#EEEDF8] hover:text-[#1C1C78]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Card grid */}
      {merchantGroups.size === 0 ? (
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-8 text-center">
          <p className="font-medium text-amber-800">
            No cards available in this category. Try another filter or check back soon!
          </p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {Array.from(merchantGroups.entries()).map(([merchantId, items]) => {
            const first = items[0]!;
            const brandColor = getBrandColor(merchantId);
            const inStock = hasInStock(items);

            return (
              <motion.div
                key={merchantId}
                variants={staggerItem}
                className={`rounded-2xl border bg-white p-5 shadow-lg transition-all ${
                  inStock
                    ? "cursor-pointer border-slate-200 hover:border-[#E6E4F5] hover:shadow-xl"
                    : "cursor-not-allowed border-slate-100 opacity-75"
                }`}
                onClick={() => inStock && setPurchaseModal({ items, selectedItem: items[0]! })}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${brandColor}20` }}
                    >
                      <AppIcon name={first.icon_key} size={28} weight="fill" colored />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{first.merchant_display_name}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {items.map((item) => (
                          <span
                            key={item.item_id}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.in_stock) setPurchaseModal({ items, selectedItem: item });
                            }}
                          >
                            ₹{item.face_value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <MerchantStatusPill status={inStock ? "in_stock" : "out_of_stock"} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <span className="rounded bg-green-100 px-2 py-0.5 font-semibold text-green-700">
                    Up to {Math.max(...items.map((i) => i.discount_pct))}% off
                  </span>
                  <span className="rounded bg-[#EEEDF8] px-2 py-0.5 font-semibold text-[#1C1C78]">
                    ₹{Math.max(...items.map((i) => i.cashback_amount))} cashback to pool
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
        <p className="flex items-center gap-2 text-sm text-green-800">
          <Lightbulb size={18} weight="duotone" className="shrink-0 text-green-600" />
          Buy coupon cards at a discount — cashback goes straight to your prepayment pool. The more you shop, the faster your loan shrinks.
        </p>
      </div>

      {/* Earn Bonus Coins */}
      <div className="border-t border-slate-200 pt-10">
        <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <Coins size={22} weight="duotone" className="text-amber-500" /> Earn Bonus Coins
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Complete actions to earn coins for your prepayment pool
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {userProfile?.current_tier && (
            <TierBadge tier={userProfile.current_tier} />
          )}{" "}
          {["bronze", "silver", "gold", "platinum"].includes(userProfile?.current_tier ?? "")
            ? `${userProfile?.current_tier?.charAt(0).toUpperCase()}${userProfile?.current_tier?.slice(1)}: +bonus on cashback`
            : ""}
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
                  <p className="font-semibold text-slate-800">{action.action_name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getTypeBadgeClass(action.type)}`}>
                    {action.type}
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    +{action.coins} <UnloqsCoin size={14} color="#92400e" />
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{action.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ComplianceFooter variant="earn" />

      {/* Purchase Modal */}
      <AnimatePresence>
        {purchaseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {!purchaseSuccess ? (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${getBrandColor(purchaseModal.selectedItem.merchant_id)}20` }}
                    >
                      <AppIcon name={purchaseModal.selectedItem.icon_key} size={28} weight="fill" colored />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{purchaseModal.selectedItem.merchant_display_name}</h3>
                      <p className="text-sm text-slate-500">Select denomination</p>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {purchaseModal.items.filter((i) => i.in_stock).map((item) => (
                      <button
                        key={item.item_id}
                        type="button"
                        onClick={() => setPurchaseModal((p) => p ? { ...p, selectedItem: item } : null)}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                          purchaseModal.selectedItem.item_id === item.item_id
                            ? "bg-[#1C1C78] text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        ₹{item.face_value}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 rounded-xl bg-slate-50 p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Face value</span>
                      <span className="font-semibold">{formatCurrency(purchaseModal.selectedItem.face_value)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">You pay</span>
                      <span className="font-bold text-[#1C1C78]">{formatCurrency(purchaseModal.selectedItem.discounted_price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Cashback to pool</span>
                      <span className="font-semibold text-green-600">+{formatCurrency(purchaseModal.selectedItem.cashback_amount)}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold text-slate-700">Payment method</p>
                    <div className="flex gap-2">
                      {PAYMENT_METHODS.map((pm) => (
                        <label
                          key={pm.id}
                          className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all ${
                            paymentMethod === pm.id
                              ? "border-[#1C1C78] bg-[#EEEDF8] text-[#1C1C78]"
                              : "border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={pm.id}
                            checked={paymentMethod === pm.id}
                            onChange={() => setPaymentMethod(pm.id)}
                            className="sr-only"
                          />
                          {pm.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleBuyNow}
                      disabled={isPurchasing}
                      className="flex-1 rounded-xl bg-gradient-to-r from-[#1C1C78] to-[#0F0F5C] px-4 py-3 font-semibold text-white shadow-lg disabled:opacity-50"
                    >
                      {isPurchasing ? "Processing..." : "Buy Now"}
                    </button>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="mb-4 flex justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
                    >
                      <Check size={32} weight="bold" className="text-green-600" />
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Purchase successful!</h3>
                  <p className="mt-2 text-sm font-semibold text-green-600">
                    {formatCurrency(purchaseSuccess.order.cashback_amount)} cashback added to your pool!
                  </p>

                  {purchaseSuccess.order.voucher_code && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="mb-2 text-[10px] font-semibold uppercase text-slate-500">Voucher Code</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 font-mono text-sm font-bold text-[#1C1C78]">
                          {purchaseSuccess.order.voucher_code}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="rounded-lg bg-white px-3 py-2 shadow-sm hover:bg-slate-50"
                        >
                          <Copy size={18} weight="bold" />
                        </button>
                      </div>
                      {copied && <p className="mt-1 text-xs text-green-600">Copied!</p>}
                      {purchaseSuccess.order.deep_link && (
                        <a
                          href={purchaseSuccess.order.deep_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#1C1C78] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0F0F5C]"
                        >
                          Use in {purchaseSuccess.order.merchant_display_name}
                          <ArrowSquareOut size={16} weight="bold" />
                        </a>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#1C1C78] to-[#0F0F5C] px-4 py-3 font-semibold text-white"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
