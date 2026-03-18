import { NextResponse } from "next/server";
import { redeemFromPool, restoreRecentRedemption } from "@credx/shared";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, amount, type } = body;

    if (type === "restore") {
      if (!userId) {
        return NextResponse.json(
          { success: false, error: "userId is required" },
          { status: 400 }
        );
      }
      const result = restoreRecentRedemption(userId);
      return NextResponse.json({ success: result.success, data: result });
    }

    if (!userId || !amount || !type) {
      return NextResponse.json(
        { success: false, error: "userId, amount, and type are required" },
        { status: 400 }
      );
    }

    if (!["prepay", "voucher"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "type must be 'prepay' or 'voucher'",
        },
        { status: 400 }
      );
    }

    const result = redeemFromPool(userId, amount, type);

    return NextResponse.json({
      success: result.success,
      data: result,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to process redemption" },
      { status: 500 }
    );
  }
}
