import type { CouponOrder } from "@/app/lib/types";
import { couponCatalogue } from "../data/couponCatalogue";

const orderStore: CouponOrder[] = [];

function randomAlphanumeric(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function initiatePurchase(
  userId: string,
  itemId: string,
  paymentMethod: "upi" | "card" | "net_banking"
): CouponOrder {
  const item = couponCatalogue.find((c) => c.item_id === itemId);
  if (!item) {
    throw new Error(`Catalogue item not found: ${itemId}`);
  }
  if (!item.in_stock) {
    throw new Error(`Item out of stock: ${itemId}`);
  }

  const orderId = crypto.randomUUID();
  const idempotencyKey = crypto.randomUUID();
  const now = new Date().toISOString();

  const order: CouponOrder = {
    order_id: orderId,
    user_id: userId,
    item_id: item.item_id,
    merchant_id: item.merchant_id,
    merchant_display_name: item.merchant_display_name,
    face_value: item.face_value,
    discounted_price: item.discounted_price,
    cashback_amount: item.cashback_amount,
    payment_method: paymentMethod,
    payment_status: "pending",
    voucher_code: null,
    voucher_status: "pending_generation",
    delivery_channel: null,
    deep_link: null,
    expiry_date: null,
    idempotency_key: idempotencyKey,
    created_at: now,
    payment_confirmed_at: null,
    voucher_generated_at: null,
    delivered_at: null,
    redeemed_at: null,
  };

  orderStore.push(order);
  return order;
}

export function confirmPayment(orderId: string): CouponOrder {
  const idx = orderStore.findIndex((o) => o.order_id === orderId);
  if (idx < 0) {
    throw new Error(`Order not found: ${orderId}`);
  }

  const now = new Date().toISOString();
  orderStore[idx] = {
    ...orderStore[idx],
    payment_status: "confirmed",
    payment_confirmed_at: now,
  };

  return generateVoucher(orderId);
}

export function generateVoucher(orderId: string): CouponOrder {
  const idx = orderStore.findIndex((o) => o.order_id === orderId);
  if (idx < 0) {
    throw new Error(`Order not found: ${orderId}`);
  }

  const order = orderStore[idx];
  const voucherCode = `UNLOQ1-${order.merchant_id.toUpperCase()}-${randomAlphanumeric(6)}`;
  const now = new Date().toISOString();

  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 6);
  const deepLink = `https://www.${order.merchant_id}.com/redeem?code=${encodeURIComponent(voucherCode)}`;

  orderStore[idx] = {
    ...order,
    voucher_status: "generated",
    voucher_code: voucherCode,
    voucher_generated_at: now,
    deep_link: deepLink,
    expiry_date: expiryDate.toISOString().slice(0, 10),
  };

  return deliverVoucher(orderId);
}

export function deliverVoucher(orderId: string): CouponOrder {
  const idx = orderStore.findIndex((o) => o.order_id === orderId);
  if (idx < 0) {
    throw new Error(`Order not found: ${orderId}`);
  }

  const now = new Date().toISOString();
  orderStore[idx] = {
    ...orderStore[idx],
    voucher_status: "delivered",
    delivery_channel: "on_screen",
    delivered_at: now,
  };

  return orderStore[idx];
}

export function getOrderById(orderId: string): CouponOrder | null {
  return orderStore.find((o) => o.order_id === orderId) ?? null;
}

export function getUserOrders(userId: string): CouponOrder[] {
  return orderStore
    .filter((o) => o.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getOrderStore(): CouponOrder[] {
  return [...orderStore];
}
