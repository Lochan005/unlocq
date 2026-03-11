import { NextResponse } from "next/server";
import { getAllMerchantsWithStatus } from "@/app/lib/rewards/engine/catalogueEngine";

export async function GET() {
  try {
    const merchants = getAllMerchantsWithStatus();
    return NextResponse.json({
      success: true,
      data: merchants,
      count: merchants.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch merchants" },
      { status: 500 }
    );
  }
}
