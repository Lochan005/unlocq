import { NextResponse } from "next/server";
import { handleMerchantClick } from "@/app/lib/rewards/engine/clickHandler";

export async function POST(request: Request) {
  try {
    const { userId, merchantId } = await request.json();

    if (!userId || !merchantId) {
      return NextResponse.json(
        { success: false, error: "userId and merchantId are required" },
        { status: 400 }
      );
    }

    const clickEvent = handleMerchantClick(userId, merchantId);

    return NextResponse.json({
      success: true,
      data: clickEvent,
      rewardExpected: clickEvent.reward_expected,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process click" },
      { status: 500 }
    );
  }
}
