import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

type MissingDetailsPayload = {
  ifsc: string;
  bank?: string;
  branch?: string;
  city?: string;
  state?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MissingDetailsPayload;
    const { ifsc, bank, branch, city, state } = body;
    if (!ifsc || typeof ifsc !== "string" || ifsc.length !== 11) {
      return NextResponse.json({ ok: false, error: "Invalid IFSC" }, { status: 400 });
    }
    const dataDir = path.join(process.cwd(), "data", "ifsc");
    const filePath = path.join(dataDir, "missing_details.json");
    const entry = {
      ifsc: ifsc.toUpperCase(),
      bank: bank ?? "",
      branch: branch ?? "",
      city: city ?? "",
      state: state ?? "",
      submittedAt: new Date().toISOString(),
    };
    let list: typeof entry[] = [];
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        list = JSON.parse(raw);
      } catch {
        list = [];
      }
    }
    list.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
