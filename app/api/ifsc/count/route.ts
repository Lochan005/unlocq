import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { gunzipSync } from "zlib";

export const dynamic = "force-dynamic";

export async function GET() {
  const dataDir = path.join(process.cwd(), "data", "ifsc");
  const ifscPath = path.join(dataDir, "IFSC.json.gz");
  const mergedPath = path.join(dataDir, "merged_banks.json");

  const result: {
    ifscFileCount: number;
    mergedBanksCount: number;
    uniqueNewIfscInMerged: number;
    totalUniqueIfsc: number;
    error?: string;
  } = {
    ifscFileCount: 0,
    mergedBanksCount: 0,
    uniqueNewIfscInMerged: 0,
    totalUniqueIfsc: 0,
  };

  try {
    if (fs.existsSync(ifscPath)) {
      const buffer = fs.readFileSync(ifscPath);
      const raw = gunzipSync(buffer).toString("utf-8");
      const cleaned = raw.replace(/:\s*NaN\s*([,}])/g, ": null$1");
      const data = JSON.parse(cleaned);
      const arr = Array.isArray(data) ? data : [];
      result.ifscFileCount = arr.length;

      const ifscSet = new Set<string>();
      for (const r of arr) {
        if (r.ifsc) ifscSet.add(r.ifsc.toUpperCase());
      }

      if (fs.existsSync(mergedPath)) {
        const mergedRaw = fs.readFileSync(mergedPath, "utf-8");
        const mergedData = JSON.parse(mergedRaw) as Record<
          string,
          { new_ifsc?: string }
        >;
        result.mergedBanksCount = Object.keys(mergedData).length;

        const mergedNewIfscSet = new Set<string>();
        for (const entry of Object.values(mergedData)) {
          if (entry.new_ifsc) {
            mergedNewIfscSet.add(entry.new_ifsc.toUpperCase());
          }
        }
        result.uniqueNewIfscInMerged = mergedNewIfscSet.size;

        for (const newIfsc of mergedNewIfscSet) {
          if (!ifscSet.has(newIfsc)) {
            ifscSet.add(newIfsc);
          }
        }
      }

      result.totalUniqueIfsc = ifscSet.size;
    } else {
      result.error = "IFSC.json.gz not found";
    }
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(result);
}
