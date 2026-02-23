import { NextResponse } from "next/server";
import type { PostbackEvent, PostbackStatus } from "@/app/lib/types";
import { creditToPool } from "@/app/lib/rewards/engine/rewardsLedger";
import { getClickById } from "@/app/lib/rewards/engine/clickHandler";

// ============================================================
// Postback Listener — GET & POST
// ============================================================
//
// Accepts inbound postbacks from affiliate networks (Cuelinks, Admitad, etc.)
// and credits the user's reward pool.
//
// Expected parameters (query string for GET, JSON body for POST):
//   sub_id   — Required. Maps 1-to-1 with the internal userId.
//   amount   — Required. Gross commission amount from the network.
//   status   — Required. "pending" | "approved" | "rejected".
//   click_id — Optional. The click_id we sent in the outbound tracked link.
//   txn_id   — Optional. The network's own transaction identifier.
// ============================================================

const VALID_STATUSES: PostbackStatus[] = ["pending", "approved", "rejected"];

const postbackStore: PostbackEvent[] = [];

function parseParams(
  params: Record<string, string | null>
): { error: string | null; data: { subId: string; amount: number; status: PostbackStatus; clickId: string | null; txnId: string | null } | null } {
  const subId = params.sub_id?.trim() ?? null;
  const amountRaw = params.amount?.trim() ?? null;
  const statusRaw = params.status?.trim()?.toLowerCase() ?? null;
  const clickId = params.click_id?.trim() || null;
  const txnId = params.txn_id?.trim() || null;

  if (!subId) return { error: "Missing required parameter: sub_id", data: null };
  if (!amountRaw) return { error: "Missing required parameter: amount", data: null };
  if (!statusRaw) return { error: "Missing required parameter: status", data: null };

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "Parameter 'amount' must be a non-negative number", data: null };
  }

  if (!VALID_STATUSES.includes(statusRaw as PostbackStatus)) {
    return { error: `Parameter 'status' must be one of: ${VALID_STATUSES.join(", ")}`, data: null };
  }

  return {
    error: null,
    data: {
      subId,
      amount,
      status: statusRaw as PostbackStatus,
      clickId,
      txnId,
    },
  };
}

function handlePostback(params: Record<string, string | null>, rawParams: Record<string, string>) {
  const parsed = parseParams(params);
  if (parsed.error || !parsed.data) {
    return NextResponse.json(
      { success: false, error: parsed.error },
      { status: 400 }
    );
  }

  const { subId, amount, status, clickId, txnId } = parsed.data;
  const userId = subId;

  // Resolve merchant context from the original click (if available)
  const click = clickId ? getClickById(clickId) : null;
  const merchantId = click?.merchant_id ?? null;
  const network = click?.network ?? null;

  // Build the PostbackEvent audit record
  const postbackId = crypto.randomUUID();
  const postbackEvent: PostbackEvent = {
    postback_id: postbackId,
    sub_id: subId,
    click_id: clickId,
    transaction_id: txnId,
    merchant_id: merchantId,
    network,
    amount,
    status,
    raw_params: rawParams,
    received_at: new Date().toISOString(),
    processed: false,
  };

  // For "rejected" postbacks we log but do not credit
  if (status === "rejected") {
    postbackEvent.processed = true;
    postbackStore.push(postbackEvent);

    return NextResponse.json({
      success: true,
      message: "Postback logged; no credit applied for rejected status",
      postback_id: postbackId,
    });
  }

  // Credit the user's pool (handles both "pending" and "approved")
  const { entry, logEntry } = creditToPool(
    userId,
    amount,
    postbackId,
    clickId,
    merchantId,
    network,
    status
  );

  postbackEvent.processed = true;
  postbackStore.push(postbackEvent);

  return NextResponse.json({
    success: true,
    message: `Postback processed — ${status === "approved" ? "confirmed" : "pending"} credit of ₹${entry.user_share} applied`,
    postback_id: postbackId,
    reward_id: entry.reward_id,
    log_id: logEntry.log_id,
    amount_credited: entry.user_share,
  });
}

/**
 * GET /api/rewards/postback?sub_id=...&amount=...&status=...
 * Standard affiliate network pixel/postback format.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      rawParams[key] = value;
    });

    const params: Record<string, string | null> = {
      sub_id: url.searchParams.get("sub_id"),
      amount: url.searchParams.get("amount"),
      status: url.searchParams.get("status"),
      click_id: url.searchParams.get("click_id"),
      txn_id: url.searchParams.get("txn_id"),
    };

    return handlePostback(params, rawParams);
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error processing postback" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rewards/postback
 * JSON body alternative for S2S integrations.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
      rawParams[key] = String(value);
    }

    const params: Record<string, string | null> = {
      sub_id: body.sub_id ?? null,
      amount: body.amount != null ? String(body.amount) : null,
      status: body.status ?? null,
      click_id: body.click_id ?? null,
      txn_id: body.txn_id ?? null,
    };

    return handlePostback(params, rawParams);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
}
