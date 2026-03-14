"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRewardsStore } from "@/app/lib/rewards/store";
import { formatCurrency } from "@credx/shared";
import { AppIcon } from "@/app/lib/iconMap";
import { StatusBadge } from "@/app/components/rewards";
import { CreditCard, Copy, ArrowSquareOut } from "@phosphor-icons/react";
import type { CouponOrder } from "@credx/shared";

type FilterTab = "all" | "active" | "redeemed" | "expired";

function voucherStatusToRewardStatus(
  vs: CouponOrder["voucher_status"]
): "ordered" | "payment_pending" | "payment_confirmed" | "voucher_generated" | "delivered" | "redeemed" | "expired" | "refunded" {
  const map: Record<CouponOrder["voucher_status"], "payment_pending" | "voucher_generated" | "delivered" | "redeemed" | "expired" | "refunded"> = {
    pending_generation: "payment_pending",
    generated: "voucher_generated",
    delivered: "delivered",
    delivery_failed: "refunded",
    redeemed: "redeemed",
    expired: "expired",
  };
  return map[vs] ?? "payment_pending";
}

function daysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function MyCardsPage() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [revealedCodes, setRevealedCodes] = useState<Set<string>>(new Set());

  const { userOrders, fetchUserOrders } = useRewardsStore();

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  const filteredOrders = userOrders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "active")
      return ["pending_generation", "generated", "delivered"].includes(order.voucher_status);
    if (filter === "redeemed") return order.voucher_status === "redeemed";
    if (filter === "expired") return order.voucher_status === "expired";
    return true;
  });

  const toggleReveal = (orderId: string) => {
    setRevealedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  if (userOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEEDF8]">
          <CreditCard size={32} weight="duotone" className="text-[#1C1C78]" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No cards yet</h2>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Head to Shop Cards to get started!
        </p>
        <Link
          href="/rewards/earn"
          className="mt-6 rounded-xl bg-gradient-to-r from-[#1C1C78] to-[#0F0F5C] px-6 py-3 font-semibold text-white shadow-lg hover:opacity-95"
        >
          Shop Cards
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">My Cards</h2>
        <p className="mt-1 text-slate-500">Your purchased coupon cards</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "active", "redeemed", "expired"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition-all ${
              filter === tab
                ? "bg-[#1C1C78] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Card list */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const isRevealed = revealedCodes.has(order.order_id);
          const daysLeft = daysUntilExpiry(order.expiry_date);
          const showCountdown = daysLeft !== null && daysLeft >= 0 && daysLeft < 30;

          return (
            <div
              key={order.order_id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEEDF8]">
                    <AppIcon name={order.merchant_id} size={24} weight="fill" colored />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{order.merchant_display_name}</p>
                    <p className="text-sm text-slate-500">
                      {formatCurrency(order.face_value)} card
                    </p>
                  </div>
                </div>
                <StatusBadge status={voucherStatusToRewardStatus(order.voucher_status)} />
              </div>

              {order.voucher_code && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase text-slate-500">
                    Voucher Code
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 font-mono text-sm font-bold text-[#1C1C78]">
                      {isRevealed ? order.voucher_code : "XXXX-XXXX"}
                    </code>
                    <button
                      type="button"
                      onClick={() => toggleReveal(order.order_id)}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[#1C1C78] shadow-sm hover:bg-slate-50"
                    >
                      {isRevealed ? "Hide" : "Reveal"}
                    </button>
                    {isRevealed && (
                      <button
                        type="button"
                        onClick={() => copyCode(order.voucher_code!)}
                        className="rounded-lg p-2 hover:bg-slate-200"
                        title="Copy"
                      >
                        <Copy size={18} weight="bold" />
                      </button>
                    )}
                  </div>
                  {order.deep_link && (
                    <a
                      href={order.deep_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#1C1C78] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0F0F5C]"
                    >
                      Use in {order.merchant_display_name}
                      <ArrowSquareOut size={16} weight="bold" />
                    </a>
                  )}
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>Expires {order.expiry_date ?? "—"}</span>
                {showCountdown && daysLeft !== null && (
                  <span className="font-semibold text-amber-600">
                    {daysLeft} days left
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <p className="py-8 text-center text-slate-500">
          No cards in this category.
        </p>
      )}
    </div>
  );
}
