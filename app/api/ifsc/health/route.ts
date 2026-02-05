import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET() {
  const dataDir = path.join(process.cwd(), "data", "ifsc");
  const ifscPath = path.join(dataDir, "IFSC.json.gz");
  
  return NextResponse.json({
    status: "ok",
    dataDir,
    ifscPath,
    fileExists: fs.existsSync(ifscPath),
    fileSize: fs.existsSync(ifscPath) ? fs.statSync(ifscPath).size : 0,
  });
}
