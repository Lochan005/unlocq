import type { CouponOrder } from "../../types";
export declare function initiatePurchase(userId: string, itemId: string, paymentMethod: "upi" | "card" | "net_banking"): CouponOrder;
export declare function confirmPayment(orderId: string): CouponOrder;
export declare function generateVoucher(orderId: string): CouponOrder;
export declare function deliverVoucher(orderId: string): CouponOrder;
export declare function getOrderById(orderId: string): CouponOrder | null;
export declare function getUserOrders(userId: string): CouponOrder[];
export declare function getOrderStore(): CouponOrder[];
//# sourceMappingURL=purchaseEngine.d.ts.map