"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCatalogue = getCatalogue;
exports.getCatalogueItem = getCatalogueItem;
exports.getMerchantDenominations = getMerchantDenominations;
exports.getMerchantStock = getMerchantStock;
exports.getAllMerchantsWithStatus = getAllMerchantsWithStatus;
const couponCatalogue_1 = require("../data/couponCatalogue");
const merchants_json_1 = __importDefault(require("../data/merchants.json"));
function getCatalogue(category) {
    let items = [...couponCatalogue_1.couponCatalogue];
    if (category) {
        items = items.filter((i) => i.category === category);
    }
    return items.sort((a, b) => a.merchant_display_name.localeCompare(b.merchant_display_name));
}
function getCatalogueItem(itemId) {
    var _a;
    return (_a = couponCatalogue_1.couponCatalogue.find((c) => c.item_id === itemId)) !== null && _a !== void 0 ? _a : null;
}
function getMerchantDenominations(merchantId) {
    return couponCatalogue_1.couponCatalogue
        .filter((c) => c.merchant_id === merchantId)
        .sort((a, b) => a.face_value - b.face_value);
}
function getMerchantStock(merchantId) {
    const hasInStock = couponCatalogue_1.couponCatalogue.some((c) => c.merchant_id === merchantId && c.in_stock);
    return hasInStock ? "in_stock" : "out_of_stock";
}
function getAllMerchantsWithStatus() {
    const merchants = merchants_json_1.default;
    return merchants.map((m) => ({
        merchant_id: m.merchant_id,
        display_name: m.display_name,
        icon_key: m.icon_key,
        category: m.category,
        brand_color: m.brand_color,
        status: getMerchantStock(m.merchant_id),
    }));
}
