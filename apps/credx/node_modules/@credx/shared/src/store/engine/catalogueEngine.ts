import type { CatalogueItem, MerchantCategory, MerchantWithStatus } from "../../types";
import { couponCatalogue } from "../data/couponCatalogue";
import merchantsData from "../data/merchants.json";

export function getCatalogue(category?: MerchantCategory): CatalogueItem[] {
  let items = [...couponCatalogue];
  if (category) {
    items = items.filter((i) => i.category === category);
  }
  return items.sort((a, b) =>
    a.merchant_display_name.localeCompare(b.merchant_display_name)
  );
}

export function getCatalogueItem(itemId: string): CatalogueItem | null {
  return couponCatalogue.find((c) => c.item_id === itemId) ?? null;
}

export function getMerchantDenominations(merchantId: string): CatalogueItem[] {
  return couponCatalogue
    .filter((c) => c.merchant_id === merchantId)
    .sort((a, b) => a.face_value - b.face_value);
}

export function getMerchantStock(merchantId: string): "in_stock" | "out_of_stock" {
  const hasInStock = couponCatalogue.some(
    (c) => c.merchant_id === merchantId && c.in_stock
  );
  return hasInStock ? "in_stock" : "out_of_stock";
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
    status: getMerchantStock(m.merchant_id),
  }));
}
