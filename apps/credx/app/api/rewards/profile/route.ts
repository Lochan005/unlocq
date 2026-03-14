import { NextResponse } from "next/server";
import { mockUserProfile, getPoolBalance } from "@credx/shared";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    // For MVP, return mock profile with live pool balance from ledger
    const livePoolBalance = getPoolBalance(userId);
    const profile = {
      ...mockUserProfile,
      pool_balance_confirmed: livePoolBalance.confirmed,
      pool_balance_pending: livePoolBalance.pending,
      coins_confirmed: livePoolBalance.confirmed * 10,
      coins_pending: livePoolBalance.pending * 10,
    };

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
