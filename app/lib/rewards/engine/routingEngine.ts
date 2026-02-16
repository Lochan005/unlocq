import type { MerchantRoute, MerchantWithStatus } from "@/app/lib/types";
import { merchantRoutes } from "../data/merchantRoutes";
import merchantsData from "@/data/rewards/merchants.json";

export function getActiveRoutes(
  merchantId: string,
  currentDate: Date = new Date()
): MerchantRoute[] {
  const now = currentDate.toISOString().slice(0, 10);

  return merchantRoutes
    .filter(
      (r) =>
        r.merchant_id === merchantId &&
        r.reward_active &&
        r.valid_from <= now &&
        r.valid_till >= now
    )
    .sort((a, b) => a.priority - b.priority);
}

export function resolveRoute(
  merchantId: string
): { route: MerchantRoute | null; rewardExpected: boolean } {
  const routes = getActiveRoutes(merchantId);
  if (routes.length > 0) {
    return { route: routes[0], rewardExpected: true };
  }
  return { route: null, rewardExpected: false };
}

export function getMerchantStatus(merchantId: string): "active" | "inactive" {
  const routes = getActiveRoutes(merchantId);
  return routes.length > 0 ? "active" : "inactive";
}

export function getAllMerchantsWithStatus(): MerchantWithStatus[] {
  const merchants = merchantsData as Array<{
    merchant_id: string;
    display_name: string;
    icon_key: string;
    category: string;
    brand_color: string;
  }>;

  return merchants.map((m) => ({
    merchant_id: m.merchant_id,
    display_name: m.display_name,
    icon_key: m.icon_key,
    category: m.category as MerchantWithStatus["category"],
    brand_color: m.brand_color,
    status: getMerchantStatus(m.merchant_id),
  }));
}
