import type { MerchantRoute } from "@/app/lib/types";

const baseDate = "2026-01-01T00:00:00Z";

const merchantConfig: Array<{
  merchant_id: string;
  display_name: string;
  icon_key: string;
  category: MerchantRoute["category"];
  commission_pct: number;
  cap: number;
}> = [
  { merchant_id: "swiggy", display_name: "Swiggy", icon_key: "swiggy", category: "food", commission_pct: 1.5, cap: 500 },
  { merchant_id: "zomato", display_name: "Zomato", icon_key: "zomato", category: "food", commission_pct: 1.2, cap: 500 },
  { merchant_id: "blinkit", display_name: "Blinkit", icon_key: "blinkit", category: "grocery", commission_pct: 2.5, cap: 500 },
  { merchant_id: "zepto", display_name: "Zepto", icon_key: "zepto", category: "grocery", commission_pct: 2.8, cap: 500 },
  { merchant_id: "bigbasket", display_name: "BigBasket", icon_key: "bigbasket", category: "grocery", commission_pct: 2.2, cap: 500 },
  { merchant_id: "amazon", display_name: "Amazon", icon_key: "amazon", category: "shopping", commission_pct: 5, cap: 1000 },
  { merchant_id: "flipkart", display_name: "Flipkart", icon_key: "flipkart", category: "shopping", commission_pct: 6, cap: 1000 },
  { merchant_id: "myntra", display_name: "Myntra", icon_key: "myntra", category: "fashion", commission_pct: 7, cap: 1000 },
  { merchant_id: "nykaa", display_name: "Nykaa", icon_key: "nykaa", category: "beauty", commission_pct: 6, cap: 500 },
  { merchant_id: "croma", display_name: "Croma", icon_key: "croma", category: "electronics", commission_pct: 2, cap: 500 },
  { merchant_id: "bookmyshow", display_name: "BookMyShow", icon_key: "bookmyshow", category: "entertainment", commission_pct: 2, cap: 500 },
  { merchant_id: "makemytrip", display_name: "MakeMyTrip", icon_key: "makemytrip", category: "travel", commission_pct: 2.5, cap: 500 },
];

export const merchantRoutes: MerchantRoute[] = merchantConfig.flatMap((m) => {
  const primary: MerchantRoute = {
    route_id: `route_${m.merchant_id}_1`,
    merchant_id: m.merchant_id,
    merchant_display_name: m.display_name,
    merchant_logo_url: m.icon_key,
    category: m.category,
    network: "cuelinks",
    priority: 1,
    reward_active: m.merchant_id === "bookmyshow" ? false : m.merchant_id === "makemytrip" ? false : true,
    valid_from: "2026-01-01",
    valid_till: m.merchant_id === "bookmyshow" ? "2026-01-31" : "2026-06-30",
    expected_commission_pct: m.commission_pct,
    cap_amount: m.cap,
    created_at: baseDate,
    updated_at: baseDate,
  };

  const secondary: MerchantRoute = {
    route_id: `route_${m.merchant_id}_2`,
    merchant_id: m.merchant_id,
    merchant_display_name: m.display_name,
    merchant_logo_url: m.icon_key,
    category: m.category,
    network: "admitad",
    priority: 2,
    reward_active: m.merchant_id === "makemytrip" ? false : true,
    valid_from: "2026-01-01",
    valid_till: "2026-09-30",
    expected_commission_pct: m.commission_pct,
    cap_amount: m.cap,
    created_at: baseDate,
    updated_at: baseDate,
  };

  return [primary, secondary];
});
