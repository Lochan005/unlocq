import { NextResponse } from "next/server";
import { getCatalogue } from "@/app/lib/rewards";
import type { MerchantCategory } from "@/app/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as MerchantCategory | null;

    const items = getCatalogue(category ?? undefined);

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch catalogue" },
      { status: 500 }
    );
  }
}
