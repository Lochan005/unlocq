import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export type MergedRecord = {
  old_bank_code: string;
  old_bank_name: string;
  new_ifsc: string;
  new_bank_code: string;
  new_bank_name: string;
  old_micr: string;
  new_micr: string;
};

export async function GET(request: NextRequest) {
  const ifsc = request.nextUrl.searchParams.get("ifsc")?.trim().toUpperCase() ?? "";
  if (ifsc.length !== 11) {
    return NextResponse.json({ merged: null });
  }

  const dataPath = path.join(process.cwd(), "data", "ifsc", "merged_banks.json");
  try {
    if (!fs.existsSync(dataPath)) return NextResponse.json({ merged: null });
    const raw = fs.readFileSync(dataPath, "utf-8");
    const data = JSON.parse(raw) as Record<string, MergedRecord>;
    const merged = data[ifsc] ?? null;
    return NextResponse.json({ merged });
  } catch {
    return NextResponse.json({ merged: null });
  }
}
