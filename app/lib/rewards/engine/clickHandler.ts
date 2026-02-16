import type { ClickEvent, MerchantRoute } from "@/app/lib/types";
import { resolveRoute } from "./routingEngine";

const clickStore: ClickEvent[] = [];

export function generateTrackedLink(
  route: MerchantRoute,
  userId: string,
  clickId: string
): string {
  return `https://tracking.unloq1.in/${route.network}/${route.merchant_id}?sub_id=${userId}&click_id=${clickId}`;
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
