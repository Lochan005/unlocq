import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export type SubmemberRecord = {
  bank_code: string;
  bank_name: string;
  type: string;
};

export async function GET(request: NextRequest) {
  const ifsc = request.nextUrl.searchParams.get("ifsc")?.trim().toUpperCase() ?? "";
  if (ifsc.length !== 11) {
    return NextResponse.json({ submember: null });
  }

  const dataPath = path.join(process.cwd(), "data", "ifsc", "submember_banks.json");
  try {
    if (!fs.existsSync(dataPath)) return NextResponse.json({ submember: null });
    const raw = fs.readFileSync(dataPath, "utf-8");
    const data = JSON.parse(raw) as Record<string, SubmemberRecord>;
    const submember = data[ifsc] ?? null;
    return NextResponse.json({ submember });
  } catch {
    return NextResponse.json({ submember: null });
  }
}
