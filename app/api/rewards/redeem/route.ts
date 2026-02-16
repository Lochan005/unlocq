import { NextResponse } from "next/server";
import { redeemFromPool } from "@/app/lib/rewards/engine/rewardsLedger";

export async function POST(request: Request) {
  try {
    const { userId, amount, type } = await request.json();

    if (!userId || !amount || !type) {
      return NextResponse.json(
        { success: false, error: "userId, amount, and type are required" },
        { status: 400 }
      );
    }

    if (!["prepay", "voucher", "donate"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "type must be 'prepay', 'voucher', or 'donate'",
        },
        { status: 400 }
      );
    }

    const result = redeemFromPool(userId, amount, type);

    return NextResponse.json({
      success: result.success,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process redemption" },
      { status: 500 }
    );
  }
}
