import type { ClickEvent, MerchantRoute } from "@/app/lib/types";
import { resolveRoute } from "./routingEngine";

const clickStore: ClickEvent[] = [];

/**
 * Assembles the affiliate tracked link from the route's tracking_base_url.
 *
 * URL format:
 *   {tracking_base_url}/{network}/{merchant_id}?sub_id={userId}&click_id={clickId}
 *
 * `sub_id` is **always** the internal userId — this 1-to-1 mapping is how
 * the postback listener reconciles inbound commissions back to the user.
 */
export function generateTrackedLink(
  route: MerchantRoute,
  userId: string,
  clickId: string
): string {
  const base = route.tracking_base_url.replace(/\/+$/, "");
  const subId = encodeURIComponent(userId);
  const cId = encodeURIComponent(clickId);
  return `${base}/${route.network}/${route.merchant_id}?sub_id=${subId}&click_id=${cId}`;
}

export function handleMerchantClick(userId: string, merchantId: string): ClickEvent {
  const { route, rewardExpected } = resolveRoute(merchantId);

  const clickId = crypto.randomUUID();

  const event: ClickEvent = {
    click_id: clickId,
    user_id: userId,
    merchant_id: merchantId,
    route_id: route?.route_id ?? null,
    network: route?.network ?? null,
    reward_expected: rewardExpected,
    reward_basis: rewardExpected ? "affiliate" : "none",
    redirect_url: route
      ? generateTrackedLink(route, userId, clickId)
      : `https://www.${merchantId}.com`,
    timestamp: new Date().toISOString(),
    user_agent: "UnLoQ1-MVP",
    ip_hash: "mock_hash",
  };

  clickStore.push(event);
  return event;
}

export function getClickHistory(userId: string): ClickEvent[] {
  return clickStore
    .filter((e) => e.user_id === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getClickStore(): ClickEvent[] {
  return [...clickStore];
}

/**
 * Resolves a single click event by its click_id.
 * Used by the postback listener to correlate an inbound commission
 * back to the original outbound click.
 */
export function getClickById(clickId: string): ClickEvent | null {
  return clickStore.find((e) => e.click_id === clickId) ?? null;
}
