import { NextResponse } from "next/server";
import {
  getPoolBalance,
  getRecentActivity,
  getMonthlyEarnings,
  getLifetimeStats,
} from "@credx/shared";

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

    const poolBalance = getPoolBalance(userId);
    const recentActivity = getRecentActivity(userId, 15);
    const monthlyEarnings = getMonthlyEarnings(userId);
    const lifetimeStats = getLifetimeStats(userId);

    return NextResponse.json({
      success: true,
      data: {
        poolBalance,
        recentActivity,
        monthlyEarnings,
        lifetimeStats,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch ledger data" },
      { status: 500 }
    );
  }
}
