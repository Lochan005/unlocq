import { couponCatalogue } from "../data/couponCatalogue";
import merchantsData from "../data/merchants.json";
export function getCatalogue(category) {
    let items = [...couponCatalogue];
    if (category) {
        items = items.filter((i) => i.category === category);
    }
    return items.sort((a, b) => a.merchant_display_name.localeCompare(b.merchant_display_name));
}
export function getCatalogueItem(itemId) {
    return couponCatalogue.find((c) => c.item_id === itemId) ?? null;
}
export function getMerchantDenominations(merchantId) {
    return couponCatalogue
        .filter((c) => c.merchant_id === merchantId)
        .sort((a, b) => a.face_value - b.face_value);
}
export function getMerchantStock(merchantId) {
    const hasInStock = couponCatalogue.some((c) => c.merchant_id === merchantId && c.in_stock);
    return hasInStock ? "in_stock" : "out_of_stock";
}
export function getAllMerchantsWithStatus() {
    const merchants = merchantsData;
    return merchants.map((m) => ({
        merchant_id: m.merchant_id,
        display_name: m.display_name,
        icon_key: m.icon_key,
        category: m.category,
        brand_color: m.brand_color,
        status: getMerchantStock(m.merchant_id),
    }));
}
//# sourceMappingURL=catalogueEngine.js.map