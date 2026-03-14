import { NextResponse } from "next/server";
import { initiatePurchase, confirmPayment, creditCashback } from "@credx/shared";

export async function POST(request: Request) {
  try {
    const { userId, itemId, paymentMethod } = await request.json();

    if (!userId || !itemId || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: "userId, itemId, and paymentMethod are required" },
        { status: 400 }
      );
    }

    if (!["upi", "card", "net_banking"].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: "paymentMethod must be upi, card, or net_banking" },
        { status: 400 }
      );
    }

    let order;
    try {
      order = initiatePurchase(userId, itemId, paymentMethod);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Purchase failed";
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }

    const confirmedOrder = confirmPayment(order.order_id);
    creditCashback(
      userId,
      confirmedOrder.order_id,
      confirmedOrder.merchant_id,
      confirmedOrder.cashback_amount
    );

    return NextResponse.json({
      success: true,
      data: {
        order: confirmedOrder,
        cashbackCredited: confirmedOrder.cashback_amount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}
