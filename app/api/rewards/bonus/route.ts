import { NextResponse } from "next/server";
import { addPlatformBonus } from "@/app/lib/rewards/engine/rewardsLedger";

export async function POST(request: Request) {
  try {
    const { userId, action, coins } = await request.json();

    if (!userId || !action || coins == null) {
      return NextResponse.json(
        { success: false, error: "userId, action, and coins are required" },
        { status: 400 }
      );
    }

    const entry = addPlatformBonus(userId, action, coins);

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to add bonus" },
      { status: 500 }
    );
  }
}
