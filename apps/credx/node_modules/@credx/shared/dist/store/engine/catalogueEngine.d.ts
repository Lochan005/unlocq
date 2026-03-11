import type { CatalogueItem, MerchantCategory, MerchantWithStatus } from "../../types";
export declare function getCatalogue(category?: MerchantCategory): CatalogueItem[];
export declare function getCatalogueItem(itemId: string): CatalogueItem | null;
export declare function getMerchantDenominations(merchantId: string): CatalogueItem[];
export declare function getMerchantStock(merchantId: string): "in_stock" | "out_of_stock";
export declare function getAllMerchantsWithStatus(): MerchantWithStatus[];
//# sourceMappingURL=catalogueEngine.d.ts.map